const Quote = require('../models/quote.model');
const BlockedSlot = require('../models/blockedSlot.model');
const { format } = require('date-fns');

// This function now gets ALL occupied slots from the entire database
exports.getOccupiedSlots = async (req, res) => {
  try {
    // 1. Get all customer appointments from the Quotes collection
    const existingAppointments = await Quote.find({
      // Find all quotes that have an appointment date set
      appointmentDate: { $exists: true, $ne: null }
    }).select('appointmentDate appointmentSlot');

    // 2. Get all admin-blocked slots from the BlockedSlot collection
    const adminBlocks = await BlockedSlot.find({});

    // 3. Combine both lists into a single object of all occupied slots
    const occupiedSlots = {};

    // Process customer appointments
    existingAppointments.forEach(appt => {
      if (appt.appointmentDate && appt.appointmentSlot !== undefined) {
        const dateStr = format(new Date(appt.appointmentDate), 'yyyy-MM-dd');
        if (!occupiedSlots[dateStr]) {
          occupiedSlots[dateStr] = [];
        }
        occupiedSlots[dateStr].push(appt.appointmentSlot);
      }
    });
    
    // Process admin blocks
    adminBlocks.forEach(block => {
      const dateStr = format(new Date(block.date), 'yyyy-MM-dd');
      if (!occupiedSlots[dateStr]) {
        occupiedSlots[dateStr] = [];
      }
      // Add only unique slots to avoid duplicates
      block.slots.forEach(slotIndex => {
        if (!occupiedSlots[dateStr].includes(slotIndex)) {
          occupiedSlots[dateStr].push(slotIndex);
        }
      });
    });

    // Sort the slot indexes for each day for a consistent order
    for (const date in occupiedSlots) {
        occupiedSlots[date].sort((a, b) => a - b);
    }

    res.json(occupiedSlots);
  } catch (error) {
    console.error("Error fetching occupied slots:", error);
    res.status(500).json({ message: 'Error fetching occupied slots' });
  }
};

