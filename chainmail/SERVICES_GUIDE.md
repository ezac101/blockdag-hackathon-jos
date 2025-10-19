# ChainMail Services Guide

## Overview
All services are now implemented and error-free. Here's how to use them:

## Service Files
- ✅ `wallet.service.ts` - Wallet management
- ✅ `encryption.service.ts` - PGP encryption/decryption
- ✅ `ipfs.service.ts` - IPFS storage via Pinata
- ✅ `blockchain.service.ts` - Smart contract interaction
- ✅ `email.service.ts` - Main email orchestration

## Quick Start

### 1. Setup Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
# Pinata IPFS Keys (you already have these)
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud

# BlockDAG Network
NEXT_PUBLIC_BLOCKDAG_RPC_URL=https://rpc.blockdag.network
NEXT_PUBLIC_CHAINMAIL_CONTRACT_ADDRESS=0x... # After deployment
```

### 2. Deploy Smart Contract

Use BlockDAG IDE to deploy `ChainMail.sol`:

1. Open BlockDAG IDE
2. Copy the contract from `contracts/ChainMail.sol`
3. When deploying, pass your relay wallet address to the constructor (the same wallet whose private key is in `RELAY_WALLET_PRIVATE_KEY`)
4. Compile and deploy
5. Copy the deployed contract address
6. Update `NEXT_PUBLIC_CHAINMAIL_CONTRACT_ADDRESS` in `.env.local`

### 3. Usage Examples

#### Send an Email

```typescript
import { EmailService } from '@/services/email.service';
import { WalletService } from '@/services/wallet.service';
import { EncryptionService } from '@/services/encryption.service';

// 1. Generate or load wallet
const wallet = WalletService.createWallet();
const senderAddress = wallet.address;
const senderPrivateKey = wallet.privateKey;

// 2. Generate PGP keys
const { privateKey: senderPGPPrivate, publicKey: senderPGPPublic } = 
  await EncryptionService.generateKeyPair(senderPrivateKey, senderAddress);

// 3. Get recipient's public key (they need to share this)
const recipientPGPPublic = "-----BEGIN PGP PUBLIC KEY BLOCK-----...";

// 4. Send email
const result = await EmailService.sendEmail(
  {
    to: '0xRecipientAddress',
    subject: 'Hello from ChainMail',
    body: 'This is my first encrypted email on BlockDAG!',
  },
  senderPrivateKey,        // Blockchain private key
  senderPGPPrivate,        // PGP private key
  recipientPGPPublic,      // Recipient's PGP public key
  senderAddress            // Sender's address
);

console.log('Email sent!', result);
// { emailId: 1, transactionHash: '0x...', ipfsHash: 'Qm...' }
```

#### Receive and Read Emails

```typescript
// 1. Get your emails
const recipientAddress = '0xYourAddress';
const emails = await EmailService.getRecipientEmails(recipientAddress);

console.log(`You have ${emails.length} emails`);

// 2. Read specific email
const emailToRead = emails[0];
const decryptedEmail = await EmailService.fetchAndDecryptEmail(
  emailToRead.emailId,
  recipientPGPPrivate,     // Your PGP private key
  recipientWalletPrivateKey // Your wallet private key (for passphrase)
);

console.log('From:', decryptedEmail.from);
console.log('Subject:', decryptedEmail.subject);
console.log('Body:', decryptedEmail.body);
```

#### Reply to an Email

```typescript
await EmailService.replyToEmail(
  originalEmail,           // The email you're replying to
  'Thanks for your message!', // Reply body
  senderPrivateKey,        // Your blockchain private key
  senderPGPPrivate,        // Your PGP private key
  originalSenderPGPPublic, // Original sender's PGP public key
  senderAddress            // Your address
);
```

#### Listen for New Emails (Real-time)

```typescript
const cleanup = EmailService.listenForNewEmails(
  recipientAddress,
  (emailMetadata) => {
    console.log('New email arrived!', emailMetadata);
    // Update UI, show notification, etc.
  }
);

// When done listening:
cleanup();
```

## Key Concepts

### Wallet Management
- Uses ethers.js for Ethereum-compatible wallets
- Supports mnemonic phrases (12/24 words)
- Compatible with MetaMask and other wallets

### Encryption Flow
1. Generate PGP key pair from wallet
2. Share your public key (safe to share publicly)
3. Keep private key secure (encrypted with wallet private key)
4. Encrypt with recipient's public key
5. Only recipient can decrypt with their private key

### IPFS Storage
- Encrypted emails stored on IPFS via Pinata
- Content addressing ensures immutability
- Metadata includes timestamps and addresses

### Blockchain Logging
- Smart contract records email metadata
- Only IPFS hash and addresses stored (privacy)
- Gas-efficient design
- Event emission for real-time updates

## Security Best Practices

1. **Never share private keys**
   - Wallet private key
   - PGP private key passphrase

2. **Store keys securely**
   - Use browser localStorage/sessionStorage
   - Consider hardware wallet integration
   - Encrypt keys before storage

3. **Verify recipients**
   - Double-check recipient addresses
   - Confirm public key authenticity

4. **Backup important data**
   - Mnemonic phrases
   - PGP private keys
   - Write them down offline

## Troubleshooting

### "Cannot read properties of undefined"
- Ensure all environment variables are set
- Check contract is deployed
- Verify RPC URL is accessible

### "Insufficient funds"
- Need BlockDAG tokens for gas
- Get testnet tokens from faucet

### "Decryption failed"
- Verify you're using correct private key
- Check wallet private key passphrase
- Ensure email was encrypted for you

### "IPFS upload failed"
- Check Pinata API keys
- Verify API key permissions
- Check internet connection

## Next Steps

1. ✅ Deploy smart contract
2. ✅ Configure environment variables
3. ✅ Test wallet generation
4. ✅ Test encryption/decryption
5. ✅ Send first email
6. ✅ Integrate with UI components

## Support

For issues:
1. Check console logs
2. Verify environment setup
3. Review smart contract events
4. Check IPFS pin status on Pinata dashboard
