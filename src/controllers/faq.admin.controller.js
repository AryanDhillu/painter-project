const Faq = require('../models/faq.model');

// @desc    Create a new FAQ
exports.createFaq = async (req, res) => {
  try {
    const newFaq = await Faq.create(req.body);
    res.status(201).json(newFaq);
  } catch (err) {
    res.status(400).json({ message: 'Error creating FAQ' });
  }
};

// @desc    Update an FAQ
exports.updateFaq = async (req, res) => {
  try {
    const updatedFaq = await Faq.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedFaq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.json(updatedFaq);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete an FAQ
exports.deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.json({ message: 'FAQ deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};