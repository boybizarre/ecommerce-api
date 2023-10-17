
// const dotenv = require('dotenv');

// dotenv.config({ path: './config.env' });
require('dotenv/config');

const app = require('./app');

const port = 8000;

const server = app.listen(port, () => {
  // console.log(process.env.API_BASE_URL);
  console.log(`App running on port ${port}...`);
});

// node --env-file config.env server.js  