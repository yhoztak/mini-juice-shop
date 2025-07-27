const express = require('express');
const { executeCommand, processUserScript, compareSecrets, handleError, JWT_SECRET } = require('./logic');
const exec = require('child_process').exec;
const crypto = require('crypto');

const app = express();
const port = 3005;

// Hardcoded credentials and secrets
const ADMIN_PASSWORD = "admin123";
const SECRET_KEY = "banking-secret-key";

app.use(express.json());

// Simulated bank account balance
let accountBalance = 1000;
const transactions = [];

// Race Condition Vulnerability
app.post('/withdraw', (req, res) => {
    const amount = parseInt(req.query.amount, 10);
    if (accountBalance >= amount) {
        // Simulate delay
        setTimeout(() => {
            accountBalance -= amount;
            transactions.push({ type: 'withdraw', amount, timestamp: new Date() });
            res.send(`Withdrawn ${amount}. New balance: ${accountBalance}`);
        }, 1000);
    } else {
        res.status(400).send('Insufficient funds');
    }
});

// Command injection in banking operations
app.post('/admin/backup', (req, res) => {
    const backupPath = req.body.path || '/tmp/backup';
    const adminPassword = req.body.password;
    
    if (adminPassword === ADMIN_PASSWORD) {
        exec(`tar -czf ${backupPath}/bank_data.tar.gz ./data`, (error, stdout, stderr) => {
            if (error) {
                return handleError(error, res);
            }
            res.send(`Backup created at: ${backupPath}`);
        });
    } else {
        res.status(401).send('Unauthorized');
    }
});

// Unsafe eval for financial calculations
app.post('/calculate-interest', (req, res) => {
    const formula = req.body.formula;
    const principal = req.body.principal || 1000;
    
    try {
        const result = eval(`${formula.replace('P', principal)}`);
        res.json({ 
            principal,
            formula,
            interest: result
        });
    } catch (error) {
        handleError(error, res);
    }
});

// Timing attack vulnerability in secret comparison
app.post('/validate-pin', (req, res) => {
    const userPin = req.body.pin;
    const correctPin = "1234";
    
    if (compareSecrets(userPin, correctPin)) {
        res.json({ valid: true, message: "PIN correct" });
    } else {
        res.json({ valid: false, message: "Invalid PIN" });
    }
});

// Information disclosure endpoint
app.get('/system-status', (req, res) => {
    res.json({
        balance: accountBalance,
        transactions: transactions,
        environment: process.env,
        secrets: {
            adminPassword: ADMIN_PASSWORD,
            secretKey: SECRET_KEY,
            jwtSecret: JWT_SECRET
        },
        systemInfo: {
            platform: process.platform,
            version: process.version,
            uptime: process.uptime()
        }
    });
});

// Weak crypto for transaction signing
app.post('/sign-transaction', (req, res) => {
    const transaction = req.body.transaction;
    const hash = crypto.createHash('md5').update(JSON.stringify(transaction) + SECRET_KEY).digest('hex');
    
    res.json({
        transaction,
        signature: hash,
        algorithm: 'MD5'
    });
});

// Path traversal in transaction export
app.get('/export-transactions', (req, res) => {
    const filename = req.query.file || 'transactions.json';
    const fs = require('fs');
    
    try {
        const data = JSON.stringify(transactions, null, 2);
        fs.writeFileSync(`./exports/${filename}`, data);
        res.send(`Transactions exported to: ${filename}`);
    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack,
            filename: filename
        });
    }
});

app.listen(port, () => {
    console.log(`Race Condition app listening at http://localhost:${port}`);
    console.log(`Admin password: ${ADMIN_PASSWORD}`);
    console.log(`Secret key: ${SECRET_KEY}`);
});