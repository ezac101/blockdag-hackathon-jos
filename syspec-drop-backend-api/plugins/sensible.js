import fp from 'fastify-plugin'
import fastifySensible from '@fastify/sensible'

/**
 * This plugin adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function sensiblePlugin (fastify, opts) {
  fastify.register(fastifySensible, {
    errorHandler: false
  })
})
