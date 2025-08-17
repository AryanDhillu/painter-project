const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/gallery.controller'); 
const reviewController = require('../controllers/review.controller');
const faqController = require('../controllers/faq.controller'); 
const quoteController = require('../controllers/quote.controller');
const availabilityController = require('../controllers/availability.controller'); 



router.get('/gallery', galleryController.getAllGalleryItems); 
router.get('/reviews/approved', reviewController.getApprovedReviews);
router.get('/faqs', faqController.getAllFaqs);
router.post('/quotes', quoteController.createQuote);
router.get('/appointments/availability', availabilityController.getAvailability);


module.exports = router;