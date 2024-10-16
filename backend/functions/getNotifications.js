const { Notification } = require('../models/Notification');
const { connectToDatabase } = require('../utils/db');
const { Business } = require('../models/Business');

const authenticateAPIKey = async (headers) => {
  const apiKey = headers['x-api-key'] || null;

  if (!apiKey) throw new Error("API key is required");

  // Check if the business exists by API key
  const business = await Business.findOne({ apiKey });
  if (!business) throw new Error("Invalid API key");

  return business;
};

module.exports.handler = async (event) => {
  try {
    await connectToDatabase();
    const business = await authenticateAPIKey(event.headers);

    const notifications = await Notification.find({ businessApiKey: business.apiKey });

    return {
      statusCode: 200,
      body: JSON.stringify({ notifications }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
