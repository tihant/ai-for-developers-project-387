import { Router } from 'express';
import {
  createEventType,
  updateEventType,
  deleteEventType,
  getEventType,
} from '../storage.js';

const router = Router();

// POST /admin/event-types
router.post('/', (req, res) => {
  const { title, description, durationMinutes } = req.body;

  if (!title || !description || durationMinutes === undefined) {
    res.status(400).json({
      message: 'Missing required fields: title, description, durationMinutes',
      code: 'BAD_REQUEST',
    });
    return;
  }

  if (durationMinutes < 1) {
    res.status(400).json({
      message: 'durationMinutes must be at least 1',
      code: 'BAD_REQUEST',
    });
    return;
  }

  const eventType = createEventType({ title, description, durationMinutes });
  res.json(eventType);
});

// PUT /admin/event-types/:id
router.put('/:id', (req, res) => {
  const existing = getEventType(req.params.id);
  if (!existing) {
    res.status(404).json({ message: 'Event type not found', code: 'NOT_FOUND' });
    return;
  }

  const { title, description, durationMinutes } = req.body;

  if (durationMinutes !== undefined && durationMinutes < 1) {
    res.status(400).json({
      message: 'durationMinutes must be at least 1',
      code: 'BAD_REQUEST',
    });
    return;
  }

  const updated = updateEventType(req.params.id, {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(durationMinutes !== undefined && { durationMinutes }),
  });

  res.json(updated);
});

// DELETE /admin/event-types/:id
router.delete('/:id', (req, res) => {
  const deleted = deleteEventType(req.params.id);
  if (!deleted) {
    res.status(404).json({ message: 'Event type not found', code: 'NOT_FOUND' });
    return;
  }
  res.status(204).send();
});

export default router;
