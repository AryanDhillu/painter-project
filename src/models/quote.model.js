const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  serviceType: { type: String, required: true, enum: ['residential', 'commercial'] },
  projectType: { type: String, required: true, enum: ['interior', 'exterior', 'both'] },
  rooms: [String],
  squareFootage: { type: Number, min: 0 },
  timeframe: { type: String, required: true, enum: ['asap', '1-2weeks', '1month', '2-3months', 'flexible'] },
  budget: { type: String, required: true, enum: ['under-1000', '1000-3000', '3000-5000', '5000-10000', 'over-10000'] },
  description: { type: String, trim: true },
  images: [{
      filename: String,
      path: String,
      mimetype: String
  }],
  status: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'reviewed', 'quoted', 'completed', 'declined', 'accepted'] 
  },
  estimatedCost: { type: Number, min: 0 },
  notes: { type: String, trim: true },
  appointmentDate: {
    type: Date,
  },
  appointmentSlot: {
    type: Number, 
  },
  rescheduleRequest: {
    requestedDate: { type: Date },
    requestedSlot: { type: Number },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'denied'],
      default: null 
    },
    token: { type: String },
    // This field is added to track the "seen/unseen" status
    seenByAdmin: { type: Boolean, default: false }
  },
}, {
  // This option automatically adds createdAt and updatedAt fields
  timestamps: true 
});

// Add indexes for faster queries
quoteSchema.index({ status: 1 });
quoteSchema.index({ appointmentDate: 1 });

const Quote = mongoose.model('Quote', quoteSchema);
module.exports = Quote;

