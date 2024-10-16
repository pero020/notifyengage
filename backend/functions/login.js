const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Business } = require('../models/Business');
const { connectToDatabase } = require('../utils/db');

module.exports.handler = async (event) => {
  const { email, password } = JSON.parse(event.body);

  try {
    await connectToDatabase();
    const business = await Business.findOne({ email });
    if (!business) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Business not found" }),
      };
    }

    const isMatch = await bcrypt.compare(password, business.password);
    if (!isMatch) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Invalid password" }),
      };
    }

    const token = jwt.sign({ id: business._id, apiKey: business.apiKey }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Login successful", token, apiKey: business.apiKey }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error logging in", details: err }),
    };
  }
};
