const Quote = require('../models/quote.model');

exports.createQuote = async (req, res) => {
  try {
    const newQuote = await Quote.create(req.body);
    res.status(201).json(newQuote);
  } catch (error) {
    res.status(400).json({ message: 'Error creating quote', error: error.message });
  }
};