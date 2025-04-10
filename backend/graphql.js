const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();
const port = 3006;

// Sample data
const products = [
    { id: 1, name: 'Apple', price: 1, stock: 10 },
    { id: 2, name: 'Banana', price: 2, stock: 5 }
];

// GraphQL schema
const schema = buildSchema(`
    type Product {
        id: Int
        name: String
        price: Int
        stock: Int
    }

    type Query {
        product(id: Int!): Product
        products: [Product]
    }
`);

// Root resolver
const root = {
    product: ({ id }) => products.find(product => product.id === id),
    products: () => products
};

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.listen(port, () => {
    console.log(`GraphQL server running at http://localhost:${port}/graphql`);
});