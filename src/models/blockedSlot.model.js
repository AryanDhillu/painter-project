const mongoose = require('mongoose');

const blockedSlotSchema = new mongoose.Schema({
  // Store the date at the very start (midnight UTC) to make queries simple
  date: {
    type: Date,
    required: true,
    unique: true, // You can only have one block document per day
  },
  // Store an array of the indexes (0-7) that are blocked for that day
  slots: {
    type: [Number],
    required: true,
  },
  reason: {
    type: String,
    trim: true,
    default: 'Blocked by Admin'
  }
}, { timestamps: true });

const BlockedSlot = mongoose.model('BlockedSlot', blockedSlotSchema);
module.exports = BlockedSlot;
