const Review = require('../models/review.model');

exports.getApprovedReviews = async (req, res) => {
  try {
    // Find only the reviews where isApproved is true
    const reviews = await Review.find();
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};



exports.createReview = async (req, res) => {
  try {
    const { customerName, rating, comment } = req.body; // serviceType removed
    const newReview = await Review.create({
      customerName,
      rating,
      comment,
    });
    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ message: 'Error submitting review', error: error.message });
  }
};