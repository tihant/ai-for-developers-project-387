import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import client from '@/api/client';
import type { components } from '@/api/types';

type EventType = components['schemas']['EventType'];

export default function HomePage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    client
      .GET('/event-types')
      .then(({ data, error: apiError }) => {
        if (apiError) {
          setError('Failed to load event types');
        } else {
          setEventTypes(data || []);
        }
      })
      .catch(() => setError('Failed to connect to API'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (eventTypes.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">No event types available</h2>
        <p className="text-muted-foreground">Check back later for new event types.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Event Types</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {eventTypes.map((et) => (
          <Card key={et.id}>
            <CardHeader>
              <CardTitle>{et.title}</CardTitle>
              <CardDescription>{et.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {et.durationMinutes} min
              </span>
              <div className="flex gap-2">
                <Link
                  to={`/event-types/${et.id}`}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  View
                </Link>
                <Link
                  to={`/book/${et.id}`}
                  className={buttonVariants({ size: 'sm' })}
                >
                  Book
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
