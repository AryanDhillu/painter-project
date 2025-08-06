const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, required: true },
  displayOrder: { type: Number, default: 0 },
});

const Faq = mongoose.model('Faq', faqSchema);
module.exports = Faq;