const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  icon: String,

  color: String,
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category