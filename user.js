const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  passwords: {
    type: [passwordSchema],
    default: []
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
