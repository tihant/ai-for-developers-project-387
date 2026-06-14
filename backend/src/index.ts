import { fileURLToPath } from 'node:url';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import eventTypesRouter from './routes/event-types.js';
import bookingsRouter from './routes/bookings.js';
import adminEventTypesRouter from './routes/admin-event-types.js';
import adminBookingsRouter from './routes/admin-bookings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 4010;

app.use(cors());
app.use(express.json());

// Публичные эндпоинты
app.use('/event-types', eventTypesRouter);
app.use('/bookings', bookingsRouter);

// Админские эндпоинты
app.use('/admin/event-types', adminEventTypesRouter);
app.use('/admin/bookings', adminBookingsRouter);

const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
