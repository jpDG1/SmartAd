const User = require('../models/User');
const Post = require('../models/Post');

// PUT /api/auth/me — update profile
const updateProfile = async (req, res, next) => {
  try {
    const { login, email, phone, avatar, password } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) return res.status(404).json({ message: 'Nie znaleziono użytkownika' });

    if (login) user.login = login;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (password) user.password = password;

    await user.save();

    res.json({
      id: user._id,
      login: user.login,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      ratingAverage: user.ratingAverage ?? null,
      ratingCount: user.ratingCount ?? 0,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/public/:id — public seller profile
const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'login avatar ratingAverage ratingCount createdAt'
    );
    if (!user) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika' });
    }
    res.json({
      id: user._id,
      login: user.login,
      avatar: user.avatar,
      ratingAverage: user.ratingAverage ?? null,
      ratingCount: user.ratingCount ?? 0,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/me/avatar — upload avatar image
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Brak obrazu' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika' });
    }
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({
      id: user._id,
      login: user.login,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      ratingAverage: user.ratingAverage ?? null,
      ratingCount: user.ratingCount ?? 0,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/favorites — list of favorite posts
const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'userId', select: 'login avatar' },
    });
    const favorites = (user.favorites || []).filter((p) => p && p.isActive);
    res.json(favorites);
  } catch (error) {
    next(error);
  }
};

// POST /api/users/favorites/:postId — add to favorites
const addFavorite = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Nie znaleziono ogłoszenia' });

    const user = await User.findById(req.user._id);
    if (!user.favorites.some((id) => id.toString() === postId)) {
      user.favorites.push(postId);
      await user.save();
    }

    res.json({ favorites: user.favorites });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/favorites/:postId — remove from favorites
const removeFavorite = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const user = await User.findById(req.user._id);
    user.favorites = user.favorites.filter((id) => id.toString() !== postId);
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  getPublicProfile,
  uploadAvatar,
  getFavorites,
  addFavorite,
  removeFavorite,
};
