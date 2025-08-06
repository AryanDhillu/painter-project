const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/gallery.controller'); 
const reviewController = require('../controllers/review.controller');
const faqController = require('../controllers/faq.controller'); 


// Gallery Route
router.get('/gallery', galleryController.getAllGalleryItems); 
router.get('/reviews/approved', reviewController.getApprovedReviews);
router.get('/faqs', faqController.getAllFaqs);

module.exports = router;