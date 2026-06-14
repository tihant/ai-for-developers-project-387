import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import client from '@/api/client';
import type { components } from '@/api/types';

type EventType = components['schemas']['EventType'];

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadEventTypes = () => {
    setLoading(true);
    client
      .GET('/event-types')
      .then(({ data, error: apiError }) => {
        if (apiError) setError('Failed to load');
        else setEventTypes(data || []);
      })
      .catch(() => setError('Failed to connect to API'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEventTypes();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error: apiError } = await client.DELETE(
      '/admin/event-types/{id}',
      { params: { path: { id: deleteId } } }
    );
    if (!apiError) {
      setEventTypes((prev) => prev.filter((et) => et.id !== deleteId));
    }
    setDeleting(false);
    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={loadEventTypes}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Event Types</h1>
        <div className="flex gap-2">
          <Link
            to="/admin"
            className={buttonVariants({ variant: 'outline' })}
          >
            ← Dashboard
          </Link>
          <Link
            to="/admin/event-types/new"
            className={buttonVariants()}
          >
            Create Event Type
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Event Types ({eventTypes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {eventTypes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No event types yet. Create your first one!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventTypes.map((et) => (
                  <TableRow key={et.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{et.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {et.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{et.durationMinutes} min</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/event-types/${et.id}/edit`}
                          className={buttonVariants({ variant: 'outline', size: 'sm' })}
                        >
                          Edit
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteId(et.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event type? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
