const { Notification } = require('../models/Notification');
const { Business } = require('../models/Business');
const { connectToDatabase } = require('../utils/db');
const jwt = require('jsonwebtoken');

const authenticateJwtAndAPIKey = async (headers) => {
  const apiKey = headers['x-api-key'] || null;
  const token = headers['authorization'] || null;

  if (!apiKey) throw new Error("API key is required");
  if (!token) throw new Error("Authorization token is required");

  // Verify API key
  const business = await Business.findOne({ apiKey });
  if (!business) throw new Error("Invalid API key");

  // Verify JWT
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) throw new Error("Invalid token");

  return business;
};

module.exports.handler = async (event) => {
  const { id } = event.pathParameters; // Get the notification ID from the URL parameters

  try {
    await connectToDatabase();
    const business = await authenticateJwtAndAPIKey(event.headers);

    const notification = await Notification.findById(id);
    if (!notification) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Notification not found" }),
      };
    }

    // Ensure the notification belongs to the authenticated business
    if (notification.businessApiKey !== business.apiKey) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "You are not authorized to delete this notification" }),
      };
    }

    await Notification.findByIdAndDelete(id);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Notification deleted" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
