const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Business } = require('../models/Business');
const { connectToDatabase } = require('../utils/db');
const jwt = require('jsonwebtoken');

module.exports.handler = async (event) => {
  const { email, password } = JSON.parse(event.body);

  try {
    await connectToDatabase();
    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const newBusiness = new Business({ email, password: hashedPassword, apiKey });
    await newBusiness.save();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Business registered successfully", apiKey }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error registering business", details: err }),
    };
  }
};
