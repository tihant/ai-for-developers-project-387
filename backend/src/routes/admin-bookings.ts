import { Router } from 'express';
import {
  listBookings,
  getBooking,
  updateBooking,
  deleteBooking,
  getEventType,
  isSlotTaken,
} from '../storage.js';

const router = Router();

// GET /admin/bookings
router.get('/', (_req, res) => {
  res.json(listBookings());
});

// PUT /admin/bookings/:id
router.put('/:id', (req, res) => {
  const existing = getBooking(req.params.id);
  if (!existing) {
    res.status(404).json({ message: 'Booking not found', code: 'NOT_FOUND' });
    return;
  }

  const { guestName, guestEmail, startTime } = req.body;

  const newStartTime = startTime || existing.startTime;
  const newEndTime = startTime
    ? (() => {
        const eventType = getEventType(existing.eventTypeId);
        if (!eventType) return existing.endTime;
        return new Date(new Date(newStartTime).getTime() + eventType.durationMinutes * 60 * 1000).toISOString();
      })()
    : existing.endTime;

  // Проверяем конфликт (исключая саму эту бронь)
  if (isSlotTaken(existing.eventTypeId, newStartTime, newEndTime, existing.id)) {
    res.status(409).json({
      message: 'The selected time slot is already booked',
      code: 'SLOT_TAKEN',
    });
    return;
  }

  const updated = updateBooking(req.params.id, {
    ...(guestName !== undefined && { guestName }),
    ...(guestEmail !== undefined && { guestEmail }),
    ...(startTime !== undefined && { startTime: newStartTime, endTime: newEndTime }),
  });

  res.json(updated);
});

// DELETE /admin/bookings/:id
router.delete('/:id', (req, res) => {
  const deleted = deleteBooking(req.params.id);
  if (!deleted) {
    res.status(404).json({ message: 'Booking not found', code: 'NOT_FOUND' });
    return;
  }
  res.status(204).send();
});

export default router;
