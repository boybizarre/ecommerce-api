const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name!'],
      trim: true,
    },

    slug: String,

    description: {
      type: String,
      required: [true, 'A product must have a description!'],
    },

    richDescription: {
      type: String,
      default: '',
    },

    // imageCover
    image: {
      type: String,
      default: '',
    },

    // images
    images: [String],

    brand: {
      type: String,
      default: '',
    },

    price: {
      type: Number,
      default: 0,
    },

    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: true,
    },

    countInStock: {
      type: Number,
      required: [true, 'A tour must have a count in stock!'],
      min: [0, 'Stock count must be above 0'],
      max: [255, 'Stock count must be below 255'],
    },

    ratingsAverage: {
      // ratings
      type: Number,
      default: 4.5,
      min: [1, 'Ratings must be above 1.0'],
      max: [5, 'Ratings must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },

    ratingsQuantity: {
      // numReviews
      type: Number,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'category',
    select: 'name icon color -_id',
  });

  next();
});

productSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
