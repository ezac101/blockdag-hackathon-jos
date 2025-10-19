import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { ErrorResponse } from '../types/common.types.js';
import { BlockDAGService } from '../services/blockdag.service.js';
import {
  securityMiddleware,
  anonymousLoggingMiddleware,
} from '../middlewares/security.middleware.js';

/**
 * Status Route
 * Provides anonymous status checks for drops
 * Flow: Check drop existence/claim status without revealing sensitive data
 * 
 * Compliance:
 * - ISO 27001 A.12.4 (Logging and monitoring)
 * - NIST SP 800-53 AU-2 (Auditable events)
 */

interface StatusResponse {
  success: boolean;
  dropId: string;
  ipfsHash?: string;
  owner?: string;
  isActive: boolean;
  claimed: boolean;
  createdAt?: number;
  explorerUrl?: string;
  message: string;
}

export default async function statusRoutes(fastify: FastifyInstance) {
  // Use singleton service from fastify instance (shared across all routes)
  const blockdagService = (fastify as any).blockdag as BlockDAGService;

  // Schema for params validation
  const statusSchema = {
    params: {
      type: 'object',
      required: ['dropId'],
      properties: {
        dropId: { type: 'string', minLength: 1 },
      },
    },
  };

  /**
   * GET /api/status/:dropId
   * Check drop status (anonymous, no sensitive data exposed)
   */
  fastify.get<{ Params: { dropId: string } }>(
    '/:dropId',
    {
      schema: statusSchema,
      preHandler: [securityMiddleware, anonymousLoggingMiddleware],
    },
    async (
      request: FastifyRequest<{ Params: { dropId: string } }>,
      reply: FastifyReply
    ): Promise<StatusResponse | ErrorResponse> => {
      try {
        const { dropId } = request.params;

        console.log('=== STATUS: Checking Drop ===');
        console.log('DropId:', dropId);
        console.log('DropId length:', dropId.length);

        // Fetch drop metadata
        request.log.info({ dropId }, 'Checking drop status');
        const dropResult = await blockdagService.getDrop(dropId);

        console.log('=== STATUS: Drop Result ===');
        console.log('Success:', dropResult.success);
        console.log('Result:', dropResult);

        if (!dropResult.success) {
          console.log('Drop not found, returning 404');
          return reply.code(404).send({
            success: false,
            error: 'Drop not found',
            code: 'DROP_NOT_FOUND',
          });
        }

        const drop = dropResult.data;

        const response: StatusResponse = {
          success: true,
          dropId,
          ipfsHash: drop.ipfsHash,
          owner: drop.owner,
          isActive: drop.isActive,
          claimed: drop.claimed,
          createdAt: drop.createdAt,
          explorerUrl: `https://awakening.bdagscan.com/address/${process.env.BLOCKDAG_CONTRACT_ADDRESS}`,
          message: drop.claimed
            ? 'Drop already claimed'
            : drop.isActive
            ? 'Drop available for claim'
            : 'Drop deactivated',
        };

        return reply.code(200).send(response);
      } catch (error: any) {
        request.log.error({ error: error.message }, 'Status check failed');

        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
          code: 'STATUS_ERROR',
        });
      }
    }
  );
}
