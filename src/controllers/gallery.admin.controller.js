const GalleryItem = require('../models/galleryItem.model');

// @desc    Create a new gallery item
exports.createGalleryItem = async (req, res) => {
  try {
    const newItem = await GalleryItem.create(req.body);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: 'Error creating gallery item' });
  }
};

// @desc    Update a gallery item
exports.updateGalleryItem = async (req, res) => {
  try {
    const updatedItem = await GalleryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a gallery item
exports.deleteGalleryItem = async (req, res) => {
  try {
    const item = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json({ message: 'Gallery item deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};