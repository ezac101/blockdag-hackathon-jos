import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type {
  UploadRequestBody,
  UploadResponse,
  BlockDAGMetadata,
} from '../types/upload.types.js';
import type { ErrorResponse } from '../types/common.types.js';
import { IPFSService } from '../services/ipfs.service.js';
import { BlockDAGService } from '../services/blockdag.service.js';
import { randomBytes, createCipheriv } from 'crypto';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import {
  securityMiddleware,
  anonymousLoggingMiddleware,
} from '../middlewares/security.middleware.js';

/**
 * Upload Route
 * Handles file upload, IPFS storage, and on-chain metadata creation
 * Flow: File → Encrypt (ML-KEM + AES) → IPFS → Generate Passphrase → BlockDAG
 * 
 * Compliance:
 * - NIST FIPS 203 (ML-KEM encryption - future enhancement)
 * - NIST SP 800-53 SI-10 (Input validation)
 * - ISO 27001 A.10 (Cryptography), A.12.4 (Logging)
 */
export default async function uploadRoutes(fastify: FastifyInstance) {
  // Use singleton services from fastify instance (shared across all routes)
  const ipfsService = (fastify as any).ipfs as IPFSService;
  const blockdagService = (fastify as any).blockdag as BlockDAGService;

  // Schema for request validation
  const uploadSchema = {
    body: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', minLength: 1 }, // Base64-encoded file
      },
    },
  };

  /**
   * Generate a secure random passphrase (6-word diceware-style)
   */
  function generatePassphrase(): string {
    // Simple word list for demo (production: use EFF diceware list)
    const words = [
      'quantum', 'secure', 'drop', 'anonymous', 'encrypted', 'blockdag',
      'whistle', 'blow', 'safe', 'data', 'privacy', 'freedom',
      'crypto', 'shield', 'guardian', 'vault', 'lock', 'key',
    ];
    
    const passphrase: string[] = [];
    for (let i = 0; i < 6; i++) {
      const byte = randomBytes(1)[0];
      if (byte !== undefined) {
        const randomIndex = byte % words.length;
        const word = words[randomIndex];
        if (word !== undefined) {
          passphrase.push(word);
        }
      }
    }
    
    return passphrase.join('-');
  }

  /**
   * Encrypt file with AES-256-GCM
   * Returns: { encryptedData, iv, authTag, key }
   */
  function encryptFile(fileBuffer: Buffer): {
    encryptedData: Buffer;
    iv: Buffer;
    authTag: Buffer;
    key: Buffer;
  } {
    // Generate random AES-256 key (32 bytes)
    const key = randomBytes(32);
    
    // Generate random IV (12 bytes for GCM)
    const iv = randomBytes(12);
    
    // Create cipher
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    
    // Encrypt data
    const encrypted = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final(),
    ]);
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    return {
      encryptedData: encrypted,
      iv,
      authTag,
      key,
    };
  }

  /**
   * Derive encryption key from passphrase (simplified ML-KEM placeholder)
   * In production: use actual ML-KEM-768 key encapsulation
   * For MVP: use passphrase-derived key encryption
   */
  function encryptSymmetricKey(symmetricKey: Buffer, passphrase: string): string {
    // Use passphrase hash as KEK (Key Encryption Key)
    const passphraseBytes = Buffer.from(passphrase, 'utf-8');
    const kek = Buffer.from(keccak_256(passphraseBytes));
    
    // Encrypt symmetric key with KEK using AES-256-GCM
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', kek, iv);
    
    const encryptedKey = Buffer.concat([
      cipher.update(symmetricKey),
      cipher.final(),
    ]);
    
    const authTag = cipher.getAuthTag();
    
    // Combine: iv + authTag + encryptedKey
    const combined = Buffer.concat([iv, authTag, encryptedKey]);
    
    return combined.toString('base64');
  }

  /**
   * POST /api/upload
   * Upload file to IPFS and store metadata on BlockDAG
   */
  fastify.post<{ Body: UploadRequestBody }>(
    '/',
    {
      schema: uploadSchema,
      preHandler: [securityMiddleware, anonymousLoggingMiddleware],
    },
    async (
      request: FastifyRequest<{ Body: UploadRequestBody }>,
      reply: FastifyReply
    ): Promise<UploadResponse | ErrorResponse> => {
      try {
        const { file } = request.body;

        // Step 1: Generate passphrase
        const passphrase = generatePassphrase();
        const passphraseBytes = Buffer.from(passphrase, 'utf-8');
        const passphraseHash = bytesToHex(keccak_256(passphraseBytes));

        console.log('=== UPLOAD: Step 1 - Passphrase ===');
        console.log('Passphrase:', passphrase);
        console.log('Passphrase hash:', passphraseHash);
        console.log('Hash length:', passphraseHash.length);

        request.log.info('Generated passphrase for drop');

        // Step 2: Encrypt file with AES-256-GCM
        const fileBuffer = Buffer.from(file, 'base64');
        const { encryptedData, iv, authTag, key } = encryptFile(fileBuffer);

        // Combine encrypted data with IV and auth tag for IPFS storage
        // Format: iv (12 bytes) + authTag (16 bytes) + encryptedData
        const encryptedFile = Buffer.concat([iv, authTag, encryptedData]);

        request.log.info('File encrypted with AES-256-GCM');

        // Step 3: Upload encrypted file to IPFS
        const ipfsResult = await ipfsService.uploadFile(encryptedFile);

        if (!ipfsResult.success || !ipfsResult.data) {
          return reply.code(500).send({
            success: false,
            error: !ipfsResult.success ? (ipfsResult as any).error : 'Failed to upload to IPFS',
            code: 'IPFS_UPLOAD_FAILED',
          });
        }

        const ipfsHash = ipfsResult.data.cid;
        request.log.info({ ipfsHash }, 'Encrypted file uploaded to IPFS');

        // Step 4: Encrypt symmetric key with passphrase (ML-KEM placeholder)
        const encryptedSymKey = encryptSymmetricKey(key, passphrase);

        // Step 5: Generate unique short dropId (8 chars: easy to type)
        // Using base36 (0-9, a-z) for human-friendly IDs
        const dropId = randomBytes(4).toString('hex').substring(0, 8).toLowerCase();

        console.log('=== UPLOAD: Step 5 - Drop ID ===');
        console.log('Generated dropId:', dropId);
        console.log('DropId length:', dropId.length);

        // Step 6: Store metadata on BlockDAG
        const metadata: BlockDAGMetadata = {
          dropId,
          ipfsHash,
          encryptedSymKey,
          passphraseHash,
        };

        console.log('=== UPLOAD: Step 6 - Creating Drop on BlockDAG ===');
        console.log('Metadata:', {
          dropId: metadata.dropId,
          ipfsHash: metadata.ipfsHash,
          encryptedSymKeyLength: metadata.encryptedSymKey.length,
          passphraseHash: metadata.passphraseHash,
        });

        const blockdagResult = await blockdagService.createDrop(metadata);

        console.log('=== UPLOAD: BlockDAG Result ===');
        console.log('Result:', blockdagResult);

        if (!blockdagResult.success || !blockdagResult.data) {
          return reply.code(500).send({
            success: false,
            error: !blockdagResult.success ? (blockdagResult as any).error : 'Failed to create drop on BlockDAG',
            code: 'BLOCKDAG_CREATE_FAILED',
          });
        }

        const txHash = blockdagResult.data.txHash;
        const explorerUrl = blockdagService.getExplorerUrl(txHash);

        request.log.info({ dropId, txHash }, 'Drop created successfully');

        return reply.code(201).send({
          success: true,
          dropId,
          ipfsHash,
          passphrase,
          txHash,
          explorerUrl,
          message: 'Drop created successfully. Share the passphrase securely.',
        });
      } catch (error: any) {
        request.log.error({ error: error.message }, 'Upload failed');

        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          code: 'UPLOAD_ERROR',
        });
      }
    }
  );
}
