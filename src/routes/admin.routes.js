const express = require('express');
const router = express.Router();

// Import security middleware
const { authMiddleware, isOwner } = require('../middleware/auth.middleware');

// Import all admin controllers
const quoteAdminController = require('../controllers/quote.admin.controller');
const galleryAdminController = require('../controllers/gallery.admin.controller');
const reviewAdminController = require('../controllers/review.admin.controller');
const faqAdminController = require('../controllers/faq.admin.controller');
const userAdminController = require('../controllers/user.admin.controller');
const blockerAdminController = require('../controllers/blocker.admin.controller'); // <-- ADD THIS

// Apply the main authentication middleware to ALL routes in this file
router.use(authMiddleware);

// --- Quote Management Routes ---
router.get('/quotes', quoteAdminController.getAdminQuotes);
router.put('/quotes/:id', quoteAdminController.updateQuote);
// router.delete('/quotes/:id', quoteAdminController.deleteQuote);

// --- "Seen/Unseen" and Reschedule Management Routes ---
router.put('/quotes/:id/mark-viewed', quoteAdminController.markQuoteAsViewed);
router.put('/quotes/:id/mark-seen', quoteAdminController.markRescheduleAsSeen);
router.put('/quotes/:id/handle-reschedule', quoteAdminController.handleRescheduleRequest);

// --- NEW Blocker Management Routes ---
router.get('/blocker', blockerAdminController.getBlockedSlots);
router.post('/blocker', blockerAdminController.setBlockedSlots);
// ------------------------------------

// --- Gallery Management Routes ---
router.post('/gallery', galleryAdminController.createGalleryItem);
router.put('/gallery/:id', galleryAdminController.updateGalleryItem);
router.delete('/gallery/:id', galleryAdminController.deleteGalleryItem);

// --- Review Management Routes ---
router.get('/reviews', reviewAdminController.getAllReviews);
router.put('/reviews/:id', reviewAdminController.updateReview);
router.delete('/reviews/:id', reviewAdminController.deleteReview);

// --- FAQ Management Routes ---
router.post('/faqs', faqAdminController.createFaq);
router.put('/faqs/:id', faqAdminController.updateFaq);
router.delete('/faqs/:id', faqAdminController.deleteFaq);

// --- User Management Routes (Owner Only) ---
// These routes use a second middleware to check for the 'Owner' role
router.get('/users', [isOwner], userAdminController.getAllAdminUsers);
router.post('/users', [isOwner], userAdminController.createAdminUser);
router.delete('/users/:id', [isOwner], userAdminController.deleteAdminUser);

module.exports = router;

