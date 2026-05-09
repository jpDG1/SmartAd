const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/auth');

const upload = require('../middleware/upload');

const {

  getPublicProfile,

  uploadAvatar,

  getFavorites,

  addFavorite,

  removeFavorite,

} = require('../controllers/userController');



router.get('/public/:id', getPublicProfile);



router.use(protect);



router.post('/me/avatar', upload.single('avatar'), uploadAvatar);

router.get('/favorites', getFavorites);

router.post('/favorites/:postId', addFavorite);

router.delete('/favorites/:postId', removeFavorite);



module.exports = router;

