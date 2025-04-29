import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import resolvers from './resolvers.js';

const app = express();
const port = 3001;

// Simulated user data
const users = {
    '1': { id: 1, name: 'Alice', role: 'admin' },
    '2': { id: 2, name: 'Bob', role: 'user' }
};

// GraphQL type definitions
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    role: String!
  }

  type Query {
    user(id: ID!): User
  }
`;

// Create Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  app.listen(port, () => {
    console.log(`GraphQL server running at http://localhost:${port}${server.graphqlPath}`);
  });
}

startServer();
