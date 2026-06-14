import { Router } from 'express';
import {
  listEventTypes,
  getEventType,
  getBooking,
  isSlotTaken,
} from '../storage.js';

const router = Router();

// GET /event-types
router.get('/', (_req, res) => {
  res.json(listEventTypes());
});

// GET /event-types/:id
router.get('/:id', (req, res) => {
  const eventType = getEventType(req.params.id);
  if (!eventType) {
    res.status(404).json({ message: 'Event type not found', code: 'NOT_FOUND' });
    return;
  }
  res.json(eventType);
});

// GET /event-types/:eventTypeId/slots
router.get('/:eventTypeId/slots', (req, res) => {
  const eventType = getEventType(req.params.eventTypeId);
  if (!eventType) {
    res.status(404).json({ message: 'Event type not found', code: 'NOT_FOUND' });
    return;
  }

  const durationMs = eventType.durationMinutes * 60 * 1000;

  // Диапазон поиска: startDate/endDate из query или ближайшие 7 дней
  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setHours(0, 0, 0, 0);
  defaultStart.setDate(defaultStart.getDate() + 1); // с завтрашнего дня

  const defaultEnd = new Date(defaultStart);
  defaultEnd.setDate(defaultEnd.getDate() + 7);

  const startDate = req.query.startDate
    ? new Date(req.query.startDate as string)
    : defaultStart;
  const endDate = req.query.endDate
    ? new Date(req.query.endDate as string)
    : defaultEnd;

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    res.status(400).json({ message: 'Invalid date format', code: 'BAD_REQUEST' });
    return;
  }

  // Генерируем слоты с 08:00 до 18:00 каждый день
  const slots: { startTime: string; endTime: string }[] = [];
  const current = new Date(startDate);
  current.setHours(8, 0, 0, 0);

  const maxTime = new Date(endDate);
  maxTime.setHours(18, 0, 0, 0);

  while (current < maxTime) {
    const slotStart = current.toISOString();
    const slotEnd = new Date(current.getTime() + durationMs).toISOString();

    // Не выходим за 18:00
    const slotEndDate = new Date(slotEnd);
    if (slotEndDate.getHours() > 18 || (slotEndDate.getHours() === 18 && slotEndDate.getMinutes() > 0)) {
      // Переход на следующий день
      current.setDate(current.getDate() + 1);
      current.setHours(8, 0, 0, 0);
      continue;
    }

    if (!isSlotTaken(eventType.id, slotStart, slotEnd)) {
      slots.push({ startTime: slotStart, endTime: slotEnd });
    }

    current.setTime(current.getTime() + durationMs);
  }

  res.json(slots);
});

export default router;
