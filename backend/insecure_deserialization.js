const express = require('express');
const app = express();
const port = 3002;
const bodyParser = require('body-parser');
const deserialize = require('deserialize'); // Hypothetical vulnerable deserialization library

app.use(bodyParser.json());

// Insecure Deserialization vulnerability
app.post('/deserialize', (req, res) => {
    try {
        const data = deserialize(req.body.serializedData); // Vulnerable to insecure deserialization
        res.send(`Deserialized data: ${JSON.stringify(data)}`);
    } catch (error) {
        res.status(500).send('Deserialization error');
    }
});

app.listen(port, () => {
    console.log(`Insecure Deserialization app listening at http://localhost:${port}`);
});