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
  const { message, url } = JSON.parse(event.body);

  try {
    await connectToDatabase();
    const business = await authenticateJwtAndAPIKey(event.headers);

    if (!message || !url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Message and URL are required" }),
      };
    }

    const newNotification = new Notification({
      businessApiKey: business.apiKey,
      message,
      url,
    });

    await newNotification.save();

    return {
      statusCode: 201,
      body: JSON.stringify(newNotification),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
