import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Layout from '@/components/Layout';
import HomePage from '@/pages/public/HomePage';
import EventTypePage from '@/pages/public/EventTypePage';
import BookingPage from '@/pages/public/BookingPage';
import BookingSuccessPage from '@/pages/public/BookingSuccessPage';
import DashboardPage from '@/pages/admin/DashboardPage';
import EventTypesPage from '@/pages/admin/EventTypesPage';
import EventTypeFormPage from '@/pages/admin/EventTypeFormPage';
import BookingsPage from '@/pages/admin/BookingsPage';
import BookingEditPage from '@/pages/admin/BookingEditPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route element={<Layout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          <Route path="event-types/:id" element={<EventTypePage />} />
          <Route path="book/:eventTypeId" element={<BookingPage />} />
          <Route path="booking/success" element={<BookingSuccessPage />} />

          {/* Admin routes */}
          <Route path="admin" element={<DashboardPage />} />
          <Route path="admin/event-types" element={<EventTypesPage />} />
          <Route path="admin/event-types/new" element={<EventTypeFormPage />} />
          <Route path="admin/event-types/:id/edit" element={<EventTypeFormPage />} />
          <Route path="admin/bookings" element={<BookingsPage />} />
          <Route path="admin/bookings/:id/edit" element={<BookingEditPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
