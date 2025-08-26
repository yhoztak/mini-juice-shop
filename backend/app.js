const express = require('express');
const { 
    executeCommand, 
    readUserFile, 
    handleError, 
    deserializeData, 
    DATABASE_PASSWORD,
    getUserByName,
    searchProducts,
    pingHost,
    generateToken,
    processUserScript,
    calculateExpression,
    hashPassword,
    redirectUser,
    handleFileUpload,
    compareSecrets,
    validateEmail
} = require('./logic');
const exec = require('child_process').exec;
const fs = require('fs');
const app = express();
const port = 3000;

// Hardcoded credentials
const DB_CONFIG = {
    host: 'localhost',
    user: 'admin',
    password: 'password123',
    database: 'vulnerable_db'
};

// Mock database for SQL injection demonstrations
const mockUsers = [
    { id: 1, name: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
    { id: 2, name: 'user', email: 'user@example.com', password: 'user123', role: 'user' },
    { id: 3, name: 'guest', email: 'guest@example.com', password: 'guest123', role: 'guest' }
];

const mockProducts = [
    { id: 1, category: 'electronics', name: 'Laptop', price: 999 },
    { id: 2, category: 'electronics', name: 'Phone', price: 599 },
    { id: 3, category: 'books', name: 'JavaScript Guide', price: 29 },
    { id: 4, category: 'clothing', name: 'T-Shirt', price: 19 }
];

app.use(express.json());

// Intentionally vulnerable endpoint
app.get('/vulnerable', (req, res) => {
    const userInput = req.query.input;
    res.send(`User input: ${userInput}`);
});

// SQL Injection with actual execution simulation
app.get('/vulnerable-sql', (req, res) => {
    const userInput = req.query.input;
    const query = `SELECT * FROM users WHERE name = '${userInput}'`; // Vulnerable to SQL Injection
    
    // Simulate SQL injection by evaluating the constructed query
    try {
        // This simulates what would happen with real SQL injection
        if (userInput.includes("' OR '1'='1")) {
            res.json({
                query: query,
                result: mockUsers, // Returns all users due to injection
                message: "SQL Injection successful! All users returned."
            });
        } else if (userInput.includes("'; DROP TABLE")) {
            res.json({
                query: query,
                result: [],
                message: "SQL Injection detected - attempted table drop!"
            });
        } else {
            const user = mockUsers.find(u => u.name === userInput);
            res.json({
                query: query,
                result: user ? [user] : [],
                message: user ? "User found" : "User not found"
            });
        }
    } catch (error) {
        handleError(error, res);
    }
});

// Command Injection vulnerability with actual execution
app.get('/system-info', (req, res) => {
    const command = req.query.cmd || 'ls';
    exec(`${command}`, (error, stdout, stderr) => {
        if (error) {
            return handleError(error, res);
        }
        res.json({
            command: command,
            output: stdout,
            stderr: stderr
        });
    });
});

// Path Traversal vulnerability  
app.get('/download', (req, res) => {
    const filename = req.query.file;
    try {
        const content = fs.readFileSync(`./uploads/${filename}`, 'utf8');
        res.send(content);
    } catch (error) {
        handleError(error, res);
    }
});

// Enhanced SQL Injection endpoint using getUserByName with actual simulation
app.get('/user', (req, res) => {
    const username = req.query.name;
    if (!username) {
        return res.status(400).json({ error: 'Username parameter required' });
    }
    
    const query = getUserByName(username);
    
    // Actually simulate the SQL injection vulnerability
    try {
        if (username.includes("' OR '1'='1") || username.includes("' OR 1=1")) {
            res.json({ 
                query: query,
                result: mockUsers,
                message: 'SQL Injection successful! Retrieved all users.',
                vulnerability: 'SQL Injection'
            });
        } else if (username.includes("' UNION SELECT")) {
            res.json({
                query: query,
                result: [{ id: 999, name: 'injected', email: 'hacked@evil.com', role: 'admin' }],
                message: 'UNION-based SQL injection detected!',
                vulnerability: 'SQL Injection'
            });
        } else {
            const user = mockUsers.find(u => u.name === username);
            res.json({ 
                query: query,
                result: user ? [user] : [],
                message: user ? 'User found' : 'User not found'
            });
        }
    } catch (error) {
        handleError(error, res);
    }
});

// Enhanced SQL Injection for product search with actual simulation
app.get('/products', (req, res) => {
    const category = req.query.category || '';
    const minPrice = req.query.minPrice || '0';
    
    const query = searchProducts(category, minPrice);
    
    // Simulate SQL injection in product search
    try {
        if (category.includes("' OR '1'='1") || minPrice.includes(" OR 1=1")) {
            res.json({
                query: query,
                result: mockProducts,
                message: 'SQL Injection successful! Retrieved all products.',
                vulnerability: 'SQL Injection'
            });
        } else if (category.includes("'; DROP TABLE") || minPrice.includes("; DROP TABLE")) {
            res.json({
                query: query,
                result: [],
                message: 'Destructive SQL injection attempt detected!',
                vulnerability: 'SQL Injection - Table Drop Attempt'
            });
        } else {
            const filteredProducts = mockProducts.filter(p => 
                p.category.toLowerCase().includes(category.toLowerCase()) && 
                p.price >= parseInt(minPrice) || 0
            );
            res.json({
                query: query,
                result: filteredProducts,
                message: `Found ${filteredProducts.length} products`
            });
        }
    } catch (error) {
        handleError(error, res);
    }
});

// Command Injection endpoint with actual execution
app.get('/ping', (req, res) => {
    const hostname = req.query.host;
    if (!hostname) {
        return res.status(400).json({ error: 'Host parameter required' });
    }
    
    // Actually execute the vulnerable ping command
    const command = `ping -c 1 ${hostname}`;
    exec(command, (error, stdout, stderr) => {
        res.json({
            command: command,
            output: stdout,
            stderr: stderr,
            error: error ? error.message : null,
            message: 'Command executed (vulnerable to injection)',
            vulnerability: 'Command Injection'
        });
    });
});

// Unsafe eval endpoint using processUserScript with actual execution
app.post('/execute-script', (req, res) => {
    const userScript = req.body.script;
    if (!userScript) {
        return res.status(400).json({ error: 'Script parameter required' });
    }
    
    try {
        const result = processUserScript(userScript);
        res.json({ 
            script: userScript,
            result: result,
            message: 'Script executed successfully',
            vulnerability: 'Code Injection via eval()'
        });
    } catch (error) {
        res.json({
            script: userScript,
            error: error.message,
            message: 'Script execution failed',
            vulnerability: 'Code Injection via eval()'
        });
    }
});

// Math evaluation endpoint with actual eval execution
app.post('/eval-math', (req, res) => {
    const expression = req.body.expression;
    if (!expression) {
        return res.status(400).json({ error: 'Expression parameter required' });
    }
    
    try {
        const result = calculateExpression(expression);
        res.json({ 
            expression: expression,
            result: result,
            message: 'Expression evaluated successfully',
            vulnerability: 'Code Injection via eval()'
        });
    } catch (error) {
        res.json({
            expression: expression,
            error: error.message,
            message: 'Expression evaluation failed',
            vulnerability: 'Code Injection via eval()'
        });
    }
});

// Insecure Deserialization with actual parsing
app.post('/process-data', (req, res) => {
    try {
        const userData = JSON.parse(req.body.data);
        res.json({ 
            processed: userData,
            message: 'Data deserialized successfully',
            vulnerability: 'Insecure Deserialization'
        });
    } catch (error) {
        res.status(500).json({ 
            error: error.message,
            stack: error.stack,
            config: DB_CONFIG,
            vulnerability: 'Information Disclosure + Insecure Deserialization'
        });
    }
});

// Unsafe eval endpoint with actual execution
app.post('/calculate', (req, res) => {
    const expression = req.body.expression;
    try {
        const result = eval(expression);
        res.json({ 
            expression: expression,
            result: result, 
            vulnerability: 'Code Injection via eval()'
        });
    } catch (error) {
        handleError(error, res);
    }
});

// Weak token generation endpoint with actual generation
app.get('/generate-token', (req, res) => {
    const token = generateToken();
    res.json({ 
        token,
        message: 'Generated using weak random number generation (Math.random)',
        vulnerability: 'Weak Random Number Generation'
    });
});

// Password hashing endpoint with actual weak crypto
app.post('/hash-password', (req, res) => {
    const password = req.body.password;
    if (!password) {
        return res.status(400).json({ error: 'Password parameter required' });
    }
    
    const hashedPassword = hashPassword(password);
    res.json({ 
        original: password,
        hashed: hashedPassword,
        algorithm: 'MD5 (weak)',
        vulnerability: 'Weak Cryptography'
    });
});

// Redirect endpoint with unvalidated redirect
app.get('/redirect', (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'URL parameter required' });
    }
    
    res.redirect(url); // Actual redirect - vulnerable to redirect attacks
});

// File upload endpoint with actual file writing
app.post('/upload', (req, res) => {
    const filename = req.body.filename;
    const content = req.body.content;
    
    if (!filename || !content) {
        return res.status(400).json({ error: 'Filename and content required' });
    }
    
    try {
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync('./uploads')) {
            fs.mkdirSync('./uploads');
        }
        
        handleFileUpload(filename, content);
        res.json({ 
            message: `File ${filename} uploaded successfully`,
            path: `./uploads/${filename}`,
            vulnerability: 'Insecure File Upload'
        });
    } catch (error) {
        handleError(error, res);
    }
});

// Secret comparison endpoint with timing attack vulnerability
app.post('/verify-secret', (req, res) => {
    const userSecret = req.body.secret;
    const actualSecret = 'super-secret-key-123';
    
    if (!userSecret) {
        return res.status(400).json({ error: 'Secret parameter required' });
    }
    
    const startTime = process.hrtime.bigint();
    const isValid = compareSecrets(userSecret, actualSecret);
    const endTime = process.hrtime.bigint();
    const timeTaken = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    res.json({ 
        valid: isValid,
        message: isValid ? 'Secret is correct' : 'Secret is incorrect',
        timeTaken: `${timeTaken.toFixed(3)}ms`,
        vulnerability: 'Timing Attack'
    });
});

// Email validation endpoint with ReDoS vulnerability - actual vulnerability
app.post('/validate-email', (req, res) => {
    const email = req.body.email;
    
    if (!email) {
        return res.status(400).json({ error: 'Email parameter required' });
    }
    
    const startTime = Date.now();
    const isValid = validateEmail(email);
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    
    res.json({ 
        email,
        valid: isValid,
        timeTaken: `${timeTaken}ms`,
        vulnerability: 'Regular Expression Denial of Service (ReDoS)'
    });
});

// Debug endpoint exposing sensitive information
app.get('/debug', (req, res) => {
    res.json({
        environment: process.env,
        database_password: DATABASE_PASSWORD,
        config: DB_CONFIG,
        mockUsers: mockUsers,
        mockProducts: mockProducts,
        vulnerability: 'Information Disclosure'
    });
});

// Path traversal with actual file reading
app.get('/read-file', (req, res) => {
    const filename = req.query.file;
    if (!filename) {
        return res.status(400).json({ error: 'File parameter required' });
    }
    
    try {
        const content = readUserFile(filename);
        res.json({
            filename: filename,
            content: content,
            vulnerability: 'Path Traversal'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            filename: filename,
            vulnerability: 'Path Traversal'
        });
    }
});

// XXE vulnerability endpoint
app.post('/parse-xml', (req, res) => {
    const xmlData = req.body.xml;
    if (!xmlData) {
        return res.status(400).json({ error: 'XML data required' });
    }
    
    try {
        const xml2js = require('xml2js');
        const parser = new xml2js.Parser({
            explicitArray: false,
            mergeAttrs: true,
            // Vulnerable settings that enable XXE
            explicitCharkey: false
        });
        
        parser.parseString(xmlData, (err, result) => {
            if (err) {
                res.status(500).json({
                    error: err.message,
                    vulnerability: 'XML External Entity (XXE)'
                });
            } else {
                res.json({
                    parsed: result,
                    vulnerability: 'XML External Entity (XXE)'
                });
            }
        });
    } catch (error) {
        handleError(error, res);
    }
});

app.listen(port, () => {
    console.log(`Vulnerable app listening at http://localhost:${port}`);
    console.log('Available vulnerable endpoints:');
    console.log('  GET  /vulnerable?input=<input>');
    console.log('  GET  /vulnerable-sql?input=<input>');
    console.log('  GET  /system-info?cmd=<command>');
    console.log('  GET  /download?file=<filename>');
    console.log('  GET  /user?name=<username>');
    console.log('  GET  /products?category=<cat>&minPrice=<price>');
    console.log('  GET  /ping?host=<hostname>');
    console.log('  GET  /generate-token');
    console.log('  GET  /redirect?url=<url>');
    console.log('  GET  /debug');
    console.log('  GET  /read-file?file=<filename>');
    console.log('  POST /execute-script (body: {"script": "code"})');
    console.log('  POST /eval-math (body: {"expression": "1+1"})');
    console.log('  POST /process-data (body: {"data": "json"})');
    console.log('  POST /calculate (body: {"expression": "1+1"})');
    console.log('  POST /hash-password (body: {"password": "pass"})');
    console.log('  POST /upload (body: {"filename": "file.txt", "content": "data"})');
    console.log('  POST /verify-secret (body: {"secret": "key"})');
    console.log('  POST /validate-email (body: {"email": "test@example.com"})');
    console.log('  POST /parse-xml (body: {"xml": "<root></root>"})');
});