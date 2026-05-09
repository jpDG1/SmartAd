const Post = require('../models/Post');
const Message = require('../models/Message');

const BUY_NOW_AUTO_MESSAGE =
  'SPRZEDANE — Kup Teraz\n\n' +
  'Ogłoszenie zostało oznaczone jako sprzedane przez kupującego (bez płatności online w aplikacji).\n\n' +
  'Sprzedający: przygotuj paczkę i wyślij ją według uzgodnień z kupującym (nadawca lub odbiór osobisty).\n' +
  'Kupujący: piszcie się tutaj w sprawie odbioru i potwierdzenia transakcji.';

// GET /api/posts  — list with search, filter, pagination
const getPosts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      location,
      minPrice,
      maxPrice,
      condition,
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isActive: true, sold: { $ne: true } };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Post.countDocuments(query);

    const posts = await Post.find(query)
      .populate('userId', 'login avatar ratingAverage ratingCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      posts,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/posts/:id
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('userId', 'login avatar email phone ratingAverage ratingCount');

    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Nie znaleziono ogłoszenia' });
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
};

// POST /api/posts
const createPost = async (req, res, next) => {
  try {
    const { title, description, price, condition, category, location } = req.body;

    const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

    const post = await Post.create({
      title,
      description,
      price,
      condition,
      category,
      location,
      images,
      userId: req.user._id,
    });

    await post.populate('userId', 'login avatar');
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

// PUT /api/posts/:id
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Nie znaleziono ogłoszenia' });
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Brak uprawnień' });
    }

    const { title, description, price, condition, category, location } = req.body;
    const newImages = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

    if (title) post.title = title;
    if (description) post.description = description;
    if (price !== undefined) post.price = price;
    if (condition) post.condition = condition;
    if (category) post.category = category;
    if (location) post.location = location;
    if (newImages.length > 0) post.images = newImages;

    await post.save();
    res.json(post);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/posts/:id
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Nie znaleziono ogłoszenia' });
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Brak uprawnień' });
    }

    post.isActive = false; // soft delete
    await post.save();

    res.json({ message: 'Ogłoszenie usunięte' });
  } catch (error) {
    next(error);
  }
};

// GET /api/posts/my  — current user's posts
const getMyPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ userId: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// POST /api/posts/:id/buy-now-stub — kupujący oznacza sprzedaż + pierwsza wiadomość do sprzedawcy
const buyNowStub = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Nie znaleziono ogłoszenia' });
    }
    if (post.sold) {
      return res.status(400).json({ message: 'To ogłoszenie jest już sprzedane' });
    }

    const sellerId = post.userId.toString();
    if (sellerId === req.user._id.toString()) {
      return res.status(403).json({ message: 'Nie możesz kupić własnego ogłoszenia' });
    }

    post.sold = true;
    post.soldTo = req.user._id;
    post.soldAt = new Date();
    await post.save();

    await Message.create({
      senderId: req.user._id,
      receiverId: post.userId,
      postId: post._id,
      content: BUY_NOW_AUTO_MESSAGE,
      isPlatform: true,
    });

    const populated = await Post.findById(post._id).populate(
      'userId',
      'login avatar email phone ratingAverage ratingCount'
    );

    const seller = populated.userId;
    res.status(200).json({
      post: populated,
      seller: seller
        ? {
            _id: seller._id,
            login: seller.login,
            avatar: seller.avatar,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  buyNowStub,
};
