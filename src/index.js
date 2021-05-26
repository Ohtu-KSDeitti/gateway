const { ApolloServer } = require('apollo-server')
const { ApolloGateway } = require('@apollo/gateway')

require('dotenv').config()

const PORT = process.env.PORT

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
        if (requestContext.request.http?.headers.has('x-apollo-tracing')) {
          return
        }
        const query = requestContext.request.query?.replace(/\s+/g, ' ').trim()
        const variables = JSON.stringify(requestContext.request.variables)
        // eslint-disable-next-line max-len
        console.log('gateway-api <-', new Date().toISOString(), `- [Request Started] { query: ${query}, variables: ${variables}, operationName: ${requestContext.request.operationName} }`)
        return
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
