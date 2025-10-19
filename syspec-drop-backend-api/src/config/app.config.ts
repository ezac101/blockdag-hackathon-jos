import 'dotenv/config';
import type { AppConfig } from '../types/common.types.js';

/**
 * Application Configuration
 * Loads environment variables with defaults
 * Compliance: ISO 27001 A.12.1 (Operational procedures)
 */
export const config: AppConfig = {
  blockdag: {
    rpcUrl: process.env.BLOCKDAG_RPC_URL || 'https://rpc-testnet.bdagscan.com',
    chainId: parseInt(process.env.BLOCKDAG_CHAIN_ID || '1', 10),
    contractAddress:
      process.env.BLOCKDAG_CONTRACT_ADDRESS ||
      process.env.QUANTUM_DROP_CONTRACT_ADDRESS ||
      '',
    privateKey: process.env.BLOCKDAG_PRIVATE_KEY || '',
  },
  ipfs: {
    host: process.env.IPFS_HOST || 'ipfs.infura.io',
    port: parseInt(process.env.IPFS_PORT || '5001', 10),
    protocol: process.env.IPFS_PROTOCOL || 'https',
    ...(process.env.PINATA_API_KEY && { pinataApiKey: process.env.PINATA_API_KEY }),
    ...(process.env.PINATA_SECRET_KEY && { pinataSecretKey: process.env.PINATA_SECRET_KEY }),
  },
  defaultExpiryDays: parseInt(process.env.DEFAULT_EXPIRY_DAYS || '7', 10),
  maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '100', 10),
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
};

/**
 * Validate configuration on startup
 */
export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.blockdag.contractAddress) {
    errors.push('BLOCKDAG_CONTRACT_ADDRESS (or QUANTUM_DROP_CONTRACT_ADDRESS) is required');
  }

  const { privateKey } = config.blockdag;
  if (!privateKey) {
    errors.push('BLOCKDAG_PRIVATE_KEY is required and must be valid');
  } else {
    const normalizedKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    if (normalizedKey.length !== 64) {
      errors.push('BLOCKDAG_PRIVATE_KEY must be a 32-byte hex string');
    }
  }

  if (!config.blockdag.rpcUrl) {
    errors.push('BLOCKDAG_RPC_URL is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }

  console.log('✅ Configuration validated successfully');
}
