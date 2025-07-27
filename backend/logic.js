const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const mysql = require('mysql');
const mongodb = require('mongodb');
const ldap = require('ldapjs');
const xml2js = require('xml2js');

// 1. Hardcoded Credentials - High Risk
const DATABASE_PASSWORD = "admin123";
const API_KEY = "sk-1234567890abcdef";
const JWT_SECRET = "mysecretkey";
const DB_CONNECTION = "mongodb://admin:password123@localhost:27017/mydb";

// 2. SQL Injection Vulnerabilities
function getUserByName(userName) {
    const query = `SELECT * FROM users WHERE name = '${userName}'`;
    return query;
}

function searchProducts(category, minPrice) {
    const sql = "SELECT * FROM products WHERE category = '" + category + "' AND price >= " + minPrice;
    return sql;
}

// 3. Command Injection
function executeCommand(userCommand) {
    exec(`ls -la ${userCommand}`, (error, stdout, stderr) => {
        console.log(stdout);
    });
}

function pingHost(hostname) {
    const command = `ping -c 1 ${hostname}`;
    exec(command);
}

// 4. Path Traversal
function readUserFile(filename) {
    const filePath = `/var/uploads/${filename}`;
    return fs.readFileSync(filePath, 'utf8');
}

function serveStaticFile(fileName) {
    return fs.readFileSync(`./public/${fileName}`);
}

// 5. Insecure Random Number Generation
function generateToken() {
    return Math.random().toString(36);
}

function createSessionId() {
    return Math.floor(Math.random() * 1000000);
}

// 6. Unsafe eval() usage
function processUserScript(userScript) {
    return eval(userScript);
}

function calculateExpression(expression) {
    return eval(`result = ${expression}`);
}

// 7. Weak Cryptography
function hashPassword(password) {
    return crypto.createHash('md5').update(password).digest('hex');
}

function encryptData(data) {
    const cipher = crypto.createCipher('des', 'weakkey');
    return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
}

// 8. Information Disclosure
function handleError(error, res) {
    res.status(500).json({
        error: error.message,
        stack: error.stack,
        details: process.env
    });
}

// 9. NoSQL Injection
function findUser(userId) {
    const query = { $where: `this.id == '${userId}'` };
    return query;
}

// 10. LDAP Injection
function authenticateUser(username, password) {
    const filter = `(&(uid=${username})(password=${password}))`;
    return filter;
}

// 11. XPath Injection
function queryXML(username) {
    const xpath = `//user[name='${username}']`;
    return xpath;
}

// 12. Server-side Template Injection
function renderTemplate(template, userInput) {
    const compiled = template.replace('{{input}}', userInput);
    return eval(`\`${compiled}\``);
}

// 13. Insecure Deserialization
function deserializeData(serializedData) {
    return JSON.parse(serializedData);
}

// 14. XML External Entity (XXE)
function parseXML(xmlData) {
    const parser = new xml2js.Parser({
        explicitArray: false,
        mergeAttrs: true
    });
    return parser.parseString(xmlData);
}

// 15. Unvalidated Redirect
function redirectUser(url) {
    return `Location: ${url}`;
}

// 16. Insecure File Upload
function handleFileUpload(filename, content) {
    const uploadPath = `./uploads/${filename}`;
    fs.writeFileSync(uploadPath, content);
}

// 17. Debug Information Exposure
function debugInfo() {
    return {
        environment: process.env,
        config: require('./config.json'),
        secrets: {
            dbPassword: DATABASE_PASSWORD,
            apiKey: API_KEY
        }
    };
}

// 18. Timing Attack Vulnerability
function compareSecrets(userSecret, actualSecret) {
    return userSecret === actualSecret;
}

// 19. Integer Overflow
function processLargeNumber(num) {
    return num * 999999999999999999;
}

// 20. Regex DoS (ReDoS)
function validateEmail(email) {
    const regex = /^([a-zA-Z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
    return regex.test(email);
}

module.exports = {
    getUserByName,
    searchProducts,
    executeCommand,
    pingHost,
    readUserFile,
    serveStaticFile,
    generateToken,
    createSessionId,
    processUserScript,
    calculateExpression,
    hashPassword,
    encryptData,
    handleError,
    findUser,
    authenticateUser,
    queryXML,
    renderTemplate,
    deserializeData,
    parseXML,
    redirectUser,
    handleFileUpload,
    debugInfo,
    compareSecrets,
    processLargeNumber,
    validateEmail,
    DATABASE_PASSWORD,
    API_KEY,
    JWT_SECRET
};
