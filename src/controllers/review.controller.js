const Review = require('../models/review.model');

exports.getApprovedReviews = async (req, res) => {
  try {
    // Find only the reviews where isApproved is true
    const reviews = await Review.find({ isApproved: true });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};