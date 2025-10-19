import path from 'node:path';
import { existsSync } from 'node:fs';
import AutoLoad from '@fastify/autoload';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pass --options via CLI arguments in command to enable these options.
const options = {};

export default async function (fastify, opts) {
  // Register CORS for Tor/VPN compatibility (ISO 27001 A.13)
  await fastify.register(import('@fastify/cors'), {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Register environment variables
  await fastify.register(import('@fastify/env'), {
    dotenv: true,
    schema: {
      type: 'object',
      properties: {
        PORT: { type: 'integer', default: 3000 },
        NODE_ENV: { type: 'string', default: 'development' },
        BLOCKDAG_RPC_URL: { type: 'string' },
        BLOCKDAG_CHAIN_ID: { type: 'integer', default: 1 },
        BLOCKDAG_PRIVATE_KEY: { type: 'string' },
        QUANTUM_DROP_CONTRACT_ADDRESS: { type: 'string' },
        IPFS_HOST: { type: 'string', default: 'ipfs.infura.io' },
        IPFS_PORT: { type: 'integer', default: 5001 },
        IPFS_PROTOCOL: { type: 'string', default: 'https' },
      },
    },
  });

  const registerIfExists = async (relativePath, optionsOverride = {}) => {
    const targetDir = path.join(__dirname, relativePath);
    if (!existsSync(targetDir)) {
      fastify.log.debug({ dir: targetDir }, 'Skipping autoload; directory missing');
      return;
    }

    await fastify.register(AutoLoad, {
      dir: targetDir,
      options: Object.assign({}, opts, optionsOverride),
    });
  };

  // Autoload optional plugin and route directories when present
  await registerIfExists('plugins');
  await registerIfExists('routes', { prefix: '/api' });
  await registerIfExists(path.join('src', 'routes'), { prefix: '/api' });
}

export { options };
