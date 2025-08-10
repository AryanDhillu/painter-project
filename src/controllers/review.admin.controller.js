const Review = require('../models/review.model');

// @desc    Get all reviews (approved and unapproved)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a review (e.g., to approve it)
exports.updateReview = async (req, res) => {
  try {
    // We only expect to update the 'isApproved' field from the admin panel
    const { isApproved } = req.body;
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true, runValidators: true }
    );
    if (!updatedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(updatedReview);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};