const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

// checking if it's an image that is being uploaded
const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(
      new AppError('Not an image! Please upload only images.', 400),
      false
    );
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// exports.uploadProductPhoto = upload.single('photo');

// for uploading multiple fields with multiple images
exports.uploadProductImages = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeProductImages = catchAsync(async (req, res, next) => {
  console.log(req.files);

  if (!req.files.image || !req.files.images) return next();

  // setting the file to req.body.image so that the next middleware has access to it -updateProduct
  req.body.image = `product-${req.params.id}-${Date.now()}-image.jpeg`;

  // 1) saving image to our folder structure
  await sharp(req.files.image[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/imgs/products/${req.body.image}`);

  // 2) saving images to our folder structure
  req.body.images = [];

  await Promise.all(
    // using map so the result of the loop can be saved and resolved using Promise.all
    req.files.images.map(async (file, index) => {
      const filename = `product-${req.params.id}-${Date.now()}-${
        index + 1
      }.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/imgs/products/${filename}`);

      req.body.images.push(filename);
    })
  );

  console.log(req.body);
  // next middleware is the updateProduct where all the images are available on the request object
  next();
});

exports.getCount = catchAsync(async (req, res, next) => {
  const count = await Product.countDocuments();

  res.status(200).json({
    status: 'success',
    count,
  });
});

exports.getIsFeatured = catchAsync(async (req, res, next) => {
  const count = req.query.count * 1;

  const featuredProducts = await Product.find({ isFeatured: true }).limit(
    +count
  );

  if (!featuredProducts) {
    return next(new AppError(`No featured products found`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: featuredProducts,
  });
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => {
      delete queryObj[el];
    });

    // console.log(req.query);
    // console.log(queryObj);

    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // console.log(queryStr);

    const products = await Product.find(JSON.parse(queryStr));

    if (!products) return next(new AppError(`No products found`, 404));

    res.status(200).json({
      status: 'success',
      results: products.length,
      requestedAt: req.requestTime,
      data: {
        products,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      data: err,
    });
  }
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.body.category);

  if (!category) return next(new AppError(`Invalid category`, 404));

  const newProduct = await Product.create({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    // image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    isFeatured: req.body.isFeatured,
  });

  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError(`No product found with that ID`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: product,
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError(`Invalid product ID`, 404));
  }

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, //returns the updated data in response
    runValidators: true,
  });

  if (!product) {
    return next(new AppError(`No product found with that ID`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: product,
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError(`No product found with that ID`, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
