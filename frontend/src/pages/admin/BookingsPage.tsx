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
import { Badge } from '@/components/ui/badge';
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

type Booking = components['schemas']['Booking'];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadBookings = () => {
    setLoading(true);
    client
      .GET('/admin/bookings')
      .then(({ data, error: apiError }) => {
        if (apiError) setError('Failed to load');
        else setBookings(data || []);
      })
      .catch(() => setError('Failed to connect to API'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error: apiError } = await client.DELETE(
      '/admin/bookings/{id}',
      { params: { path: { id: deleteId } } }
    );
    if (!apiError) {
      setBookings((prev) => prev.filter((b) => b.id !== deleteId));
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
        <Button onClick={loadBookings}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Bookings</h1>
        <Link to="/admin" className={buttonVariants({ variant: 'outline' })}>
          ← Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No bookings yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{b.guestName}</p>
                        <p className="text-sm text-muted-foreground">
                          {b.guestEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{b.eventTypeId}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>
                          {new Date(b.startTime).toLocaleDateString()}{' '}
                          {new Date(b.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-muted-foreground">
                          to{' '}
                          {new Date(b.endTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/bookings/${b.id}/edit`}
                          className={buttonVariants({ variant: 'outline', size: 'sm' })}
                        >
                          Edit
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteId(b.id)}
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
            <DialogTitle>Delete Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this booking? This action cannot
              be undone.
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
