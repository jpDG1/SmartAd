const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect); // all message routes are protected

router.get('/conversations', getConversations);
router.get('/:postId/:userId', getMessages);
router.post('/', sendMessage);

module.exports = router;
