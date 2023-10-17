const express = require('express');

const app = express();

// middleware
// parse the request body
app.use(express.json());

const baseUrl = process.env.API_BASE_URL; 

app.get(`${baseUrl}/products`, (req, res) => {
  const product = {
    id: 1,
    name: 'Hair Dresser',
    image: 'some_url',
  };

  res.send(product);
});

app.post(`${baseUrl}/products`, (req, res) => {
  const newProduct = req.body;
  console.log(newProduct);
  res.send(newProduct);
});

// console.log(baseUrl);

module.exports = app;
