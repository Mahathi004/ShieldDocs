const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const activityRoutes = require('./routes/activityRoutes');
const telemetryRoutes = require('./routes/telemetryRoutes');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "img-src": ["'self'", "data:", "blob:"],
      "connect-src": ["'self'", "http://localhost:5000", "http://localhost:8000", "https://cdnjs.cloudflare.com"],
      "object-src": ["'none'"],
      "upgrade-insecure-requests": [],
    },
  },
})); // Configured security headers
app.use(cors());
app.use(express.json());

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve uploads and redacted output
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/redacted_output', express.static(path.join(__dirname, 'redacted_output')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/telemetry', telemetryRoutes);

// Global Error Handler for Multer or custom errors
app.use((err, req, res, next) => {
  if (err instanceof require('multer').MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

const PORT = process.env.PORT || 5000;

// Establish and verify database connection before starting the server
db.pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    process.exit(1);
  } else {
    console.log('DB Connected');
    
    client.query('CREATE TABLE IF NOT EXISTS token_blacklist (token TEXT PRIMARY KEY, expires_at TIMESTAMP NOT NULL);')
      .then(() => {
        release(); // release client back to the pool
        app.listen(PORT, () => {
          console.log(`Server is running on port ${PORT}`);
        });
      })
      .catch(err => {
        console.error('Failed to init dynamic tables', err);
        release();
      });
  }
});
