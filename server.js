const mongoose = require('mongoose');
// const dotenv = require('dotenv');
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message, err.stack);

  // By doing this we are giving the server time to run the remaining requests and gracefully shutdown
  process.exit(1);
});

// dotenv.config({ path: './config.env' });
require('dotenv/config');
const app = require('./app');     

const db = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

console.log(db);

mongoose
  .connect(db)
  .then((connection) => {
    console.log('Connection successful!');
  })
  .catch((err) => {
    console.log(err);
  });

const port = 8000;

const server = app.listen(port, () => {
  // console.log(process.env.API_BASE_URL);
  console.log(`App running on port ${port}...`);
});

// unhandled rejections are errors that have to do with unresolved promises
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);

  // By doing this we are giving the server time to run the remaining requests and gracefully shutdown
  server.close(() => {
    process.exit(1);
  });
});

// node --env-file config.env server.js
