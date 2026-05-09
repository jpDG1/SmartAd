const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { login, email, phone, password } = req.body;

    if (!login || !email || !password) {
      return res.status(400).json({ message: 'Login, e-mail i hasło są wymagane' });
    }

    const user = await User.create({ login, email, phone, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        login: user.login,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        ratingAverage: user.ratingAverage ?? null,
        ratingCount: user.ratingCount ?? 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // identifier = login/email/phone

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Identyfikator i hasło są wymagane' });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { login: identifier },
        { phone: identifier },
      ],
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Nieprawidłowe dane logowania' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        login: user.login,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        ratingAverage: user.ratingAverage ?? null,
        ratingCount: user.ratingCount ?? 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me — zawsze świeży odczyt z bazy (req.user jest z początku żądania)
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: 'Nie znaleziono użytkownika' });
    }
    res.json({
      id: user._id,
      login: user.login,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      ratingAverage: user.ratingAverage ?? null,
      ratingCount: user.ratingCount ?? 0,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
