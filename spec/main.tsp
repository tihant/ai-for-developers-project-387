import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

@service(#{title: "Calendar Booking API"})
namespace CalendarBooking;

// ═══════════════════════════════════════════
//  Модели данных
// ═══════════════════════════════════════════

model EventType {
  id: string;
  title: string;
  description: string;
  @minValue(1) durationMinutes: int32;
}

model Slot {
  startTime: utcDateTime;
  endTime: utcDateTime;
}

model Booking {
  id: string;
  eventTypeId: string;
  guestName: string;
  @format("email") guestEmail: string;
  startTime: utcDateTime;
  endTime: utcDateTime;
  createdAt: utcDateTime;
}

// ═══════════════════════════════════════════
//  Request / Update DTO
// ═══════════════════════════════════════════

model CreateEventTypeRequest {
  title: string;
  description: string;
  @minValue(1) durationMinutes: int32;
}

model UpdateEventTypeRequest {
  title?: string;
  description?: string;
  @minValue(1) durationMinutes?: int32;
}

model CreateBookingRequest {
  eventTypeId: string;
  guestName: string;
  @format("email") guestEmail: string;
  startTime: utcDateTime;
}

model UpdateBookingRequest {
  guestName?: string;
  @format("email") guestEmail?: string;
  startTime?: utcDateTime;
}

model ErrorResponse {
  message: string;
  code: string;
}

// ═══════════════════════════════════════════
//  Публичные эндпоинты (гость)
// ═══════════════════════════════════════════

@route("/event-types")
interface PublicEventTypes {
  @get list(): EventType[];
  @get getById(@path id: string): EventType;

  @route("{eventTypeId}/slots")
  @get getAvailableSlots(
    @path eventTypeId: string,
    @query startDate?: utcDateTime,
    @query endDate?: utcDateTime,
  ): Slot[];
}

@route("/bookings")
interface PublicBookings {
  @post create(@body booking: CreateBookingRequest): Booking;
}

// ═══════════════════════════════════════════
//  Админские эндпоинты (владелец)
// ═══════════════════════════════════════════

@route("/admin/event-types")
interface AdminEventTypes {
  @post create(@body eventType: CreateEventTypeRequest): EventType;
  @put update(@path id: string, @body eventType: UpdateEventTypeRequest): EventType;
  @delete delete(@path id: string): void;
}

@route("/admin/bookings")
interface AdminBookings {
  @get list(): Booking[];
  @put update(@path id: string, @body booking: UpdateBookingRequest): Booking;
  @delete delete(@path id: string): void;
}
