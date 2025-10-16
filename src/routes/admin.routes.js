const express = require('express');
const router = express.Router();

// Import security middleware and all admin controllers
const { authMiddleware, isOwner } = require('../middleware/auth.middleware');
const quoteAdminController = require('../controllers/quote.admin.controller');
const galleryAdminController = require('../controllers/gallery.admin.controller');
const reviewAdminController = require('../controllers/review.admin.controller');
const faqAdminController = require('../controllers/faq.admin.controller');
const userAdminController = require('../controllers/user.admin.controller');

// Apply the main authentication middleware to all routes in this file
router.use(authMiddleware);

// --- Quote Routes ---
router.get('/quotes', quoteAdminController.getAdminQuotes);
router.put('/quotes/:id', quoteAdminController.updateQuote);
router.delete('/quotes/:id', quoteAdminController.deleteQuote);

// --- NEW ROUTES FOR "SEEN/UNSEEN" AND RESCHEDULE MANAGEMENT ---
router.put('/quotes/:id/mark-viewed', quoteAdminController.markQuoteAsViewed);
router.put('/quotes/:id/mark-seen', quoteAdminController.markRescheduleAsSeen);
router.put('/quotes/:id/handle-reschedule', quoteAdminController.handleRescheduleRequest);
// -----------------------------------------------------------------

// --- Gallery Routes ---
router.post('/gallery', galleryAdminController.createGalleryItem);
router.put('/gallery/:id', galleryAdminController.updateGalleryItem);
router.delete('/gallery/:id', galleryAdminController.deleteGalleryItem);

// --- Review Routes ---
router.get('/reviews', reviewAdminController.getAllReviews);
router.put('/reviews/:id', reviewAdminController.updateReview);
router.delete('/reviews/:id', reviewAdminController.deleteReview);

// --- FAQ Routes ---
router.post('/faqs', faqAdminController.createFaq);
router.put('/faqs/:id', faqAdminController.updateFaq);
router.delete('/faqs/:id', faqAdminController.deleteFaq);

// --- User Management Routes (Owner Only) ---
router.get('/users', [isOwner], userAdminController.getAllAdminUsers);
router.post('/users', [isOwner], userAdminController.createAdminUser);
router.delete('/users/:id', [isOwner], userAdminController.deleteAdminUser);

module.exports = router;

