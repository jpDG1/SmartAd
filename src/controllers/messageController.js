const Message = require('../models/Message');

// GET /api/messages/conversations  — unique conversations for current user
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const mongoose = require('mongoose');
    const me = new mongoose.Types.ObjectId(userId);

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: me }, { receiverId: me }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          otherUserId: {
            $cond: [{ $eq: ['$senderId', me] }, '$receiverId', '$senderId'],
          },
          conversationKey: {
            $concat: [
              { $toString: '$postId' },
              '_',
              {
                $toString: {
                  $cond: [{ $eq: ['$senderId', me] }, '$receiverId', '$senderId'],
                },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: '$conversationKey',
          postId: { $first: '$postId' },
          otherUserId: { $first: '$otherUserId' },
          lastMessage: { $first: '$$ROOT' },
          unread: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', me] }, { $eq: ['$isRead', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'postId',
          foreignField: '_id',
          as: 'post',
        },
      },
      { $unwind: '$post' },
      {
        $lookup: {
          from: 'users',
          localField: 'otherUserId',
          foreignField: '_id',
          as: 'otherUser',
        },
      },
      { $unwind: '$otherUser' },
      {
        $project: {
          'otherUser.password': 0,
          'otherUser.favorites': 0,
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
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
      return res.status(400).json({ message: 'Wymagane dane: odbiorca, ogłoszenie i treść wiadomości' });
    }

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Nie możesz wysłać wiadomości do siebie' });
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
