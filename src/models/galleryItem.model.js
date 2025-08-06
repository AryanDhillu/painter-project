const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  caption: { type: String },
  serviceType: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);
module.exports = GalleryItem;