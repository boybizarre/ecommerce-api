const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderItems: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'OrderItem',
      required: true,
    },
  ],

  shippingAddress1: {
    type: String,
  },

  shippingAddress2: String,

  city: {
    type: String,
    required: true,
  },

  zip: {
    type: String,
    required: true,
  },

  country: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    default: 'Pending',
    required: true,
  },

  totalPrice: {
    type: Number,
  },

  // to know which user ordered this item
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },

  dateOrdered: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  })
    .populate({
      path: 'orderItems',
      populate: 'product',
    })
    .sort({ dateOrdered: -1 });

  next();
});

orderSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
