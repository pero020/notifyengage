const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  apiKey: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Business = mongoose.model('Business', businessSchema);

module.exports = { Business };
