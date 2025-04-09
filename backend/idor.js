const express = require('express');
const app = express();
const port = 3001;

// Simulated user data
const users = {
    '1': { id: 1, name: 'Alice', role: 'admin' },
    '2': { id: 2, name: 'Bob', role: 'user' }
};

// Simulated login endpoint
app.post('/login', (req, res) => {
    const { userId } = req.query;
    const user = users[userId];
    if (user) {
        res.send(`Logged in as ${user.name}`);
    } else {
        res.status(401).send('Invalid user');
    }
});

// Insecure Direct Object Reference (IDOR) vulnerability
app.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    const user = users[userId];
    if (user) {
        res.json(user); // No authorization check
    } else {
        res.status(404).send('User not found');
    }
});

app.listen(port, () => {
    console.log(`IDOR app listening at http://localhost:${port}`);
});