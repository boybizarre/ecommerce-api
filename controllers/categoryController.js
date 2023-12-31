const Category = require('../models/categoryModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createCategory = catchAsync(async (req, res, next) => {
  const newCategory = await Category.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newCategory,
    },
  });
});

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find();

  if (!categories) return next(new AppError(`No categories found`, 404));

  res.status(200).json({
    status: 'success',
    results: categories.length,
    requestedAt: req.requestTime,
    data: categories,
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true, //returns the updated data in response
    runValidators: true,
  });

  if (!category) {
    return next(new AppError(`No category found with that ID`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: category,
  });
});

exports.getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError(`No category found with that ID`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: category,
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return next(new AppError(`No category found with that ID`, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
