const express = require('express');
const app = express();
const port = 3003;
const axios = require('axios');

// Server-Side Request Forgery (SSRF) vulnerability
app.get('/fetch', async (req, res) => {
    const url = req.query.url;
    try {
        const response = await axios.get(url); // Vulnerable to SSRF
        res.send(response.data);
    } catch (error) {
        res.status(500).send('Error fetching URL');
    }
});

app.listen(port, () => {
    console.log(`SSRF app listening at http://localhost:${port}`);
});