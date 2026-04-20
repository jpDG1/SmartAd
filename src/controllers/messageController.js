const Message = require('../models/Message');

// GET /api/messages/conversations  — unique conversations for current user
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$postId',
          lastMessage: { $first: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: '_id',
          as: 'post',
        },
      },
      { $unwind: '$post' },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.senderId',
          foreignField: '_id',
          as: 'sender',
        },
      },
      { $unwind: '$sender' },
    ]);

    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

// GET /api/messages/:postId/:userId  — messages in a conversation about a specific post
const getMessages = async (req, res, next) => {
  try {
    const { postId, userId } = req.params;
    const me = req.user._id;

    const messages = await Message.find({
      postId,
      $or: [
        { senderId: me, receiverId: userId },
        { senderId: userId, receiverId: me },
      ],
    })
      .populate('senderId', 'login avatar')
      .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { postId, senderId: userId, receiverId: me, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// POST /api/messages
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, postId, content } = req.body;

    if (!receiverId || !postId || !content) {
      return res.status(400).json({ message: 'receiverId, postId and content are required' });
    }

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    const message = await Message.create({
      senderId: req.user._id,
      receiverId,
      postId,
      content,
    });

    await message.populate('senderId', 'login avatar');
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

module.exports = { getConversations, getMessages, sendMessage };
