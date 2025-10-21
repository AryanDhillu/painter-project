const Quote = require('../models/quote.model');
const BlockedSlot = require('../models/blockedSlot.model'); // <-- IMPORT NEW MODEL
const { addDays, format, isBefore, startOfToday } = require('date-fns');

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

exports.getAvailability = async (req, res) => {
  try {
    const today = startOfToday();
    const oneMonthFromNow = addDays(today, 30);

    // 1. Get appointments from the Quotes collection
    const existingAppointments = await Quote.find({
      appointmentDate: { $gte: today, $lt: oneMonthFromNow },
    }).select('appointmentDate appointmentSlot');

    // 2. Get admin-blocked slots from the new collection
    const adminBlocks = await BlockedSlot.find({
      date: { $gte: today, $lt: oneMonthFromNow },
    });

    // 3. Combine both sets into one master list of unavailable slots
    const bookedSlots = new Set(
      existingAppointments.map(appt => {
        const dateStr = format(new Date(appt.appointmentDate), 'yyyy-MM-dd');
        return `${dateStr}_${appt.appointmentSlot}`;
      })
    );
    
    adminBlocks.forEach(block => {
        const dateStr = format(new Date(block.date), 'yyyy-MM-dd');
        block.slots.forEach(slotIndex => {
            bookedSlots.add(`${dateStr}_${slotIndex}`);
        });
    });

    // 4. Generate and filter available slots (this logic remains the same)
    const availableSlots = {};
    let currentDate = new Date(today);

    while (isBefore(currentDate, oneMonthFromNow)) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const daySlots = [];

      for (let i = 0; i < TIME_SLOTS.length; i++) {
        if (!bookedSlots.has(`${dateStr}_${i}`)) {
          daySlots.push(i);
        }
      }
      
      if (daySlots.length > 0) {
        availableSlots[dateStr] = daySlots;
      }
      currentDate = addDays(currentDate, 1);
    }

    res.json(availableSlots);
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ message: 'Error fetching availability' });
  }
};

