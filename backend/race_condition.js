const express = require('express');
const app = express();
const port = 3005;

// Simulated bank account balance
let accountBalance = 1000;

// Race Condition Vulnerability
app.post('/withdraw', (req, res) => {
    const amount = parseInt(req.query.amount, 10);
    if (accountBalance >= amount) {
        // Simulate delay
        setTimeout(() => {
            accountBalance -= amount;
            res.send(`Withdrawn ${amount}. New balance: ${accountBalance}`);
        }, 1000);
    } else {
        res.status(400).send('Insufficient funds');
    }
});

app.listen(port, () => {
    console.log(`Race Condition app listening at http://localhost:${port}`);
});