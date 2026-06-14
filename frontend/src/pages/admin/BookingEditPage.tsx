import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import client from '@/api/client';
import type { components } from '@/api/types';

type Booking = components['schemas']['Booking'];

export default function BookingEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [startTime, setStartTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    client
      .GET('/admin/bookings')
      .then(({ data }) => {
        const found = data?.find((b) => b.id === id);
        if (found) {
          setBooking(found);
          setGuestName(found.guestName);
          setGuestEmail(found.guestEmail);
          setStartTime(found.startTime.slice(0, 16));
        } else {
          setError('Booking not found');
        }
      })
      .catch(() => setError('Failed to load booking'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: apiError } = await client.PUT('/admin/bookings/{id}', {
      params: { path: { id: id! } },
      body: {
        guestName,
        guestEmail,
        startTime: new Date(startTime).toISOString(),
      },
    });

    if (apiError) {
      setError('Failed to update');
      setSubmitting(false);
    } else {
      navigate('/admin/bookings');
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Link to="/admin/bookings" className={buttonVariants()}>
          Back to Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link
        to="/admin/bookings"
        className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' mb-4'}
      >
        ← Back to Bookings
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Booking</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="guestName">Guest Name</Label>
              <Input
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="guestEmail">Guest Email</Label>
              <Input
                id="guestEmail"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Update Booking'}
              </Button>
              <Link
                to="/admin/bookings"
                className={buttonVariants({ variant: 'outline' })}
              >
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
