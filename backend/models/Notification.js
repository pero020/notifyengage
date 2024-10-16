const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  businessApiKey: { type: String, required: true },
  message: { type: String, required: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Notification };
