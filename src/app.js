require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const { UPLOADS_DIR, ensureUploadsDir } = require('./config/paths');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');

const app = express();

ensureUploadsDir();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  '/uploads',
  express.static(UPLOADS_DIR, {
    setHeaders(res) {
      res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
    },
  })
);

app.get('/', (req, res) => {
  res.json({
    name: 'Bazarek API',
    message: 'To jest backend REST. Użyj ścieżek /api/...',
    health: '/api/health',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;
