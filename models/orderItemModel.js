const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },

  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
  },
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
