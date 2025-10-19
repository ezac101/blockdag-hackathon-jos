/**
 * Claim Route Types
 * Defines types for anonymous file claim flow
 */

export interface ClaimRequestBody {
  dropId: string; // Drop identifier (UUID)
  passphrase: string; // Passphrase (plaintext)
}

export interface ClaimResponse {
  success: boolean;
  fileName: string; // Original file name
  fileContent: string; // Base64-encoded decrypted file
  message: string;
}

export interface DropMetadata {
  ipfsHash: string;
  encryptedSymKey: string;
  owner: string;
  createdAt: number;
  isActive: boolean;
  claimed: boolean;
}
