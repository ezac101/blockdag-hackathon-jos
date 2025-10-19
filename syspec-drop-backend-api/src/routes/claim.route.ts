import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { ClaimRequestBody, ClaimResponse } from '../types/claim.types.js';
import type { ErrorResponse } from '../types/common.types.js';
import { BlockDAGService } from '../services/blockdag.service.js';
import { IPFSService } from '../services/ipfs.service.js';
import { createDecipheriv } from 'crypto';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import {
  securityMiddleware,
  anonymousLoggingMiddleware,
} from '../middlewares/security.middleware.js';

/**
 * Detect file type from magic bytes (file signature)
 */
function detectFileType(buffer: Buffer): { ext: string; mimeType: string } {
  // Check magic bytes (first few bytes of file)
  const header = buffer.toString('hex', 0, 4);
  
  // ZIP-based formats (Office files)
  if (buffer.toString('ascii', 0, 2) === 'PK') {
    // Search for Office-specific markers in raw bytes (not UTF-8 decoded)
    // These are ASCII strings that appear in the ZIP directory listings
    const searchLength = Math.min(4000, buffer.length); // Search first 4KB
    const content = buffer.toString('binary', 0, searchLength); // Use 'binary' to preserve bytes
    
    if (content.includes('word/')) return { 
      ext: 'docx', 
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    };
    if (content.includes('xl/')) return { 
      ext: 'xlsx', 
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    };
    if (content.includes('ppt/')) return { 
      ext: 'pptx', 
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
    };
    return { ext: 'zip', mimeType: 'application/zip' };
  }
  
  // Common file types
  if (header.startsWith('89504e47')) return { ext: 'png', mimeType: 'image/png' };
  if (header.startsWith('ffd8ffe0') || header.startsWith('ffd8ffe1') || header.startsWith('ffd8ffe2')) {
    return { ext: 'jpg', mimeType: 'image/jpeg' };
  }
  if (header.startsWith('25504446')) return { ext: 'pdf', mimeType: 'application/pdf' };
  if (header.startsWith('47494638')) return { ext: 'gif', mimeType: 'image/gif' };
  if (buffer.toString('ascii', 0, 4) === '%!PS') return { ext: 'ps', mimeType: 'application/postscript' };
  
  // Text files
  if (header.startsWith('efbbbf') || isTextFile(buffer)) {
    return { ext: 'txt', mimeType: 'text/plain' };
  }
  
  // Default binary
  return { ext: 'bin', mimeType: 'application/octet-stream' };
}

/**
 * Check if buffer contains mostly printable text
 */
function isTextFile(buffer: Buffer): boolean {
  const sample = buffer.subarray(0, Math.min(512, buffer.length));
  let printable = 0;
  
  for (const byte of sample) {
    if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) {
      printable++;
    }
  }
  
  return printable / sample.length > 0.85; // 85% printable = text file
}

/**
 * Claim Route
 * Handles file claim with passphrase verification and metadata burning
 * Flow: Receiver → Hash Passphrase → Verify On-Chain → Retrieve IPFS → Decrypt → Burn Metadata
 * 
 * Compliance:
 * - NIST SP 800-53 AC-3 (Access enforcement - one-time only)
 * - ISO 27001 A.12.3 (Information backup - data deletion)
 */
export default async function claimRoutes(fastify: FastifyInstance) {
  // Use singleton services from fastify instance (shared across all routes)
  const blockdagService = (fastify as any).blockdag as BlockDAGService;
  const ipfsService = (fastify as any).ipfs as IPFSService;

  /**
   * Decrypt symmetric key using passphrase (ML-KEM placeholder)
   * Inverse of encryptSymmetricKey in upload route
   */
  function decryptSymmetricKey(encryptedSymKey: string, passphrase: string): Buffer {
    // Decode base64
    const combined = Buffer.from(encryptedSymKey, 'base64');
    
    // Extract: iv (12) + authTag (16) + encryptedKey
    const iv = combined.subarray(0, 12);
    const authTag = combined.subarray(12, 28);
    const encryptedKey = combined.subarray(28);
    
    // Derive KEK from passphrase
    const passphraseBytes = Buffer.from(passphrase, 'utf-8');
    const kek = Buffer.from(keccak_256(passphraseBytes));
    
    // Decrypt
    const decipher = createDecipheriv('aes-256-gcm', kek, iv);
    decipher.setAuthTag(authTag);
    
    const symmetricKey = Buffer.concat([
      decipher.update(encryptedKey),
      decipher.final(),
    ]);
    
    return symmetricKey;
  }

  /**
   * Decrypt file with AES-256-GCM
   * Inverse of encryptFile in upload route
   */
  function decryptFile(encryptedFile: Buffer, symmetricKey: Buffer): Buffer {
    // Extract: iv (12) + authTag (16) + encryptedData
    const iv = encryptedFile.subarray(0, 12);
    const authTag = encryptedFile.subarray(12, 28);
    const encryptedData = encryptedFile.subarray(28);
    
    // Decrypt
    const decipher = createDecipheriv('aes-256-gcm', symmetricKey, iv);
    decipher.setAuthTag(authTag);
    
    const decryptedData = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);
    
    return decryptedData;
  }

  // Schema for request validation
  const claimSchema = {
    body: {
      type: 'object',
      required: ['dropId', 'passphrase'],
      properties: {
        dropId: { type: 'string', minLength: 1 },
        passphrase: { type: 'string', minLength: 1 },
      },
    },
  };

  /**
   * POST /api/claim
   * Claim encrypted file and burn metadata (one-time access)
   */
  fastify.post<{ Body: ClaimRequestBody }>(
    '/',
    {
      schema: claimSchema,
      preHandler: [securityMiddleware, anonymousLoggingMiddleware],
    },
    async (
      request: FastifyRequest<{ Body: ClaimRequestBody }>,
      reply: FastifyReply
    ): Promise<ClaimResponse | ErrorResponse> => {
      try {
        const { dropId, passphrase } = request.body;

        console.log('=== CLAIM: Received Request ===');
        console.log('DropId:', dropId);
        console.log('DropId type:', typeof dropId);
        console.log('DropId length:', dropId?.length);
        console.log('Passphrase:', passphrase);

        // Step 1: Hash passphrase
        const passphraseBytes = Buffer.from(passphrase, 'utf-8');
        const passphraseHash = bytesToHex(keccak_256(passphraseBytes));
        
        console.log('=== CLAIM: Step 1 - Hash Passphrase ===');
        console.log('Passphrase hash:', passphraseHash);
        console.log('Hash length:', passphraseHash.length);
        
        request.log.info({ dropId }, 'Attempting to claim drop');

        // Step 2: V3 - Call claimDrop() which verifies passphrase and tracks claims
        // This returns the data AND updates on-chain state (claimed=true, claimCount++)
        const claimResult = await blockdagService.claimDrop(dropId, passphraseHash);

        if (!claimResult.success || !claimResult.data) {
          // Check specific error codes
          const error = !claimResult.success ? (claimResult as any).error : 'Failed to claim drop';
          
          if (error.includes('Invalid passphrase')) {
            return reply.code(401).send({
              success: false,
              error: 'Invalid passphrase',
              code: 'INVALID_PASSPHRASE',
            });
          }
          
          if (error.includes('not exist')) {
            return reply.code(404).send({
              success: false,
              error: 'Drop not found',
              code: 'DROP_NOT_FOUND',
            });
          }
          
          if (error.includes('not active')) {
            return reply.code(403).send({
              success: false,
              error: 'Drop has been deactivated by owner',
              code: 'DROP_INACTIVE',
            });
          }
          
          return reply.code(500).send({
            success: false,
            error: error,
            code: 'CLAIM_FAILED',
          });
        }

        const { ipfsHash, encryptedSymKey, txHash } = claimResult.data;
        request.log.info({ dropId, txHash }, 'V3: Claim transaction confirmed (unlimited access preserved)');

        // Step 3: Retrieve encrypted file from IPFS
        request.log.info({ ipfsHash }, 'Fetching file from IPFS');
        const fileResult = await ipfsService.fetchFile(ipfsHash);

        if (!fileResult.success || !fileResult.data) {
          return reply.code(500).send({
            success: false,
            error: !fileResult.success ? (fileResult as any).error : 'Failed to retrieve file from IPFS',
            code: 'IPFS_FETCH_FAILED',
          });
        }

        // Step 4: Validate encrypted key is available
        if (!encryptedSymKey || encryptedSymKey === '') {
          return reply.code(500).send({
            success: false,
            error: 'Encrypted key not available from contract',
            code: 'KEY_NOT_AVAILABLE',
          });
        }

        // Step 5: Decrypt symmetric key using passphrase
        const symmetricKey = decryptSymmetricKey(encryptedSymKey, passphrase);
        request.log.info('Symmetric key decrypted');

        // Step 6: Decrypt file with symmetric key
        const encryptedFileBuffer = Buffer.from(fileResult.data);
        const decryptedFile = decryptFile(encryptedFileBuffer, symmetricKey);

        // Step 7: Detect file type from magic bytes
        const { ext, mimeType } = detectFileType(decryptedFile);
        const fileName = `drop-${dropId.substring(0, 8)}.${ext}`;

        request.log.info({ 
          dropId, 
          fileType: ext, 
          fileSize: decryptedFile.length 
        }, 'V3: File decrypted and claimed successfully (can be claimed again)');

        // Check if user wants JSON response (for backward compatibility)
        const format = (request.query as any)?.format;
        if (format === 'json') {
          return reply.code(200).send({
            success: true,
            fileName,
            fileContent: decryptedFile.toString('base64'),
            txHash,
            fileType: ext,
            mimeType,
            message: 'Drop claimed successfully. File decrypted.',
          });
        }

        // Default: Return actual file download
        reply
          .code(200)
          .header('Content-Type', mimeType)
          .header('Content-Disposition', `attachment; filename="${fileName}"`)
          .header('Content-Length', decryptedFile.length)
          .header('X-Transaction-Hash', txHash)
          .header('X-Drop-Status', 'claimed')
          .header('X-File-Type', ext)
          .send(decryptedFile);

        return reply;
      } catch (error: any) {
        request.log.error({ error: error.message }, 'Claim failed');

        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          code: 'CLAIM_ERROR',
        });
      }
    }
  );
}
