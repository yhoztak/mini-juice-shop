const express = require('express');
const app = express();
const port = 3004;

// Simulated product inventory
let inventory = {
    'apple': { price: 1, stock: 10 },
    'banana': { price: 2, stock: 5 }
};

// Business Logic Vulnerability
app.post('/purchase', (req, res) => {
    const { product, quantity } = req.query;
    if (inventory[product] && inventory[product].stock >= quantity) {
        inventory[product].stock -= quantity;
        res.send(`Purchased ${quantity} ${product}(s)`);
    } else {
        res.status(400).send('Insufficient stock');
    }
});

// Flawed logic: allows negative quantity to increase stock
app.post('/return', (req, res) => {
    const { product, quantity } = req.query;
    if (inventory[product]) {
        inventory[product].stock += quantity; // Allows negative quantity
        res.send(`Returned ${quantity} ${product}(s)`);
    } else {
        res.status(400).send('Invalid product');
    }
});

app.listen(port, () => {
    console.log(`Business Logic app listening at http://localhost:${port}`);
});