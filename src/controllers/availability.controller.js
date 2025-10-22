const Quote = require('../models/quote.model');
const BlockedSlot = require('../models/blockedSlot.model');
const { addDays, format, isBefore, startOfToday } = require('date-fns');

// --- CONSTANTS ---
const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
const NUMBER_OF_DAYS = 30; // How many days into the future to check

// --- HELPER FUNCTIONS ---
// Helper to get booked slots within a date range
const fetchBookedSlots = async (startDate, endDate) => {
  const existingAppointments = await Quote.find({
    appointmentDate: { $gte: startDate, $lt: endDate }
  }).select('appointmentDate appointmentSlot');

  const bookedSlots = {};
  existingAppointments.forEach(appt => {
    if (appt.appointmentDate && appt.appointmentSlot !== undefined) {
      const dateStr = format(new Date(appt.appointmentDate), 'yyyy-MM-dd');
      if (!bookedSlots[dateStr]) {
        bookedSlots[dateStr] = [];
      }
      bookedSlots[dateStr].push(appt.appointmentSlot);
    }
  });
  return bookedSlots;
};

// Helper to get blocked slots within a date range
const fetchBlockedSlots = async (startDate, endDate) => {
  const adminBlocks = await BlockedSlot.find({
    date: { $gte: startDate, $lt: endDate }
  });
  const blockedSlots = {};
  adminBlocks.forEach(block => {
    const dateStr = format(new Date(block.date), 'yyyy-MM-dd');
    blockedSlots[dateStr] = block.slots.sort((a, b) => a - b);
  });
  return blockedSlots;
};


// --- ENDPOINT 1: Get Available Slots (Previous Functionality Restored) ---
// @desc    Get a list of available appointment slots for the next 30 days
exports.getAvailableSlots = async (req, res) => {
  try {
    const today = startOfToday();
    const futureDate = addDays(today, NUMBER_OF_DAYS);

    // Fetch both booked and blocked slots using helpers
    const bookedPromise = fetchBookedSlots(today, futureDate);
    const blockedPromise = fetchBlockedSlots(today, futureDate);
    const [bookedSlots, adminBlockedSlots] = await Promise.all([bookedPromise, blockedPromise]);

    // Combine into a single Set of unavailable slots for efficient lookup
    const unavailableSlotsSet = new Set();
    for (const date in bookedSlots) {
        bookedSlots[date].forEach(slot => unavailableSlotsSet.add(`${date}_${slot}`));
    }
    for (const date in adminBlockedSlots) {
        adminBlockedSlots[date].forEach(slot => unavailableSlotsSet.add(`${date}_${slot}`));
    }

    // Generate all possible slots and filter out the unavailable ones
    const availableSlotsResult = {};
    let currentDate = new Date(today);

    while (isBefore(currentDate, futureDate)) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const daySlots = [];

      for (let i = 0; i < TIME_SLOTS.length; i++) {
        // If the slot is NOT in the unavailable set, add it
        if (!unavailableSlotsSet.has(`${dateStr}_${i}`)) {
          daySlots.push(i);
        }
      }

      // Only include dates that have at least one available slot
      if (daySlots.length > 0) {
        availableSlotsResult[dateStr] = daySlots;
      }
      currentDate = addDays(currentDate, 1);
    }

    res.json(availableSlotsResult);

  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ message: 'Error fetching available slots' });
  }
};


// --- ENDPOINT 2: Get Detailed Occupied Slots (New Functionality Kept) ---
// @desc    Get both booked and blocked slots separately
exports.getAllOccupiedSlotsDetailed = async (req, res) => {
  try {
    const today = startOfToday(); // Or remove date range if needed
    const futureDate = addDays(today, NUMBER_OF_DAYS); // Or remove date range if needed

    const bookedPromise = fetchBookedSlots(today, futureDate); // Use helpers
    const blockedPromise = fetchBlockedSlots(today, futureDate); // Use helpers

    const [bookedSlots, adminBlockedSlots] = await Promise.all([bookedPromise, blockedPromise]);

    // Sort booked slots
    for (const date in bookedSlots) {
        bookedSlots[date].sort((a, b) => a - b);
    }
    // Blocked slots are already sorted by the helper

    res.json({
        bookedSlots,
        adminBlockedSlots
    });

  } catch (error) {
    console.error("Error fetching all occupied slots:", error);
    res.status(500).json({ message: 'Error fetching all occupied slots' });
  }
};

