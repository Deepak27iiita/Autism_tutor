const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: __dirname + '/.env' });

// Validate critical environment variables
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter(env => !process.env[env]);

if (missingEnv.length > 0 && process.env.NODE_ENV === 'production') {
  console.error(`CRITICAL ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('Please set these in your Render Dashboard -> Environment tab.');
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/words', require('./routes/words'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teacher', require('./routes/teacher'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ASD Animated Tutor API is running' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

// Database connection
const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/asd_tutor';
console.log(`Attempting to connect to MongoDB...`);

mongoose
  .connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    if (process.env.NODE_ENV === 'production') {
      console.error('Make sure your IP is whitelisted in MongoDB Atlas (allow 0.0.0.0/0 for Render).');
    }
  });

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // If the error is fatal, you might want to close the server
  // server.close(() => process.exit(1));
});

