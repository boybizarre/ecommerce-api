const mongoose = require('mongoose');
// const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true, // transforms the email to lowercase
      validate: [validator.isEmail, 'Please provide a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },

    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // this only works on CREATE and SAVE not update
        validator: function (password) {
          return password === this.password; // passwords must match else it returns false
        },
        message: 'Passwords do not match!',
      },
    },

    phone: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    street: {
      type: String,
      default: '',
    },

    zip: {
      type: String,
      default: '',
    },

    city: {
      type: String,
      default: '',
    },

    country: {
      type: String,
      default: '',
    },

    passwordChangedAt: Date,

    passwordResetToken: String,

    passwordResetExpires: Date,

    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// HASHING PASSWORD
userSchema.pre('save', async function (next) {
  // checks if password has not been modified
  if (!this.isModified('password')) return next();

  // hashing the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete the confirm password field
  this.passwordConfirm = undefined;
  next();
});

userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// instance method so it'll be available on all the instances of userSchema
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword); // returns true or false
};

const User = mongoose.model('User', userSchema);

module.exports = User;
