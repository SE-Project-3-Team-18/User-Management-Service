// Import mongoose
const mongoose = require('mongoose');

// Define user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: [true, 'email already in use'],
  },
  passwordHash: {
    type: String,
    required: true,
  },
  activated: {
    type: Boolean,
    default: false,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'seller', 'admin'],
    required: true,
  },
}, {
  // Add toJSON option to customize JSON output
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id; // Replace _id with id
      delete ret._id; // Remove _id
      delete ret.__v; // Remove __v
    },
  },
});

// Create User model
const User = mongoose.model('User', userSchema);

// Export the model
module.exports = User;
