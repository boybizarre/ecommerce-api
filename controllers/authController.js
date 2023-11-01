// const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// const sendMail = require('../utils/email');

const signToken = (id) =>
  jwt.sign(
    {
      id,
      // role: user.role, // depending on whatever role user has, authorization changes
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // makes sure that the cookie is only sent on an encrypted connection https
    // secure: true,
    // makes sure that cookie cannot be accessed or modified anywhere by the browser. prevents cross side scripting attack
    httpOnly: true,
    // secure: req.secure || req.headers('x-forwarded-proto') === 'https',
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  console.log(token);

  // remove the password field
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    phone: req.body.phone,
    street: req.body.street,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    role: req.body.role,
  });

  createSendToken(newUser, 201, req, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) checking if email and password exist in request body
  if (!email || !password) {
    return next(new AppError('Please provide an email and password!', 400));
  }

  // 2) check if the user exist and the password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  // 3) return token if every check is passed
  createSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // getting token and checking if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    console.log(req.cookies.jwt);
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      )
    );
  }

  // verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded, 'DECODED');

  // 3) check if user still exist incase of user changing password or stole token
  // using decoded.id we can verify we are selecting the user for which we verified a token for
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.')
    );
  }

  // grant access to the protected route
  req.user = freshUser;

  // next middleware
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles ['admin', 'user']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    // next middleware
    next();
  };
