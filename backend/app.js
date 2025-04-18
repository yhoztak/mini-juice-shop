const express = require('express');
const app = express();
const port = 3000;

// Intentionally vulnerable endpoint
app.get('/vulnerable', (req, res) => {
    const userInput = req.query.input;
    res.send(`User input: ${userInput}`);
});

const db = require('your-database-library'); // Hypothetical database library
// Simulated database query with SQL Injection vulnerability
app.get('/vulnerable-sql', (req, res) => {
    const query = 'SELECT * FROM users WHERE name = ?';
    db.execute(query, [req.query.input], (err, results) => {
        if (err) {
    return res.status(500).send('Database error');
}
});
res.send(`Executing query with sanitized input: ${JSON.stringify(results)}`);

});
app.listen(port, () => {
    console.log(`Vulnerable app listening at http://localhost:${port}`);
});