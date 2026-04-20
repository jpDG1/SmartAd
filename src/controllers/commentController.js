const Comment = require('../models/Comment');
const Post = require('../models/Post');

// GET /api/posts/:postId/comments
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate('userId', 'login avatar')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// POST /api/posts/:postId/comments
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) return res.status(400).json({ message: 'Text is required' });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      text,
      userId: req.user._id,
      postId: req.params.postId,
    });

    await comment.populate('userId', 'login avatar');
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/posts/:postId/comments/:commentId
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getComments, addComment, deleteComment };
