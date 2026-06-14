import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import client from '@/api/client';
import type { components } from '@/api/types';

type EventType = components['schemas']['EventType'];

export default function BookingPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const startTime = searchParams.get('startTime') || '';

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  useEffect(() => {
    if (!eventTypeId) return;
    client
      .GET('/event-types/{id}', { params: { path: { id: eventTypeId } } })
      .then(({ data }) => setEventType(data || null))
      .catch(() => setError('Failed to load event type'))
      .finally(() => setLoading(false));
  }, [eventTypeId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!startTime) {
      setFormError('No time slot selected');
      return;
    }

    setSubmitting(true);
    const { data, error: apiError } = await client.POST('/bookings', {
      body: {
        eventTypeId: eventTypeId!,
        guestName,
        guestEmail,
        startTime,
      },
    });

    if (apiError) {
      setFormError('Failed to create booking');
      setSubmitting(false);
    } else if (data) {
      navigate(`/booking/success?bookingId=${encodeURIComponent(data.id)}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-64 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !eventType) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error || 'Event type not found'}</p>
        <Link to="/" className={buttonVariants()}>
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link
        to={`/event-types/${eventType.id}`}
        className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' mb-4'}
      >
        ← Back to slots
      </Link>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Book: {eventType.title}</CardTitle>
          <CardDescription>{eventType.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Duration: {eventType.durationMinutes} minutes
          </p>
          {startTime && (
            <p className="text-sm font-medium mt-2">
              Selected time:{' '}
              {new Date(startTime).toLocaleString([], {
                dateStyle: 'full',
                timeStyle: 'short',
              })}
            </p>
          )}
        </CardContent>
      </Card>

      {formError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="guestName">Name</Label>
              <Input
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="guestEmail">Email</Label>
              <Input
                id="guestEmail"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
                placeholder="john@example.com"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
