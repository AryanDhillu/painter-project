const Faq = require('../models/faq.model');

exports.getAllFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ displayOrder: 1 });
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQs' });
  }
};