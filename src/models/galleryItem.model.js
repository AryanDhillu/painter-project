const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  caption: { type: String },
  serviceType: { type: String },
  category: {
    type: String,
    required: true,
    trim: true,
    lowercase: true // Good for consistency
  },
  createdAt: { type: Date, default: Date.now },
});

const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);
module.exports = GalleryItem;