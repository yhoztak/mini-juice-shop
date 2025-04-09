const express = require('express');
const app = express();
const port = 3006;

// Hardcoded API key (vulnerability)
const apiKey = '12345-ABCDE';

// Simulated currency conversion rates with historical data
const conversionRates = {
    'USD': { 'EUR': 0.85, 'JPY': 110, 'history': { '2025-04-01': { 'EUR': 0.84, 'JPY': 109 } } },
    'EUR': { 'USD': 1.18, 'JPY': 129, 'history': { '2025-04-01': { 'USD': 1.17, 'JPY': 128 } } },
    'JPY': { 'USD': 0.0091, 'EUR': 0.0078, 'history': { '2025-04-01': { 'USD': 0.0090, 'EUR': 0.0077 } } }
};

// Currency conversion endpoint
app.get('/convert', (req, res) => {
    const { from, to, amount, key, date } = req.query;
    if (key !== apiKey) {
        return res.status(403).send('Invalid API key');
    }
    let rate = conversionRates[from] && conversionRates[from][to];
    if (date && conversionRates[from].history && conversionRates[from].history[date]) {
        rate = conversionRates[from].history[date][to];
    }
    if (rate) {
        const convertedAmount = amount * rate;
        res.send(`Converted amount: ${convertedAmount} ${to}`);
    } else {
        res.status(400).send('Invalid currency conversion request');
    }
});

// Endpoint to list available currencies
app.get('/currencies', (req, res) => {
    const { key } = req.query;
    if (key !== apiKey) {
        return res.status(403).send('Invalid API key');
    }
    const currencies = Object.keys(conversionRates);
    res.send(`Available currencies: ${currencies.join(', ')}`);
});

app.listen(port, () => {
    console.log(`Currency Conversion microservice listening at http://localhost:${port}`);
});