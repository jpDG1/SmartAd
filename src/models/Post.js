const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tytuł jest wymagany'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Opis jest wymagany'],
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: [true, 'Cena jest wymagana'],
      min: 0,
    },
    condition: {
      type: String,
      enum: ['new', 'used', 'damaged'],
      default: 'used',
    },
    category: {
      type: String,
      required: [true, 'Kategoria jest wymagana'],
      enum: [
        'electronics',
        'clothing',
        'furniture',
        'vehicles',
        'sports',
        'books',
        'other',
      ],
    },
    location: {
      type: String,
      required: [true, 'Lokalizacja jest wymagana'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sold: {
      type: Boolean,
      default: false,
      index: true,
    },
    soldTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    soldAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Text index for search
postSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Post', postSchema);
