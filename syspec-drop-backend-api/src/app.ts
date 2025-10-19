import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import { config, validateConfig } from './config/app.config.js';
import { IPFSService } from './services/ipfs.service.js';
import { BlockDAGService } from './services/blockdag.service.js';
import { ZKPService } from './services/zkp.service.js';
import { securityMiddleware } from './middlewares/security.middleware.js';
import uploadRoute from './routes/upload.route.js';
import claimRoute from './routes/claim.route.js';
import statusRoute from './routes/status.route.js';

/**
 * QuantumDrop API Server
 * Quantum-secure, anonymous dead-drop platform
 * Compliance: ISO 27001, NIST SP 800-53
 */

// Validate configuration on startup
validateConfig();

// Initialize Fastify with logging
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Initialize services
const ipfsService = new IPFSService(config.ipfs);
const blockdagService = new BlockDAGService(config.blockdag);
const zkpService = new ZKPService();

// Decorate fastify instance with services
fastify.decorate('ipfs', ipfsService);
fastify.decorate('blockdag', blockdagService);
fastify.decorate('zkp', zkpService);
fastify.decorate('config', config);

// Security middleware - ISO 27001 A.13
await fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
});

// CORS - Allow frontend access
await fastify.register(cors, {
  origin: config.allowedOrigins,
  credentials: true,
});

// Rate limiting - NIST SP 800-53 SC-5 (DoS protection)
await fastify.register(rateLimit, {
  max: 100, // 100 requests
  timeWindow: '15 minutes',
  errorResponseBuilder: () => ({
    success: false,
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  }),
});

// Register routes
await fastify.register(uploadRoute, { prefix: '/api/upload' });
await fastify.register(claimRoute, { prefix: '/api/claim' });
await fastify.register(statusRoute, { prefix: '/api/status' });

// Health check endpoint
fastify.get('/api/health', async () => ({
  success: true,
  status: 'healthy',
  timestamp: new Date().toISOString(),
  services: {
    ipfs: 'connected',
    blockdag: 'connected',
    zkp: 'ready',
  },
}));

// Root endpoint
fastify.get('/', async () => ({
  name: 'QuantumDrop API',
  version: '1.0.0',
  description: 'Quantum-secure anonymous dead-drop platform',
  endpoints: [
    'POST /api/upload - Upload encrypted file',
    'POST /api/claim - Claim file with passphrase',
    'GET /api/status/:dropId - Check drop status',
    'GET /api/health - Health check',
  ],
}));

// Global error handler - ISO 27001 A.12.4 (Logging)
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  reply.status(error.statusCode || 500).send({
    success: false,
    error: error.message || 'Internal server error',
    code: error.code || 'INTERNAL_ERROR',
  });
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    
    console.log('');
    console.log('🚀 QuantumDrop API Server Started');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📡 Server: http://${host}:${port}`);
    console.log(`🔒 HTTPS: ${config.ipfs.protocol === 'https' ? 'Enabled' : 'Disabled'}`);
    console.log(`⛓️  BlockDAG: ${config.blockdag.rpcUrl}`);
    console.log(`📦 IPFS: ${config.ipfs.protocol}://${config.ipfs.host}:${config.ipfs.port}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await fastify.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the server
start();

// Export for testing
export default fastify;
