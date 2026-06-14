import { Router } from 'express';
import {
  getEventType,
  createBooking,
  isSlotTaken,
} from '../storage.js';

const router = Router();

// POST /bookings
router.post('/', (req, res) => {
  const { eventTypeId, guestName, guestEmail, startTime } = req.body;

  if (!eventTypeId || !guestName || !guestEmail || !startTime) {
    res.status(400).json({
      message: 'Missing required fields: eventTypeId, guestName, guestEmail, startTime',
      code: 'BAD_REQUEST',
    });
    return;
  }

  const eventType = getEventType(eventTypeId);
  if (!eventType) {
    res.status(404).json({ message: 'Event type not found', code: 'NOT_FOUND' });
    return;
  }

  const start = new Date(startTime);
  if (isNaN(start.getTime())) {
    res.status(400).json({ message: 'Invalid startTime format', code: 'BAD_REQUEST' });
    return;
  }

  const end = new Date(start.getTime() + eventType.durationMinutes * 60 * 1000);
  const endTime = end.toISOString();

  if (isSlotTaken(eventTypeId, startTime, endTime)) {
    res.status(409).json({
      message: 'The selected time slot is already booked',
      code: 'SLOT_TAKEN',
    });
    return;
  }

  const booking = createBooking({
    eventTypeId,
    guestName,
    guestEmail,
    startTime,
    endTime,
  });

  res.json(booking);
});

export default router;
