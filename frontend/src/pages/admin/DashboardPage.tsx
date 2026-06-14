import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { CalendarDays, CalendarRange } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CalendarDays className="h-8 w-8 mb-2" />
            <CardTitle>Event Types</CardTitle>
            <CardDescription>
              Create, edit, and delete event types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/admin/event-types"
              className={buttonVariants()}
            >
              Manage Event Types
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CalendarRange className="h-8 w-8 mb-2" />
            <CardTitle>Bookings</CardTitle>
            <CardDescription>
              View, edit, and delete bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/admin/bookings"
              className={buttonVariants()}
            >
              Manage Bookings
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
