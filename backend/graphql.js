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

// Mock database for vulnerability demonstrations
const mockUsers = [
    { id: 1, name: 'admin', email: 'admin@graphql.com', password: 'admin123', role: 'admin' },
    { id: 2, name: 'user', email: 'user@graphql.com', password: 'user123', role: 'user' },
    { id: 3, name: 'guest', email: 'guest@graphql.com', password: 'guest123', role: 'guest' }
];

const mockProducts = [
    { id: 1, category: 'electronics', name: 'GraphQL Laptop', price: 1299 },
    { id: 2, category: 'electronics', name: 'GraphQL Phone', price: 799 },
    { id: 3, category: 'books', name: 'GraphQL Guide', price: 39 },
    { id: 4, category: 'clothing', name: 'GraphQL T-Shirt', price: 25 }
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
    
    // NoSQL injection vulnerability with actual execution simulation
    user: ({ filter }) => {
        try {
            // Simulate NoSQL injection vulnerability
            if (filter.includes("' || '1'=='1")) {
                return mockUsers[0]; // Return first user (admin) due to injection
            } else if (filter.includes("' || this.role=='admin")) {
                return mockUsers.find(u => u.role === 'admin');
            } else {
                return mockUsers.find(user => user.username === filter) || null;
            }
        } catch (error) {
            throw new Error(`User query failed: ${error.message}`);
        }
    },
    
    users: () => mockUsers, // Return mock users instead of original users
    
    // Information disclosure with actual sensitive data
    debug: () => {
        return JSON.stringify({
            environment: process.env,
            adminToken: ADMIN_TOKEN,
            apiKey: API_KEY,
            encryptionKey: ENCRYPTION_KEY,
            users: mockUsers,
            products: mockProducts,
            databaseConfig: {
                host: 'localhost',
                user: 'root',
                password: 'root123'
            }
        });
    },
    
    // SQL Injection via GraphQL with actual simulation
    getUserByName: ({ name }) => {
        try {
            if (name.includes("' OR '1'='1") || name.includes("' OR 1=1")) {
                return {
                    query: getUserByName(name),
                    result: mockUsers,
                    message: "SQL Injection successful! Retrieved all users via GraphQL."
                };
            } else if (name.includes("' UNION SELECT")) {
                return {
                    query: getUserByName(name),
                    result: [{ id: 999, name: 'injected_admin', email: 'evil@hacker.com', role: 'admin' }],
                    message: "UNION-based SQL injection via GraphQL!"
                };
            } else {
                const user = mockUsers.find(u => u.name === name);
                return {
                    query: getUserByName(name),
                    result: user ? [user] : [],
                    message: user ? "User found" : "User not found"
                };
            }
        } catch (error) {
            throw new Error(`SQL query failed: ${error.message}`);
        }
    },
    
    searchProducts: ({ category, minPrice }) => {
        try {
            if (category.includes("' OR '1'='1") || minPrice.includes(" OR 1=1")) {
                return {
                    query: searchProducts(category, minPrice),
                    result: mockProducts,
                    message: "SQL Injection successful! Retrieved all products via GraphQL."
                };
            } else if (category.includes("'; DROP TABLE") || minPrice.includes("; DROP TABLE")) {
                return {
                    query: searchProducts(category, minPrice),
                    result: [],
                    message: "Destructive SQL injection attempt detected via GraphQL!"
                };
            } else {
                const filteredProducts = mockProducts.filter(p => 
                    p.category.toLowerCase().includes(category.toLowerCase()) && 
                    p.price >= parseInt(minPrice) || 0
                );
                return {
                    query: searchProducts(category, minPrice),
                    result: filteredProducts,
                    message: `Found ${filteredProducts.length} products`
                };
            }
        } catch (error) {
            throw new Error(`Product search failed: ${error.message}`);
        }
    },
    
    // Command Injection via GraphQL with actual execution
    executeCommand: ({ command }) => {
        const { exec } = require('child_process');
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                resolve({
                    output: stdout || stderr || 'Command executed',
                    message: `Command "${command}" executed via GraphQL (vulnerable to injection)`,
                    error: error ? error.message : null
                });
            });
        });
    },
    
    pingHost: ({ hostname }) => {
        const { exec } = require('child_process');
        const command = `ping -c 1 ${hostname}`;
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                resolve({
                    output: stdout || stderr || 'Ping executed',
                    message: `Ping to "${hostname}" executed via GraphQL (vulnerable to injection)`
                });
            });
        });
    },
    
    // Weak random number generation with actual execution
    generateTokens: () => {
        const token = generateToken();
        const sessionId = createSessionId();
        return {
            token: token,
            sessionId: sessionId,
            message: "Generated using weak random number generation (Math.random)"
        };
    },
    
    // Email validation with ReDoS - actual vulnerability execution
    validateEmail: ({ email }) => {
        const startTime = Date.now();
        const isValid = validateEmail(email);
        const endTime = Date.now();
        const timeTaken = endTime - startTime;
        
        return {
            valid: isValid,
            input: email,
            timeTaken: `${timeTaken}ms`,
            message: timeTaken > 100 ? "Potential ReDoS detected!" : "Email validated"
        };
    },
    
    // Server-side Template Injection with actual execution
    renderTemplate: ({ template, input }) => {
        try {
            const result = renderTemplate(template, input);
            return result;
        } catch (error) {
            throw new Error(`Template rendering failed: ${error.message}`);
        }
    },
    
    // XPath Injection with actual query construction
    queryXML: ({ username }) => {
        const xpath = queryXML(username);
        return `XPath query: ${xpath} (vulnerable to injection)`;
    },
    
    // Weak authentication with actual vulnerability
    login: ({ username, password }) => {
        const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
        
        // Simulate timing attack vulnerability
        let user = null;
        for (const u of mockUsers) {
            if (u.username === username) {
                // Vulnerable comparison - not constant time
                if (hashPassword(password) === hashedPassword) {
                    user = u;
                    break;
                }
            }
        }
        
        if (user) {
            const token = Math.random().toString(36); // Weak token generation
            return {
                token: token,
                user: user
            };
        }
        
        throw new Error(`Authentication failed for user: ${username}`);
    },
    
    // Weak cryptography with actual encryption
    encrypt: ({ data }) => {
        const cipher = crypto.createCipher('des', ENCRYPTION_KEY);
        return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
    },
    
    // Enhanced weak cryptography mutation
    encryptData: ({ data }) => {
        try {
            const result = encryptData(data);
            return `Encrypted with weak DES: ${result}`;
        } catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    },
    
    // Code injection via eval with actual execution
    processScript: ({ script }) => {
        try {
            const result = processUserScript(script);
            return `Script result: ${String(result)}`;
        } catch (error) {
            throw new Error(`Script execution failed: ${error.message}`);
        }
    },
    
    // Math evaluation with eval - actual execution
    calculateExpression: ({ expression }) => {
        try {
            const result = calculateExpression(expression);
            return `Calculation result: ${String(result)}`;
        } catch (error) {
            throw new Error(`Expression evaluation failed: ${error.message}`);
        }
    },
    
    // Insecure Deserialization with actual parsing
    deserializeData: ({ data }) => {
        try {
            const result = deserializeData(data);
            return `Deserialized: ${JSON.stringify(result)}`;
        } catch (error) {
            throw new Error(`Deserialization failed: ${error.message}`);
        }
    },
    
    // Timing attack vulnerability with actual timing measurement
    compareSecret: ({ secret }) => {
        const actualSecret = 'graphql-secret-key-456';
        const startTime = process.hrtime.bigint();
        const isValid = compareSecrets(secret, actualSecret);
        const endTime = process.hrtime.bigint();
        const timeTaken = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        
        return {
            valid: isValid,
            input: secret,
            timeTaken: `${timeTaken.toFixed(3)}ms`,
            message: "Timing information exposed"
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
    console.log('');
    console.log('Available vulnerable GraphQL queries:');
    console.log('  product(id: Int!)');
    console.log('  products');
    console.log('  user(filter: String!) - Try: "admin\' || \'1\'==\'1"');
    console.log('  users');
    console.log('  debug - Exposes sensitive information');
    console.log('  getUserByName(name: String!) - Try: "admin\' OR \'1\'=\'1"');
    console.log('  searchProducts(category: String!, minPrice: String!) - Try category: "electronics\' OR \'1\'=\'1"');
    console.log('  executeCommand(command: String!) - Try: "ls; cat /etc/passwd"');
    console.log('  pingHost(hostname: String!) - Try: "localhost; ls -la"');
    console.log('  generateTokens - Weak random number generation');
    console.log('  validateEmail(email: String!) - Try: "test@example.com" or ReDoS payload');
    console.log('  renderTemplate(template: String!, input: String!) - Server-side template injection');
    console.log('  queryXML(username: String!) - XPath injection');
    console.log('');
    console.log('Available vulnerable GraphQL mutations:');
    console.log('  login(username: String!, password: String!) - Weak authentication');
    console.log('  encrypt(data: String!) - Weak DES encryption');
    console.log('  encryptData(data: String!) - Weak DES encryption');
    console.log('  processScript(script: String!) - Try: "console.log(process.env)"');
    console.log('  calculateExpression(expression: String!) - Try: "1+1" or "process.exit()"');
    console.log('  deserializeData(data: String!) - Insecure deserialization');
    console.log('  compareSecret(secret: String!) - Timing attack vulnerability');
    console.log('');
    console.log('Example vulnerable GraphQL query:');
    console.log('  query { getUserByName(name: "admin\' OR \'1\'=\'1") { query result { name email role } message } }');
    console.log('');
    console.log('Example vulnerable GraphQL mutation:');
    console.log('  mutation { processScript(script: "2+2") }');
});