import { randomUUID } from 'node:crypto';

// ── Типы (соответствуют контракту) ──

export interface EventType {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
}

export interface Slot {
  startTime: string;
  endTime: string;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

// ── Хранилище ──

const eventTypes = new Map<string, EventType>();
const bookings = new Map<string, Booking>();

// ── Event Types ──

export function listEventTypes(): EventType[] {
  return Array.from(eventTypes.values());
}

export function getEventType(id: string): EventType | undefined {
  return eventTypes.get(id);
}

export function createEventType(data: Omit<EventType, 'id'>): EventType {
  const eventType: EventType = {
    id: randomUUID(),
    ...data,
  };
  eventTypes.set(eventType.id, eventType);
  return eventType;
}

export function updateEventType(
  id: string,
  data: Partial<Pick<EventType, 'title' | 'description' | 'durationMinutes'>>
): EventType | undefined {
  const existing = eventTypes.get(id);
  if (!existing) return undefined;

  const updated: EventType = { ...existing, ...data };
  eventTypes.set(id, updated);
  return updated;
}

export function deleteEventType(id: string): boolean {
  return eventTypes.delete(id);
}

// ── Bookings ──

export function listBookings(): Booking[] {
  return Array.from(bookings.values());
}

export function getBooking(id: string): Booking | undefined {
  return bookings.get(id);
}

export function createBooking(
  data: Pick<Booking, 'eventTypeId' | 'guestName' | 'guestEmail' | 'startTime' | 'endTime'>
): Booking {
  const booking: Booking = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...data,
  };
  bookings.set(booking.id, booking);
  return booking;
}

export function updateBooking(
  id: string,
  data: Partial<Pick<Booking, 'guestName' | 'guestEmail' | 'startTime' | 'endTime'>>
): Booking | undefined {
  const existing = bookings.get(id);
  if (!existing) return undefined;

  const updated: Booking = { ...existing, ...data };
  bookings.set(id, updated);
  return updated;
}

export function deleteBooking(id: string): boolean {
  return bookings.delete(id);
}

// ── Утилита для проверки конфликта слотов ──

export function isSlotTaken(
  eventTypeId: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): boolean {
  const slotStart = new Date(startTime).getTime();
  const slotEnd = new Date(endTime).getTime();

  for (const booking of bookings.values()) {
    if (booking.eventTypeId !== eventTypeId) continue;
    if (excludeBookingId && booking.id === excludeBookingId) continue;

    const bookingStart = new Date(booking.startTime).getTime();
    const bookingEnd = new Date(booking.endTime).getTime();

    // Пересечение: начало слота раньше конца брони И конец слота позже начала брони
    if (slotStart < bookingEnd && slotEnd > bookingStart) {
      return true;
    }
  }

  return false;
}
