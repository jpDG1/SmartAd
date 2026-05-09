require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const { UPLOADS_DIR, ensureUploadsDir } = require('./config/paths');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

ensureUploadsDir();
app.use('/uploads', express.static(UPLOADS_DIR));

app.get('/', (req, res) => {
  res.json({
    name: 'SmartAd API',
    message: 'To jest backend REST. Użyj ścieżek /api/...',
    health: '/api/health',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serwer działa na porcie ${PORT} (0.0.0.0)`);
});
