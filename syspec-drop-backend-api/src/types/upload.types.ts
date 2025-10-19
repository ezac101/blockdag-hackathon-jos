/**
 * Upload Route Types
 * Defines types for anonymous file upload flow
 */

export interface UploadRequestBody {
  file: string; // Base64-encoded file content
}

export interface UploadResponse {
  success: boolean;
  dropId: string;
  ipfsHash: string;
  passphrase: string; // Only show once
  txHash: string;
  explorerUrl: string;
  message: string;
}

export interface BlockDAGMetadata {
  dropId: string;
  ipfsHash: string;
  encryptedSymKey: string;
  passphraseHash: string;
}

export interface IPFSValidationResult {
  isValid: boolean;
  exists: boolean;
  size?: number;
  error?: string;
}
