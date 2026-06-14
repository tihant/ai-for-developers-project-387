import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import client from '@/api/client';
import type { components } from '@/api/types';

type EventType = components['schemas']['EventType'];
type Slot = components['schemas']['Slot'];

export default function EventTypePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    client
      .GET('/event-types/{id}', { params: { path: { id } } })
      .then(({ data, error: apiError }) => {
        if (apiError) setError('Event type not found');
        else setEventType(data || null);
      })
      .catch(() => setError('Failed to connect to API'))
      .finally(() => setLoading(false));
  }, [id]);

  const loadSlots = () => {
    if (!id) return;
    setSlotsLoading(true);
    client
      .GET('/event-types/{eventTypeId}/slots', {
        params: {
          path: { eventTypeId: id },
          query: {
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
          },
        },
      })
      .then(({ data }) => setSlots(data || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  };

  useEffect(() => {
    if (id) loadSlots();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-96 mb-2" />
        <Skeleton className="h-4 w-24" />
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

  const groupedSlots = slots.reduce(
    (acc: Record<string, Slot[]>, slot) => {
      const day = new Date(slot.startTime).toLocaleDateString();
      if (!acc[day]) acc[day] = [];
      acc[day].push(slot);
      return acc;
    },
    {}
  );

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/"
        className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' mb-4'}
      >
        ← Back
      </Link>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">{eventType.title}</CardTitle>
          <CardDescription>{eventType.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">{eventType.durationMinutes} minutes</Badge>
        </CardContent>
      </Card>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Available Slots</h2>
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground block mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-muted-foreground block mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={loadSlots} disabled={slotsLoading}>
              {slotsLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {slotsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : Object.keys(groupedSlots).length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No available slots for the selected dates.
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedSlots).map(([day, daySlots]) => (
              <div key={day}>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  {day}
                </h3>
                <div className="grid gap-2">
                  {daySlots.map((slot) => (
                    <Button
                      key={slot.startTime}
                      variant="outline"
                      className="justify-start"
                      onClick={() =>
                        navigate(
                          `/book/${eventType.id}?startTime=${encodeURIComponent(slot.startTime)}`
                        )
                      }
                    >
                      {new Date(slot.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      —{' '}
                      {new Date(slot.endTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
