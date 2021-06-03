const { ApolloServer } = require('apollo-server')
const { ApolloGateway } = require('@apollo/gateway')

require('dotenv').config()

const PORT = process.env.PORT
const ENV = process.env.NODE_ENV

const gateway = new ApolloGateway({
  serviceList: [
    { name: 'user-api', url: process.env.USER_API },
  ],
})

const server = new ApolloServer({
  gateway,
  engine: false,
  subscriptions: false,
  plugins: [
    {
      requestDidStart: (requestContext) => {
        if ( requestContext.request.http?.headers.has( 'x-apollo-tracing' ) ) {
          return
        }
        if (ENV !== 'production') {
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
  console.log(`Server ready at ${url}`)
}).catch((err) => {
  console.log('gateway <- cannot connect to service(s)')
  console.log('gateway <-', err.message)
})
