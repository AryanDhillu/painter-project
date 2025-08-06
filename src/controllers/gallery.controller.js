const GalleryItem = require('../models/galleryItem.model');

exports.getAllGalleryItems = async (req, res) => {
  try {
    const items = await GalleryItem.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gallery items' });
  }
};