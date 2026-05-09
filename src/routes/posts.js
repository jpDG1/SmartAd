const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  buyNowStub,
} = require('../controllers/postController');
const { getComments, addComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public
router.get('/', getPosts);
router.get('/my', protect, getMyPosts);
router.post('/:id/buy-now-stub', protect, buyNowStub);
router.get('/:id', getPostById);

// Protected
router.post('/', protect, upload.array('images', 5), createPost);
router.put('/:id', protect, upload.array('images', 5), updatePost);
router.delete('/:id', protect, deletePost);

// Comments (nested)
router.get('/:postId/comments', getComments);
router.post('/:postId/comments', protect, addComment);
router.delete('/:postId/comments/:commentId', protect, deleteComment);

module.exports = router;
