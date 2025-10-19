import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ErrorResponse } from '../types/common.types.js';

/**
 * Combined Security Middleware
 * Adds security headers for privacy and compliance (ISO 27001 A.13)
 */
export async function securityMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // NIST SP 800-53 SC-8: Transmission confidentiality
  reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // ISO 27001 A.13.1: Network security management
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-XSS-Protection', '1; mode=block');
  
  // Privacy headers (no tracking)
  reply.header('Referrer-Policy', 'no-referrer');
  reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove identifying headers
  reply.removeHeader('X-Powered-By');
}

/**
 * Rate Limiting Middleware
 * Prevents abuse while maintaining anonymity (ISO 27001 A.12.2)
 */
export async function rateLimitMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Note: Implement IP-based rate limiting with @fastify/rate-limit
  // Use hashed IPs to maintain anonymity
  // NIST SP 800-53 SI-10: Information input validation
}

/**
 * Request Validation Middleware
 * Validates request structure (NIST SP 800-53 SI-10)
 */
export async function validateRequestMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const contentType = request.headers['content-type'];
  
  if (request.method === 'POST' && !contentType?.includes('application/json')) {
    const error: ErrorResponse = {
      success: false,
      error: 'Invalid content type',
      code: 'INVALID_CONTENT_TYPE'
    };
    return reply.code(400).send(error);
  }
}

/**
 * Anonymous Logging Middleware
 * Logs requests without PII (ISO 27001 A.12.4, ISO 27018)
 */
export async function anonymousLoggingMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const anonymousLog = {
    method: request.method,
    url: request.url,
    timestamp: new Date().toISOString(),
    // Hash IP for anonymity (don't log raw IP)
    requestId: request.id,
  };
  
  request.log.info(anonymousLog, 'Anonymous request received');
}

/**
 * CORS Middleware (handled by @fastify/cors)
 * Configured in app.js for Tor/VPN compatibility
 */
