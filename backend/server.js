const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log(err));

// Business Schema
const businessSchema = new mongoose.Schema({
  apiKey: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Business = mongoose.model('Business', businessSchema);

const notificationSchema = new mongoose.Schema({
  businessApiKey: { type: String, required: true },
  message: { type: String, required: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

const authenticateAPIKey = async (req, res, next) => {
  const apiKey = req.query.key || req.headers['x-api-key'];
  if (!apiKey) return res.status(403).json({ error: "API key is required" });

  const business = await Business.findOne({ apiKey });
  if (!business) return res.status(403).json({ error: "Invalid API key" });

  req.business = business;
  next();
};

const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: "Authorization token is required" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.business = decoded;
    next();
  });
};

const generateAPIKey = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey = generateAPIKey();
    const newBusiness = new Business({ email, password: hashedPassword, apiKey });

    await newBusiness.save();

    res.status(201).json({ message: "Business registered successfully", apiKey });
  } catch (err) {
    res.status(500).json({ error: "Error registering business", details: err });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const business = await Business.findOne({ email });
    if (!business) return res.status(404).json({ error: "Business not found" });

    const isMatch = await bcrypt.compare(password, business.password);
    if (!isMatch) return res.status(403).json({ error: "Invalid password" });

    const token = jwt.sign({ id: business._id, apiKey: business.apiKey }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: "Login successful", token, apiKey: business.apiKey });
  } catch (err) {
    res.status(500).json({ error: "Error logging in", details: err });
  }
});

// CRUD Routes (Protected by API key)

app.get('/notifications', authenticateAPIKey, async (req, res) => {
  try {
    const notifications = await Notification.find({ businessApiKey: req.business.apiKey });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post('/notifications', authenticateAPIKey, async (req, res) => {
  const { message, url } = req.body;
  if (!message || !url) return res.status(400).json({ error: "Message and URL are required" });

  try {
    const newNotification = new Notification({ businessApiKey: req.business.apiKey, message, url });
    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add other routes like PUT and DELETE as before...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
