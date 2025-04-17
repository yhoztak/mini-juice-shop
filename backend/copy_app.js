const express = require('express');
const app = express();
const port = 3000;

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

app.listen(port, () => {
    console.log(`Vulnerable app listening at http://localhost:${port}`);
});