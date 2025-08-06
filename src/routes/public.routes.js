const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/gallery.controller'); 


// Gallery Route
router.get('/gallery', galleryController.getAllGalleryItems); 

module.exports = router;