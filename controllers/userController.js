const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  if (!users) {
    return next(new AppError(`No users found`, 404));
  }

  res.status(200).json({
    status: 'success',
    results: users.length,
    requestedAt: req.requestTime,
    data: users,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError(`No user found with that ID`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
});
