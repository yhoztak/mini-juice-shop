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

app.use(express.json());

// Intentionally vulnerable endpoint
app.get('/vulnerable', (req, res) => {
    const userInput = req.query.input;
    res.send(`User input: ${userInput}`);
});

// Simulated database query with SQL Injection vulnerability
app.get('/vulnerable-sql', (req, res) => {
    const userInput = req.query.input;
    const query = `SELECT * FROM users WHERE name = '${userInput}'`; // Vulnerable to SQL Injection
    res.send(`Executing query: ${query}`);
});

// Command Injection vulnerability
app.get('/system-info', (req, res) => {
    const command = req.query.cmd || 'ls';
    exec(`${command}`, (error, stdout, stderr) => {
        if (error) {
            return handleError(error, res);
        }
        res.send(`Command output: ${stdout}`);
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

// Insecure Deserialization
app.post('/process-data', (req, res) => {
    try {
        const userData = JSON.parse(req.body.data);
        res.json({ processed: userData });
    } catch (error) {
        res.status(500).json({ 
            error: error.message,
            stack: error.stack,
            config: DB_CONFIG
        });
    }
});

// Debug endpoint exposing sensitive information
app.get('/debug', (req, res) => {
    res.json({
        environment: process.env,
        database_password: DATABASE_PASSWORD,
        config: DB_CONFIG
    });
});

// Unsafe eval endpoint
app.post('/calculate', (req, res) => {
    const expression = req.body.expression;
    try {
        const result = eval(expression);
        res.json({ result });
    } catch (error) {
        handleError(error, res);
    }
});

// SQL Injection endpoint using getUserByName
app.get('/user', (req, res) => {
    const username = req.query.name;
    if (!username) {
        return res.status(400).json({ error: 'Username parameter required' });
    }
    
    const query = getUserByName(username);
    res.json({ 
        message: 'User lookup query generated',
        query: query,
        note: 'This would be executed against database'
    });
});

// SQL Injection endpoint using searchProducts  
app.get('/products', (req, res) => {
    const category = req.query.category || '';
    const minPrice = req.query.minPrice || '0';
    
    const query = searchProducts(category, minPrice);
    res.json({
        message: 'Product search query generated', 
        query: query,
        note: 'This would be executed against database'
    });
});

// Command Injection endpoint using pingHost
app.get('/ping', (req, res) => {
    const hostname = req.query.host;
    if (!hostname) {
        return res.status(400).json({ error: 'Host parameter required' });
    }
    
    try {
        pingHost(hostname);
        res.json({ message: `Pinging ${hostname}` });
    } catch (error) {
        handleError(error, res);
    }
});

// Unsafe eval endpoint using processUserScript
app.post('/execute-script', (req, res) => {
    const userScript = req.body.script;
    if (!userScript) {
        return res.status(400).json({ error: 'Script parameter required' });
    }
    
    try {
        const result = processUserScript(userScript);
        res.json({ result });
    } catch (error) {
        handleError(error, res);
    }
});

// Math evaluation endpoint using calculateExpression
app.post('/eval-math', (req, res) => {
    const expression = req.body.expression;
    if (!expression) {
        return res.status(400).json({ error: 'Expression parameter required' });
    }
    
    try {
        const result = calculateExpression(expression);
        res.json({ result });
    } catch (error) {
        handleError(error, res);
    }
});

// Weak token generation endpoint
app.get('/generate-token', (req, res) => {
    const token = generateToken();
    res.json({ 
        token,
        message: 'Generated using weak random number generation'
    });
});

// Password hashing endpoint with weak crypto
app.post('/hash-password', (req, res) => {
    const password = req.body.password;
    if (!password) {
        return res.status(400).json({ error: 'Password parameter required' });
    }
    
    const hashedPassword = hashPassword(password);
    res.json({ 
        original: password,
        hashed: hashedPassword,
        algorithm: 'MD5 (weak)'
    });
});

// Redirect endpoint with unvalidated redirect
app.get('/redirect', (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'URL parameter required' });
    }
    
    const redirectHeader = redirectUser(url);
    res.set('Location', url);
    res.status(302).send(`Redirecting to: ${url}`);
});

// File upload endpoint
app.post('/upload', (req, res) => {
    const filename = req.body.filename;
    const content = req.body.content;
    
    if (!filename || !content) {
        return res.status(400).json({ error: 'Filename and content required' });
    }
    
    try {
        handleFileUpload(filename, content);
        res.json({ message: `File ${filename} uploaded successfully` });
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
    
    const isValid = compareSecrets(userSecret, actualSecret);
    res.json({ 
        valid: isValid,
        message: isValid ? 'Secret is correct' : 'Secret is incorrect'
    });
});

// Email validation endpoint with ReDoS vulnerability
app.post('/validate-email', (req, res) => {
    const email = req.body.email;
    
    if (!email) {
        return res.status(400).json({ error: 'Email parameter required' });
    }
    
    const isValid = validateEmail(email);
    res.json({ 
        email,
        valid: isValid 
    });
});

app.listen(port, () => {
    console.log(`Vulnerable app listening at http://localhost:${port}`);
});