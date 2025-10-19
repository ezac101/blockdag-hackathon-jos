import type { IPFSConfig, AsyncResult } from '../types/common.types.js';
import type { IPFSValidationResult } from '../types/upload.types.js';

/**
 * IPFS Service (Pinata-based)
 * Handles IPFS operations using Pinata API for reliable storage
 * Compliance: ISO 27001 A.10 (Cryptographic controls), A.12 (Operations security)
 */
export class IPFSService {
  private config: IPFSConfig;
  private pinataApiKey: string;
  private pinataSecretKey: string;
  private pinataJWT: string;
  private pinataGateway: string = 'https://gateway.pinata.cloud';

  constructor(config: IPFSConfig) {
    this.config = config;
    this.pinataApiKey = process.env.PINATA_API_KEY || '';
    this.pinataSecretKey = process.env.PINATA_API_SECRET || '';
    this.pinataJWT = process.env.PINATA_JWT || '';

    if (!this.pinataJWT && (!this.pinataApiKey || !this.pinataSecretKey)) {
      console.warn('⚠️  Pinata credentials not configured. IPFS operations may fail.');
    }
  }

  /**
   * Validate IPFS CID
   * NIST SP 800-53 SI-10: Information input validation
   */
  async validateCID(cid: string): Promise<AsyncResult<IPFSValidationResult>> {
    try {
      // Validate CID format (v0 or v1)
      const cidRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[A-Za-z2-7]{58})$/;
      if (!cidRegex.test(cid)) {
        return {
          success: false,
          error: 'Invalid IPFS CID format',
        };
      }

      // Check if content exists by fetching headers
      const response = await fetch(`${this.pinataGateway}/ipfs/${cid}`, {
        method: 'HEAD',
      });

      if (!response.ok) {
        return {
          success: true,
          data: {
            isValid: true,
            exists: false,
            error: 'Content not found on IPFS',
          },
        };
      }

      const size = parseInt(response.headers.get('content-length') || '0');

      return {
        success: true,
        data: {
          isValid: true,
          exists: true,
          size,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: `IPFS validation failed: ${error.message}`,
      };
    }
  }

  /**
   * Upload file to IPFS via Pinata
   * Used during upload flow
   */
  async uploadFile(fileBuffer: Buffer): Promise<AsyncResult<{ cid: string; size: number }>> {
    try {
      // Create form data
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(fileBuffer)]);
      formData.append('file', blob, 'encrypted-file.bin');

      // Optional metadata
      const metadata = JSON.stringify({
        name: `quantum-drop-${Date.now()}`,
      });
      formData.append('pinataMetadata', metadata);

      // Pin to Pinata
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Pinata upload failed: ${response.status} ${error}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          cid: data.IpfsHash,
          size: fileBuffer.length,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to upload file to IPFS: ${error.message}`,
      };
    }
  }

  /**
   * Fetch encrypted file from IPFS via Pinata gateway
   * Used by receiver during claim flow
   */
  async fetchFile(cid: string): Promise<AsyncResult<Uint8Array>> {
    try {
      const response = await fetch(`${this.pinataGateway}/ipfs/${cid}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to fetch file from IPFS: ${error.message}`,
      };
    }
  }

  /**
   * Pin content to IPFS (Pinata)
   * Ensures content persistence
   */
  async pinContent(cid: string): Promise<AsyncResult<boolean>> {
    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinByHash', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hashToPin: cid,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Pinata pin failed: ${response.status} ${error}`);
      }

      return {
        success: true,
        data: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to pin content: ${error.message}`,
      };
    }
  }

  /**
   * Get IPFS gateway URL for CID
   * Used for generating explorer links
   */
  getGatewayUrl(cid: string): string {
    return `https://ipfs.io/ipfs/${cid}`;
  }
}
