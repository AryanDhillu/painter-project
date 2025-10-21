const BlockedSlot = require('../models/blockedSlot.model');

// @desc    Admin creates or updates a block for a specific day
exports.setBlockedSlots = async (req, res) => {
  try {
    const { date, slots, reason } = req.body;

    // Use `findOneAndUpdate` with `upsert: true`.
    // This will create a new document if one for that date doesn't exist,
    // or update the existing one if it does. This is very efficient.
    const blockedSlot = await BlockedSlot.findOneAndUpdate(
      { date: new Date(date) },
      { $set: { slots, reason } },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(blockedSlot);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Admin gets all blocked slots
exports.getBlockedSlots = async (req, res) => {
  try {
    const blockedSlots = await BlockedSlot.find().sort({ date: 1 });
    res.json(blockedSlots);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
