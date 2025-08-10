const Quote = require('../models/quote.model');

//  Get all quotes for the admin panel
exports.getAdminQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 }); // Get newest first
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

//  Update a quote
exports.updateQuote = async (req, res) => {
  try {
    const quote = await Quote.findByIdAndUpdate(
      req.params.id, // Get the ID from the URL parameter
      req.body,      // Get the update data from the request body
      { new: true, runValidators: true } // Options: return the updated doc and run schema validators
    );

    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    res.json(quote);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};