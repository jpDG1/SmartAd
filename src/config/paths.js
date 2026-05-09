const fs = require('fs');
const path = require('path');

/** Absolutny katalog zdjęć (względem katalogu `src/`). */
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

function ensureUploadsDir() {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

module.exports = { UPLOADS_DIR, ensureUploadsDir };
