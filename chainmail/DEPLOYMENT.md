# ChainMail - Deployment & Setup Guide

## 📋 Prerequisites

1. **Pinata Account** - Get your API keys from [Pinata](https://pinata.cloud)
2. **BlockDAG Wallet** - With some test tokens for gas fees
3. **BlockDAG IDE** - Access to deploy smart contracts

## 🚀 Deployment Steps

### Step 1: Deploy Smart Contract

1. Go to [BlockDAG IDE](https://ide.blockdag.network) or your BlockDAG development environment
2. Create a new file named `ChainMail.sol`
3. Copy the contract from `contracts/ChainMail.sol`
4. Compile the contract (Solidity 0.8.20+)
5. Deploy the contract to BlockDAG testnet
6. **Save the deployed contract address** - you'll need it for the next step

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your credentials in `.env.local`:

   ```bash
   # Add your deployed contract address
   NEXT_PUBLIC_CHAINMAIL_CONTRACT_ADDRESS=0xYourContractAddressHere

   # Add your Pinata credentials
   NEXT_PUBLIC_PINATA_API_KEY=your_api_key
   NEXT_PUBLIC_PINATA_SECRET_KEY=your_secret_key
   NEXT_PUBLIC_PINATA_JWT=your_jwt_token
   ```

### Step 3: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 4: Run the Application

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view ChainMail.

## 🔐 How It Works

### Sending an Email

1. **Generate/Login Wallet** - User creates or imports a wallet
2. **Compose Email** - User writes email with recipient's wallet address
3. **Encrypt** - Email is encrypted with recipient's public key (OpenPGP)
4. **Upload to IPFS** - Encrypted email is uploaded to Pinata IPFS
5. **Store on Blockchain** - IPFS hash is stored on BlockDAG via smart contract
6. **Immutable** - Email is permanently stored and cannot be deleted

### Receiving an Email

1. **Fetch from Blockchain** - Smart contract returns IPFS hashes of user's emails
2. **Download from IPFS** - Encrypted emails are fetched from Pinata
3. **Decrypt** - Emails are decrypted with user's private key
4. **Display** - Decrypted emails are shown in inbox

## 📁 Project Structure

```
my-app/
├── contracts/
│   └── ChainMail.sol          # Smart contract
├── src/
│   ├── app/
│   │   ├── page.tsx           # Inbox/Dashboard
│   │   └── login/
│   │       └── page.tsx       # Login/Register
│   ├── components/
│   │   └── ui/                # shadcn/ui components
│   └── services/
│       ├── wallet.service.ts      # Wallet management
│       ├── encryption.service.ts  # OpenPGP encryption
│       ├── ipfs.service.ts        # Pinata IPFS integration
│       ├── blockchain.service.ts  # Smart contract interaction
│       └── email.service.ts       # Main email orchestration
└── .env.local                 # Your environment variables
```

## 🔧 Service APIs

### WalletService

```typescript
// Generate new wallet
const wallet = WalletService.generateWallet();

// Restore from mnemonic
const wallet = WalletService.fromMnemonic("your 12 word phrase");

// Restore from private key
const wallet = WalletService.fromPrivateKey("0x...");
```

### EmailService

```typescript
// Send email
const result = await EmailService.sendEmail(
  emailData,
  senderPrivateKey,
  senderPGPKey,
  recipientPGPKey
);

// Get inbox
const emails = await EmailService.getInbox(
  walletInfo,
  privateKeyArmored
);

// Get sent emails
const sent = await EmailService.getSentEmails(walletInfo);
```

### EncryptionService

```typescript
// Generate PGP key pair
const keyPair = await EncryptionService.generateKeyPair(
  "User Name",
  "email@example.com",
  "password"
);

// Encrypt message
const encrypted = await EncryptionService.encrypt(
  message,
  recipientPublicKey
);

// Decrypt message
const decrypted = await EncryptionService.decrypt(
  encryptedMessage,
  privateKey,
  passphrase
);
```

### IPFSService

```typescript
// Upload JSON to IPFS
const cid = await IPFSService.uploadJSON(data);

// Fetch JSON from IPFS
const data = await IPFSService.fetchJSON(cid);
```

### BlockchainService

```typescript
// Initialize with wallet
BlockchainService.initialize(walletInfo);

// Send email on-chain
const tx = await BlockchainService.sendEmail(recipientAddress, ipfsHash);

// Get received emails
const emails = await BlockchainService.getReceivedEmails(address);

// Get sent emails
const sent = await BlockchainService.getSentEmails(address);
```

## 🔒 Security Features

- **End-to-End Encryption** - OpenPGP encryption with RSA 4096-bit keys
- **Immutable Storage** - Emails permanently stored on blockchain
- **Decentralized** - No central server can read or delete emails
- **Anonymous** - Wallet addresses as identities
- **Private Keys Never Leave Device** - All encryption happens client-side

## 🧪 Testing

```bash
# Run tests
npm test

# Check contract on BlockDAG Explorer
# Visit: https://explorer.blockdag.network/address/YOUR_CONTRACT_ADDRESS
```

## 📝 Smart Contract Functions

```solidity
// Send email
function sendEmail(address _to, string memory _ipfsHash) returns (uint256)

// Get received emails
function getReceivedEmails(address _recipient) returns (uint256[])

// Get sent emails
function getSentEmails(address _sender) returns (uint256[])

// Get email details
function getEmail(uint256 _emailId) returns (address, address, string, uint256, bool)

// Pagination support
function getReceivedEmailsPaginated(address, uint256 offset, uint256 limit)
```

## 🐛 Troubleshooting

### Contract Deployment Issues
- Ensure you have enough gas
- Check Solidity version compatibility (^0.8.20)
- Verify BlockDAG network is accessible

### IPFS Upload Failures
- Verify Pinata API credentials
- Check file size limits (Pinata free tier: 1GB)
- Ensure proper CORS settings

### Encryption Errors
- Verify OpenPGP key format (armored)
- Check passphrase correctness
- Ensure keys are RSA 4096-bit

### Transaction Failures
- Check wallet has sufficient gas
- Verify contract address is correct
- Ensure RPC URL is accessible

## 📚 Additional Resources

- [BlockDAG Documentation](https://docs.blockdag.network)
- [Pinata IPFS Docs](https://docs.pinata.cloud)
- [OpenPGP.js](https://openpgpjs.org)
- [Ethers.js](https://docs.ethers.org)

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review service logs in browser console
3. Verify all environment variables are set correctly
4. Check blockchain transaction status on explorer

## 📄 License

MIT
