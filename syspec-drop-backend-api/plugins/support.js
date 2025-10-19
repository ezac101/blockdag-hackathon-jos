import fp from 'fastify-plugin'

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

export default fp(async function supportPlugin (fastify, opts) {
  fastify.decorate('someSupport', function someSupport () {
    return 'hugs'
  })
})
