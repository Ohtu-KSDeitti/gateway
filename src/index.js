const { ApolloServer } = require('apollo-server')
const { ApolloGateway, RemoteGraphQLDataSource } = require('@apollo/gateway')

require('dotenv').config()

const PORT = process.env.PORT
const ENV = process.env.NODE_ENV

const gateway = new ApolloGateway({
  serviceList: [
    { name: 'user-api', url: process.env.USER_API },
    { name: 'image-api', url: process.env.IMAGE_API },
  ],
  buildService({ name, url }) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        if (context.authorization) {
          request.http.headers.set(
            'authorization',
            context.authorization,
          )
        }
      },
    })
  },
})

const server = new ApolloServer({
  gateway,
  engine: false,
  subscriptions: false,
  context: ({ req }) => {
    return { authorization: req.headers.authorization }
  },
  plugins: [
    {
      requestDidStart: (requestContext) => {
        if ( requestContext.request.http?.headers.has( 'x-apollo-tracing' ) ) {
          return
        }
        if (ENV !== 'development') {
          const query =
        requestContext.request.query?.replace( /\s+/g, ' ' ).trim()
          const variables = JSON.stringify( requestContext.request.variables )
          console.log('gateway <-', new Date().toISOString())
          console.log('gateway <-', `- [Request Started] { query: ${ query }`)
          console.log('gateway <-', 'variables:', variables)
          console.log('gateway <-',
            'operationName:',
            requestContext.request.operationName)
          return
        }
      },
    },
  ],
})

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`gateway <- ready at ${url}`)
}).catch((err) => {
  console.log('gateway <- cannot connect to service(s)')
  console.log('gateway <-', err.message)
})
