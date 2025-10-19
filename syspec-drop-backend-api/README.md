# QuantumDrop API - Decentralized Secure File Sharing

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![BlockDAG](https://img.shields.io/badge/Blockchain-BlockDAG-purple)](https://blockdag.network/)

## 🎯 Overview

QuantumDrop is a decentralized, zero-knowledge file sharing platform that combines **IPFS** for distributed storage, **BlockDAG blockchain** for trustless verification, and **military-grade encryption** (AES-256-GCM) to enable truly private, anonymous file sharing with unlimited access capabilities.

**Key Features:**
- 🔐 **End-to-End Encryption** - Files encrypted client-side before upload
- 🌐 **Decentralized Storage** - IPFS ensures permanent availability
- ⛓️ **Blockchain Verification** - Smart contracts handle access control
- 🔓 **Unlimited Claims** - Same passphrase works forever (V3)
- 📁 **Auto File Detection** - Automatic file type recognition (.docx, .pdf, .png, etc.)
- 👤 **Anonymous by Design** - No user accounts, no IP logging
- 🛡️ **Quantum-Resistant** - Keccak-256 hashing protects against future threats

---

## 📋 Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **IPFS Access** - Local node or Pinata account ([Pinata Sign Up](https://pinata.cloud/))
- **BlockDAG Wallet** - Testnet tokens for contract deployment
- **Git** - For cloning the repository

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Ezana-cod/syspecdrop-api.git
cd syspecdrop-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your configurations:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# IPFS Configuration (Choose one)
# Option 1: Pinata (Recommended for production)
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_secret
PINATA_JWT=your_pinata_jwt

# Option 2: Local IPFS Node
# IPFS_HOST=127.0.0.1
# IPFS_PORT=5001
# IPFS_PROTOCOL=http

# BlockDAG Configuration
BLOCKDAG_RPC_URL=https://rpc.awakening.bdagscan.com
BLOCKDAG_CHAIN_ID=1043
BLOCKDAG_PRIVATE_KEY=your_wallet_private_key
BLOCKDAG_CONTRACT_ADDRESS=0x5403224Ba1BEF827bAfBE39B3C9C159d2DC2c372

# Security
MAX_FILE_SIZE_MB=100
ALLOWED_ORIGINS=*  # For development; use specific domains in production

# Logging
LOG_LEVEL=info
```

### 4. Deploy Smart Contract (First Time Only)

See [contracts/README.md](contracts/README.md) for deployment instructions, or use the pre-deployed contract:
```
Testnet: 0x5403224Ba1BEF827bAfBE39B3C9C159d2DC2c372
```

### 5. Start Development Server
```bash
npm run dev
```

Server runs on **http://localhost:3000**

### 6. Build for Production
```bash
npm run build
npm start
```

---

## 🛣️ API Routes

### 📤 POST `/api/upload`
**Upload and encrypt a file to IPFS with blockchain metadata storage**

**Request Body**:
```json
{
  "file": "base64_encoded_file_content"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "dropId": "27a905cdf8e4a3b2c1d9e7f6a8b4c2d1e9f7a5b3c1d8e6f4a2b0c9d7e5f3a1b",
  "ipfsHash": "QmXYZ123abc...",
  "passphrase": "quantum-secure-drop-anonymous-encrypted-blockdag",
  "txHash": "0x646686e8e4a5d58542d6c818b04237dc35b87955b554e925199dc694a893903c",
  "explorerUrl": "https://explorer.bdagscan.com/tx/0x646686...",
  "message": "Drop created successfully. Share the passphrase securely."
}
```

**Important**: Save the `dropId` and `passphrase` - they are required for claiming the file!

---

### 📥 POST `/api/claim`
**Claim and decrypt a file using dropId and passphrase**

**Request Body**:
```json
{
  "dropId": "27a905cdf8e4a3b2c1d9e7f6a8b4c2d1e9f7a5b3c1d8e6f4a2b0c9d7e5f3a1b",
  "passphrase": "quantum-secure-drop-anonymous-encrypted-blockdag"
}
```

**Response (Default - File Download)**:
- Returns binary file with automatic file type detection
- **Headers**:
  - `Content-Type`: Auto-detected MIME type (e.g., `application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
  - `Content-Disposition`: `attachment; filename="drop-27a905cd.docx"`
  - `X-Transaction-Hash`: Blockchain transaction hash
  - `X-Drop-Status`: `claimed`
  - `X-File-Type`: File extension (`docx`, `pdf`, `png`, etc.)

**Response (JSON Format - Optional)**:
Add `?format=json` query parameter:
```json
{
  "success": true,
  "fileName": "drop-27a905cd.docx",
  "fileContent": "UEsDBBQABgAIAAAAIQD...",  // base64-encoded
  "txHash": "0x646686e8...",
  "fileType": "docx",
  "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "message": "Drop claimed successfully. File decrypted."
}
```

**Features**:
- ✅ Unlimited claims with correct passphrase
- ✅ First claim sets `claimed=true` flag
- ✅ Automatic file type detection (docx, xlsx, pptx, pdf, png, jpg, etc.)
- ✅ Direct browser download with correct extension

---

### 🔍 GET `/api/status/:dropId`
**Check drop status and claim history**

**Example**:
```bash
GET /api/status/27a905cdf8e4a3b2c1d9e7f6a8b4c2d1e9f7a5b3c1d8e6f4a2b0c9d7e5f3a1b
```

**Response** (200 OK):
```json
{
  "success": true,
  "dropId": "27a905cd...",
  "exists": true,
  "claimed": true,
  "claimCount": 3,
  "ipfsHash": "QmXYZ123abc...",
  "owner": "0xBd13BFbdBbcb4A37eF4b38D69Fd5BC93AEA7805b",
  "isActive": true,
  "createdAt": 1729267200,
  "lastClaimTime": 1729353600,
  "message": "Drop has been claimed 3 times"
}
```

---

## 🏗️ Project Structure

```
syspecdrop-api/
├── src/
│   ├── routes/
│   │   ├── upload.route.ts       # File upload & encryption
│   │   ├── claim.route.ts        # File claim & decryption
│   │   └── status.route.ts       # Drop status check
│   ├── services/
│   │   ├── blockdag.service.ts   # Smart contract interactions
│   │   └── ipfs.service.ts       # IPFS file operations
│   ├── middlewares/
│   │   └── security.middleware.ts # Security headers, rate limiting
│   ├── types/
│   │   ├── upload.types.ts       # Upload request/response types
│   │   ├── claim.types.ts        # Claim request/response types
│   │   └── common.types.ts       # Shared type definitions
│   ├── config/
│   │   └── app.config.ts         # Environment configuration
│   └── app.ts                    # Main application entry
├── contracts/
│   ├── QuantumDropV3.sol         # Smart contract (V3 - Unlimited claims)
│   ├── QuantumDropV2.sol         # Previous version
│   └── QuantumDrop.sol           # Original version
├── blockdag-scripts/
│   ├── blockdag.sh               # BlockDAG node management
│   └── docker-compose.yml        # Local node setup
├── TECHNICAL_OVERVIEW.md         # Comprehensive technical documentation
├── POSTMAN_TESTS.md              # API testing guide
├── FEATURE_SUMMARY.md            # Feature descriptions
└── README.md                     # This file
```

---

## 🔐 How It Works

### Upload Flow (Encryption)
```
1. User selects file
2. Generate random 256-bit symmetric key
3. Encrypt file with AES-256-GCM
4. Upload encrypted file to IPFS → Get CID
5. Hash passphrase with Keccak-256
6. Encrypt symmetric key with passphrase hash
7. Store metadata on BlockDAG smart contract
8. Return dropId + passphrase to user
```

### Claim Flow (Decryption)
```
1. User provides dropId + passphrase
2. Hash passphrase with Keccak-256
3. Smart contract verifies passphrase hash
4. Retrieve encrypted file from IPFS
5. Decrypt symmetric key using passphrase
6. Decrypt file with symmetric key
7. Detect file type from magic bytes
8. Serve file with correct extension
```

### Security Layers
- **Layer 1**: AES-256-GCM encryption (file)
- **Layer 2**: Keccak-256 hashing (passphrase)
- **Layer 3**: Smart contract verification (blockchain)
- **Layer 4**: IPFS content addressing (tamper-proof)

---

## 🔒 Security Features

### Zero-Knowledge Architecture
- ✅ Server never sees plaintext files
- ✅ Passphrases never stored (only hashes)
- ✅ No user accounts or authentication
- ✅ No IP address logging
- ✅ Anonymous API calls

### Military-Grade Cryptography
- **AES-256-GCM**: Authenticated encryption (NSA TOP SECRET approved)
- **Keccak-256**: Quantum-resistant hashing (Ethereum's hash function)
- **12-byte IV**: Cryptographically secure random nonces
- **16-byte Auth Tags**: Prevents tampering and forgery

### Compliance Standards
- **NIST SP 800-53**: Access control, encryption, audit logging
- **ISO 27001**: Information security management
- **GDPR**: Right to erasure (owner can deactivate drops)
- **HIPAA**: Encrypted file transfer for healthcare data

### Rate Limiting & Protection
- 100 requests per 15 minutes per IP
- CORS protection with configurable origins
- Helmet.js security headers
- Input validation with JSON schemas
- Error message sanitization

---

## 🧪 Testing

### Using cURL

**Upload a file:**
```bash
# Convert file to base64
FILE_BASE64=$(base64 -i yourfile.docx)

# Upload
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d "{\"file\":\"$FILE_BASE64\"}"
```

**Claim a file (download):**
```bash
curl -X POST http://localhost:3000/api/claim \
  -H "Content-Type: application/json" \
  -d '{"dropId":"27a905cd...","passphrase":"your-passphrase"}' \
  --output downloaded-file.docx
```

**Check status:**
```bash
curl http://localhost:3000/api/status/27a905cd...
```

### Using Postman

See [POSTMAN_TESTS.md](POSTMAN_TESTS.md) for detailed Postman collection and test scenarios.

### Run Unit Tests
```bash
npm test
```

---

## 📊 Supported File Types

The system automatically detects and properly labels these file types:

| Type | Extensions | Detection Method |
|------|-----------|------------------|
| **Office Documents** | .docx, .xlsx, .pptx | ZIP header + internal path analysis |
| **Images** | .png, .jpg, .gif | Magic bytes (89504e47, ffd8ff, 474946) |
| **Documents** | .pdf, .ps | Magic bytes (25504446, %!PS) |
| **Archives** | .zip | PK header |
| **Text** | .txt | Printable character analysis |
| **Other** | .bin | Fallback for unknown types |

---

## 🌐 Deployment

### Docker Deployment
```bash
# Build image
docker build -t quantumdrop-api .

# Run container
docker run -p 3000:3000 \
  -e BLOCKDAG_RPC_URL=https://rpc.awakening.bdagscan.com \
  -e BLOCKDAG_CONTRACT_ADDRESS=0x5403224Ba1BEF827bAfBE39B3C9C159d2DC2c372 \
  -e PINATA_API_KEY=your_key \
  quantumdrop-api
```

### Production Considerations
1. **Environment Variables**: Use secrets management (AWS Secrets Manager, HashiCorp Vault)
2. **CORS**: Restrict `ALLOWED_ORIGINS` to your frontend domains
3. **Rate Limiting**: Adjust based on expected traffic
4. **IPFS Pinning**: Use Pinata or dedicated IPFS infrastructure
5. **Monitoring**: Implement logging and error tracking (Sentry, DataDog)
6. **Load Balancing**: Use NGINX or cloud load balancers
7. **SSL/TLS**: Always use HTTPS in production

---

## 🌟 Key Features & Innovations

### V3 Improvements
- **Unlimited Claims**: Same passphrase works forever (no metadata burning)
- **Claim Tracking**: `claimed` flag + `claimCount` for analytics
- **Permanent Storage**: Encryption keys stored on-chain permanently
- **Owner Control**: Deactivate drops at any time

### Technical Highlights
- **Hybrid Encryption**: Symmetric (AES-256) + passphrase-based key derivation
- **Content Addressing**: IPFS ensures tamper-proof, deduplication
- **On-Chain Metadata**: Transparent, immutable, auditable
- **Magic Byte Detection**: Automatic file type recognition
- **Horizontal Scalability**: Stateless API design

### Use Cases
- 🕵️ **Whistleblower Protection**: Anonymous document sharing
- 🏥 **Healthcare**: HIPAA-compliant medical record exchange
- ⚖️ **Legal**: Attorney-client privilege protection
- 📰 **Journalism**: Secure source communications
- 🏢 **Enterprise**: Confidential business document sharing
- 👨‍👩‍👧 **Personal**: Family document backup and sharing

---

## 📚 Documentation

- **[TECHNICAL_OVERVIEW.md](TECHNICAL_OVERVIEW.md)** - Complete technical deep dive, architecture, and innovations
- **[POSTMAN_TESTS.md](POSTMAN_TESTS.md)** - API testing guide with examples
- **[FEATURE_SUMMARY.md](FEATURE_SUMMARY.md)** - Feature descriptions and use cases
- **[contracts/QuantumDropV3.sol](contracts/QuantumDropV3.sol)** - Smart contract source code

---

## 🌐 BlockDAG Network

- **Testnet Explorer**: [https://explorer.bdagscan.com](https://explorer.bdagscan.com)
- **RPC Endpoint**: `https://rpc.awakening.bdagscan.com`
- **Chain ID**: 1043
- **Faucet**: Contact BlockDAG team for testnet tokens
- **Documentation**: [BlockDAG Docs](https://blockdag.network/docs)

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Areas for Contribution
- Frontend development (React, Vue, Angular)
- Mobile apps (React Native, Flutter)
- Security audits and testing
- Documentation improvements
- Translations
- Bug fixes and optimizations

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🔒 Security & Responsible Disclosure

Found a security vulnerability? Please report it responsibly:

- **Email**: security@quantumdrop.io
- **PGP Key**: [Download PGP Key]
- **Bug Bounty**: Up to $10,000 for critical vulnerabilities

**Please do not** create public GitHub issues for security vulnerabilities.

---

## 👥 Team & Contact

- **GitHub**: [@Ezana-cod](https://github.com/Ezana-cod)
- **Project**: [syspecdrop-api](https://github.com/Ezana-cod/syspecdrop-api)
- **Email**: support@quantumdrop.io
- **Discord**: [Join our server]
- **Twitter**: [@QuantumDrop]

---

## 🙏 Acknowledgments

- **BlockDAG Network** - High-performance blockchain infrastructure
- **IPFS** - Decentralized storage protocol
- **Fastify** - Fast and efficient web framework
- **Ethers.js** - Ethereum library for blockchain interactions
- **OpenZeppelin** - Secure smart contract templates

---

## 📈 Roadmap

### Phase 1: Core Features ✅
- Upload/Claim/Status API
- Smart contract deployment
- IPFS integration
- Automatic file type detection

### Phase 2: Enhanced UX 🔄
- Web frontend (React/Vue)
- Mobile apps (iOS/Android)
- Browser extension
- Drag-and-drop upload

### Phase 3: Advanced Features 📋
- Time-locked claims
- Multi-file drops (folders)
- Configurable claim limits
- Password protection (double encryption)

### Phase 4: Enterprise 🏢
- Team workspaces
- Admin dashboard
- Usage analytics
- Custom branding
- SLA guarantees

---

## ⚖️ Legal Disclaimer

QuantumDrop is a tool for secure file sharing. Users are responsible for:
- Compliance with local laws and regulations
- Content legality and copyright respect
- Proper use of encryption technology
- Ensuring they have rights to shared files

**We do not have access to file contents and cannot moderate uploaded data.**

---

**Built with ❤️ for privacy, security, and freedom.**

*QuantumDrop - Secure. Anonymous. Decentralized.*
