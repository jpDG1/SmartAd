const multer = require('multer');
const path = require('path');
const { UPLOADS_DIR, ensureUploadsDir } = require('../config/paths');

ensureUploadsDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    let ext = path.extname(file.originalname || '').toLowerCase();
    const allowedExt = ['.jpg', '.jpeg', '.png', '.webp', '.heic'];
    if (!ext || ext === '.' || !allowedExt.includes(ext)) {
      const mt = (file.mimetype || '').toLowerCase();
      if (mt.includes('png')) ext = '.png';
      else if (mt.includes('webp')) ext = '.webp';
      else if (mt.includes('heic') || mt.includes('heif')) ext = '.heic';
      else ext = '.jpg';
    }
    cb(null, uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'application/octet-stream',
  ];

  const ext = path.extname(file.originalname || '').toLowerCase();
  const allowedExt = ['.jpg', '.jpeg', '.png', '.webp', '.heic'];

  if (
    !file.mimetype ||
    allowedTypes.includes(file.mimetype) ||
    allowedExt.includes(ext)
  ) {
    return cb(null, true);
  }

  cb(new Error('Dozwolone są tylko obrazy JPEG, PNG i WEBP'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
