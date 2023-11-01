const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// const authJwt = require('./utils/authJwt')
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const productRouter = require('./routes/productRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const userRouter = require('./routes/userRoutes');
const orderRouter = require('./routes/orderRoutes');

app.use(cors());
app.options('*', cors());

// middleware
// parse the request body
app.use(express.json());
app.use(cookieParser());

// 2) Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// authentication for the API like the customized protect middleware I created
// app.use(authJwt());

// middleware for adding request time to the request body
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

app.use(`${process.env.API_BASE_URL}/products`, productRouter);
app.use(`${process.env.API_BASE_URL}/categories`, categoryRouter);
app.use(`${process.env.API_BASE_URL}/users`, userRouter);
app.use(`${process.env.API_BASE_URL}/orders`, orderRouter);

app.use('*', (req, res, next) => {
  // whatever is passed into the next function is recognized as an error
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
