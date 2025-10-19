import { ethers } from 'ethers';
import type { BlockDAGConfig, AsyncResult } from '../types/common.types.js';
import type { BlockDAGMetadata } from '../types/upload.types.js';
import type { DropMetadata } from '../types/claim.types.js';

/**
 * BlockDAG Service
 * Handles smart contract interactions on BlockDAG Testnet
 * Compliance: NIST SP 800-53 AC-3 (Access enforcement), ISO 27001 A.12 (Audit logging)
 */
export class BlockDAGService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private config: BlockDAGConfig;

  // Solidity ABI for QuantumDropV3 contract
  private readonly contractABI = [
    'function createDrop(string memory dropId, string memory ipfsHash, string memory encryptedSymKey, bytes32 passphraseHash) external',
    'function claimDrop(string memory dropId, bytes32 passphraseHash) external returns (string memory ipfsHash, string memory encryptedSymKey)',
    'function getDrop(string memory dropId) external view returns (string memory ipfsHash, string memory encryptedSymKey, address owner, uint256 createdAt, bool isActive, bool claimed, uint256 claimCount)',
    'function getDropStatus(string memory dropId) external view returns (string memory ipfsHash, address owner, uint256 createdAt, bool isActive, bool claimed)',
    'function isValidDrop(string memory dropId) external view returns (bool)',
    'function getPassphraseHash(string memory dropId) external view returns (bytes32)',
    'function getClaimStats(string memory dropId, address claimer) external view returns (uint256 claimCount, uint256 lastClaimedAt, uint256 claimsByAddress)',
    'function getStats() external view returns (uint256 totalDropsCreated, uint256 totalClaimsMade, uint256 activeDrops)',
    'event DropCreated(string indexed dropId, string ipfsHash, address indexed owner, uint256 createdAt)',
    'event DropClaimed(string indexed dropId, address indexed claimer, uint256 claimedAt, uint256 claimNumber)',
  ];

  constructor(config: BlockDAGConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl, config.chainId);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    this.contract = new ethers.Contract(
      config.contractAddress,
      this.contractABI,
      this.wallet
    );

    // Verify contract on initialization
    this.verifyContract();
  }

  private async verifyContract() {
    try {
      console.log('Verifying contract at:', this.config.contractAddress);
      const code = await this.provider.getCode(this.config.contractAddress);
      console.log('Contract bytecode length:', code.length);
      
      if (code === '0x') {
        console.error('⚠️  WARNING: No contract found at this address!');
      } else {
        console.log('✅ Contract exists');
        
        // Try to call a view function to verify it's working
        try {
          const stats = await (this.contract as any).getStats();
          console.log('✅ Contract is responsive. Stats:', {
            total: stats.totalDropsCreated.toString(),
            claimed: stats.totalDropsClaimed.toString(),
            active: stats.activeDrops.toString(),
          });
        } catch (e: any) {
          console.error('⚠️  Contract exists but getStats() failed:', e.message);
        }
      }
    } catch (error: any) {
      console.error('Contract verification error:', error.message);
    }
  }

  /**
   * Create drop on BlockDAG
   * Called during upload flow (sender)
   */
  async createDrop(
    metadata: BlockDAGMetadata
  ): Promise<AsyncResult<{ txHash: string }>> {
    try {
      // passphraseHash is already a hex string from keccak_256
      // Just ensure it has 0x prefix for bytes32
      const passphraseHashBytes32 = metadata.passphraseHash.startsWith('0x') 
        ? metadata.passphraseHash 
        : `0x${metadata.passphraseHash}`;

      console.log('Creating drop with params:', {
        dropId: metadata.dropId,
        ipfsHash: metadata.ipfsHash,
        encryptedSymKey: metadata.encryptedSymKey.substring(0, 20) + '...',
        passphraseHash: passphraseHashBytes32,
        contractAddress: this.config.contractAddress,
      });

      // Estimate gas first to catch errors early
      const gasEstimate = await (this.contract as any).createDrop.estimateGas(
        metadata.dropId,
        metadata.ipfsHash,
        metadata.encryptedSymKey,
        passphraseHashBytes32
      );

      console.log('Gas estimate:', gasEstimate.toString());

      // Call smart contract
      const tx = await (this.contract as any).createDrop(
        metadata.dropId,
        metadata.ipfsHash,
        metadata.encryptedSymKey,
        passphraseHashBytes32,
        {
          gasLimit: gasEstimate * 2n, // 2x the estimate for safety
        }
      );

      console.log('Transaction sent:', tx.hash);
      console.log('Transaction details:', {
        from: tx.from,
        to: tx.to,
        data: tx.data?.substring(0, 100) + '...',
        nonce: tx.nonce,
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      console.log('Transaction confirmed in block:', receipt.blockNumber);
      console.log('Transaction status:', receipt.status === 1 ? 'SUCCESS' : 'FAILED');
      console.log('Gas used:', receipt.gasUsed.toString());
      
      // Check if drop was actually created by calling getDrop
      try {
        const verifyDrop = await (this.contract as any).getDrop(metadata.dropId);
        console.log('✅ V3: Drop verified on-chain:', {
          dropId: metadata.dropId,
          ipfsHash: verifyDrop.ipfsHash,
          owner: verifyDrop.owner,
          isActive: verifyDrop.isActive,
          encryptedSymKey: verifyDrop.encryptedSymKey ? 'Present' : 'Missing',
          claimCount: verifyDrop.claimCount.toString(),
        });
      } catch (verifyError: any) {
        console.error('⚠️ Drop creation succeeded but verification failed:', verifyError.message);
      }

      console.log('✅ V3: Encrypted key stored on-chain (no cache needed)');

      return {
        success: true,
        data: {
          txHash: receipt.hash,
        },
      };
    } catch (error: any) {
      console.error('CreateDrop error details:', {
        message: error.message,
        code: error.code,
        data: error.data,
        transaction: error.transaction,
      });

      return {
        success: false,
        error: `BlockDAG transaction failed: ${error.message}`,
      };
    }
  }

  /**
   * Claim drop on BlockDAG (V3)
   * Called during claim flow (receiver)
   * V3: Metadata is NEVER burned - unlimited claims allowed!
   */
  async claimDrop(
    dropId: string,
    passphraseHash: string
  ): Promise<AsyncResult<{ ipfsHash: string; encryptedSymKey: string; txHash: string }>> {
    try {
      // passphraseHash is already a hex string from keccak_256
      // Just ensure it has 0x prefix for bytes32
      const passphraseHashBytes32 = passphraseHash.startsWith('0x') 
        ? passphraseHash 
        : `0x${passphraseHash}`;

      console.log('V3: Claiming drop (unlimited claims):', { dropId, passphraseHash: passphraseHashBytes32 });

      // FIRST: Check if drop exists and is active
      let drop;
      try {
        drop = await (this.contract as any).getDrop(dropId);
        console.log('V3: Drop found:', {
          ipfsHash: drop.ipfsHash,
          owner: drop.owner,
          isActive: drop.isActive,
          claimed: drop.claimed,
          claimCount: drop.claimCount.toString(),
        });
      } catch (error: any) {
        return {
          success: false,
          error: 'Drop does not exist',
        };
      }

      // V3: Only check if active (claimed status doesn't prevent re-claims!)
      if (!drop.isActive) {
        return {
          success: false,
          error: 'Drop is not active',
        };
      }

      // V3: Data is available directly from contract (never burned)
      const ipfsHash = drop.ipfsHash;
      const encryptedSymKey = drop.encryptedSymKey;

      console.log('V3: Claiming with unlimited access:', { 
        ipfsHash, 
        encryptedSymKeyLength: encryptedSymKey.length,
        previousClaims: drop.claimCount.toString()
      });

      // Call claimDrop to verify passphrase and update claim counter
      try {
        const tx = await (this.contract as any).claimDrop(
          dropId,
          passphraseHashBytes32,
          {
            gasLimit: 300000,
          }
        );

        console.log('V3: Claim transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('V3: Claim transaction confirmed (metadata preserved):', receipt.hash);

        return {
          success: true,
          data: {
            ipfsHash,
            encryptedSymKey,
            txHash: receipt.hash,
          },
        };
      } catch (claimError: any) {
        // Parse the revert reason
        console.error('V3: Claim transaction failed:', claimError.message);
        
        if (claimError.message.includes('Invalid passphrase')) {
          return {
            success: false,
            error: 'Invalid passphrase',
          };
        }
        
        if (claimError.message.includes('inactive')) {
          return {
            success: false,
            error: 'Drop is not active',
          };
        }

        return {
          success: false,
          error: `Claim transaction failed: ${claimError.message}`,
        };
      }
    } catch (error: any) {
      console.error('V3: Claim error:', error);
      return {
        success: false,
        error: `Claim failed: ${error.message}`,
      };
    }
  }

  /**
   * Get drop metadata (read-only)
   * Used for status checks
   * V3: Now returns encryptedSymKey directly from contract (no cache needed!)
   */
  async getDrop(dropId: string): Promise<AsyncResult<DropMetadata>> {
    try {
      console.log('=== getDrop: Attempting to retrieve ===');
      console.log('DropId:', dropId);
      console.log('DropId type:', typeof dropId);
      console.log('DropId length:', dropId.length);
      console.log('Contract address:', this.config.contractAddress);
      
      const result = await (this.contract as any).getDrop(dropId);

      console.log('Drop data retrieved from V3 contract:', {
        ipfsHash: result.ipfsHash,
        encryptedSymKey: result.encryptedSymKey ? result.encryptedSymKey.substring(0, 20) + '...' : 'EMPTY',
        owner: result.owner,
        createdAt: result.createdAt.toString(),
        isActive: result.isActive,
        claimed: result.claimed,
        claimCount: result.claimCount.toString(),
      });

      const metadata: DropMetadata = {
        ipfsHash: result.ipfsHash,
        encryptedSymKey: result.encryptedSymKey, // V3: Get directly from contract!
        owner: result.owner,
        createdAt: Number(result.createdAt),
        isActive: result.isActive,
        claimed: result.claimed,
      };

      console.log('✅ V3: Encrypted key retrieved directly from contract');

      return {
        success: true,
        data: metadata,
      };
    } catch (error: any) {
      console.error('Failed to get drop:', error.message);
      return {
        success: false,
        error: `Failed to retrieve drop: ${error.message}`,
      };
    }
  }

  /**
   * Check if drop is valid and claimable
   */
  async isValidDrop(dropId: string): Promise<AsyncResult<boolean>> {
    try {
      const isValid = await (this.contract as any).isValidDrop(dropId);

      return {
        success: true,
        data: isValid,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to check drop validity: ${error.message}`,
      };
    }
  }

  /**
   * Get passphrase hash for verification (read-only)
   * Used to verify passphrase without calling claimDrop
   */
  async getPassphraseHashForVerification(dropId: string): Promise<AsyncResult<string>> {
    try {
      console.log('Getting passphrase hash for dropId:', dropId);
      const hash = await (this.contract as any).getPassphraseHash(dropId);
      console.log('Retrieved passphrase hash:', hash);
      return {
        success: true,
        data: hash,
      };
    } catch (error: any) {
      console.error('Failed to get passphrase hash:', error.message);
      return {
        success: false,
        error: `Failed to get passphrase hash: ${error.message}`,
      };
    }
  }

  /**
        success: true,
        data: isValid,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to check drop validity: ${error.message}`,
      };
    }
  }

  /**
   * Get BlockDAG explorer URL for transaction
   */
  getExplorerUrl(txHash: string): string {
    const baseUrl = process.env.BLOCKDAG_EXPLORER_URL || 'https://awakening.bdagscan.com';
    return `${baseUrl}/tx/${txHash}`;
  }

  /**
   * Get contract statistics
   */
  async getStats(): Promise<AsyncResult<{ total: number; claimed: number; active: number }>> {
    try {
      const result = await (this.contract as any).getStats();

      return {
        success: true,
        data: {
          total: Number(result.totalDropsCreated),
          claimed: Number(result.totalDropsClaimed),
          active: Number(result.activeDrops),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get stats: ${error.message}`,
      };
    }
  }
}
