/**
 * Common Types
 * Shared types across the application
 */

export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
}

export interface BlockDAGConfig {
  rpcUrl: string;
  chainId: number;
  contractAddress: string;
  privateKey: string; // Ephemeral key for anonymous transactions
}

export interface IPFSConfig {
  host: string;
  port: number;
  protocol: string;
  pinataApiKey?: string;
  pinataSecretKey?: string;
}

export interface AppConfig {
  blockdag: BlockDAGConfig;
  ipfs: IPFSConfig;
  defaultExpiryDays: number;
  maxFileSizeMB: number;
  allowedOrigins: string[];
}

export type AsyncResult<T> = Promise<{ success: true; data: T } | { success: false; error: string }>;
