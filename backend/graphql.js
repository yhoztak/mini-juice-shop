const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { 
    findUser, 
    hashPassword, 
    handleError, 
    API_KEY,
    getUserByName,
    searchProducts,
    executeCommand,
    pingHost,
    generateToken,
    createSessionId,
    processUserScript,
    calculateExpression,
    encryptData,
    queryXML,
    renderTemplate,
    deserializeData,
    redirectUser,
    compareSecrets,
    validateEmail
} = require('./logic');
const crypto = require('crypto');

const app = express();
const port = 3006;

// Hardcoded API credentials
const ADMIN_TOKEN = "admin-secret-token-123";
const ENCRYPTION_KEY = "weak-key";

// Sample data
const products = [
    { id: 1, name: 'Apple', price: 1, stock: 10 },
    { id: 2, name: 'Banana', price: 2, stock: 5 }
];

const users = [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
    { id: 2, username: 'user', password: 'user123', role: 'user' }
];

// GraphQL schema
const schema = buildSchema(`
    type Product {
        id: Int
        name: String
        price: Int
        stock: Int
    }

    type User {
        id: Int
        username: String
        password: String
        role: String
    }

    type AuthPayload {
        token: String
        user: User
    }

    type QueryResult {
        query: String
        message: String
    }

    type CommandResult {
        output: String
        message: String
    }

    type TokenResult {
        token: String
        sessionId: Int
        message: String
    }

    type ValidationResult {
        valid: Boolean
        input: String
    }

    type Query {
        product(id: Int!): Product
        products: [Product]
        user(filter: String!): User
        users: [User]
        debug: String
        # New vulnerable queries
        getUserByName(name: String!): QueryResult
        searchProducts(category: String!, minPrice: String!): QueryResult
        executeCommand(command: String!): CommandResult
        pingHost(hostname: String!): CommandResult
        generateTokens: TokenResult
        validateEmail(email: String!): ValidationResult
        renderTemplate(template: String!, input: String!): String
        queryXML(username: String!): String
    }

    type Mutation {
        login(username: String!, password: String!): AuthPayload
        encrypt(data: String!): String
        # New vulnerable mutations
        encryptData(data: String!): String
        processScript(script: String!): String
        calculateExpression(expression: String!): String
        deserializeData(data: String!): String
        compareSecret(secret: String!): ValidationResult
    }
`);

// Root resolver
const root = {
    product: ({ id }) => products.find(product => product.id === id),
    products: () => products,
    
    // NoSQL injection vulnerability
    user: ({ filter }) => {
        const query = { $where: `this.username == '${filter}'` };
        return users.find(user => eval(`user.username == '${filter}'`));
    },
    
    users: () => users,
    
    // Information disclosure
    debug: () => {
        return JSON.stringify({
            environment: process.env,
            adminToken: ADMIN_TOKEN,
            apiKey: API_KEY,
            encryptionKey: ENCRYPTION_KEY,
            users: users
        });
    },
    
    // Weak authentication
    login: ({ username, password }) => {
        const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
        const user = users.find(u => u.username === username && hashPassword(password) === hashedPassword);
        
        if (user) {
            const token = Math.random().toString(36);
            return {
                token: token,
                user: user
            };
        }
        
        throw new Error(`Authentication failed for user: ${username}`);
    },
    
    // Weak cryptography
    encrypt: ({ data }) => {
        const cipher = crypto.createCipher('des', ENCRYPTION_KEY);
        return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
    },
    
    // SQL Injection via GraphQL
    getUserByName: ({ name }) => {
        const query = getUserByName(name);
        return {
            query: query,
            message: "Generated SQL query (vulnerable to injection)"
        };
    },
    
    searchProducts: ({ category, minPrice }) => {
        const query = searchProducts(category, minPrice);
        return {
            query: query,
            message: "Generated product search query (vulnerable to injection)"
        };
    },
    
    // Command Injection via GraphQL
    executeCommand: ({ command }) => {
        try {
            executeCommand(command);
            return {
                output: `Executing: ${command}`,
                message: "Command executed (vulnerable to injection)"
            };
        } catch (error) {
            throw new Error(`Command execution failed: ${error.message}`);
        }
    },
    
    pingHost: ({ hostname }) => {
        try {
            pingHost(hostname);
            return {
                output: `Pinging ${hostname}`,
                message: "Ping command executed (vulnerable to injection)"
            };
        } catch (error) {
            throw new Error(`Ping failed: ${error.message}`);
        }
    },
    
    // Weak random number generation
    generateTokens: () => {
        const token = generateToken();
        const sessionId = createSessionId();
        return {
            token: token,
            sessionId: sessionId,
            message: "Generated using weak random number generation"
        };
    },
    
    // Email validation with ReDoS
    validateEmail: ({ email }) => {
        const isValid = validateEmail(email);
        return {
            valid: isValid,
            input: email
        };
    },
    
    // Server-side Template Injection
    renderTemplate: ({ template, input }) => {
        try {
            return renderTemplate(template, input);
        } catch (error) {
            throw new Error(`Template rendering failed: ${error.message}`);
        }
    },
    
    // XPath Injection
    queryXML: ({ username }) => {
        return queryXML(username);
    },
    
    // Weak cryptography mutation
    encryptData: ({ data }) => {
        try {
            return encryptData(data);
        } catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    },
    
    // Code injection via eval
    processScript: ({ script }) => {
        try {
            const result = processUserScript(script);
            return String(result);
        } catch (error) {
            throw new Error(`Script execution failed: ${error.message}`);
        }
    },
    
    // Math evaluation with eval
    calculateExpression: ({ expression }) => {
        try {
            const result = calculateExpression(expression);
            return String(result);
        } catch (error) {
            throw new Error(`Expression evaluation failed: ${error.message}`);
        }
    },
    
    // Insecure Deserialization
    deserializeData: ({ data }) => {
        try {
            const result = deserializeData(data);
            return JSON.stringify(result);
        } catch (error) {
            throw new Error(`Deserialization failed: ${error.message}`);
        }
    },
    
    // Timing attack vulnerability
    compareSecret: ({ secret }) => {
        const actualSecret = 'graphql-secret-key-456';
        const isValid = compareSecrets(secret, actualSecret);
        return {
            valid: isValid,
            input: secret
        };
    }
};

// Custom error formatting that leaks information
const customFormatError = (error) => {
    return {
        message: error.message,
        locations: error.locations,
        path: error.path,
        stack: error.stack,
        source: error.source
    };
};

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
    formatError: customFormatError
}));

// Debug endpoint
app.get('/api-info', (req, res) => {
    res.json({
        adminToken: ADMIN_TOKEN,
        apiKey: API_KEY,
        version: "1.0.0-vulnerable"
    });
});

app.listen(port, () => {
    console.log(`GraphQL server running at http://localhost:${port}/graphql`);
    console.log(`Admin token: ${ADMIN_TOKEN}`);
});