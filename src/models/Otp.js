// Import mongoose
const mongoose = require('mongoose');

// Define otp schema
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: [true, 'email already in use'],
  },
  otp: {
    type: String,
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
const Otp = mongoose.model('Otp', otpSchema);

// Export the model
module.exports = Otp;
