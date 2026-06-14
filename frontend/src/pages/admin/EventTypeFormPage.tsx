import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import client from '@/api/client';

export default function EventTypeFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    client
      .GET('/event-types/{id}', { params: { path: { id } } })
      .then(({ data }) => {
        if (data) {
          setTitle(data.title);
          setDescription(data.description);
          setDurationMinutes(data.durationMinutes);
        }
      })
      .catch(() => setError('Failed to load event type'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (isEditing) {
      const { error: apiError } = await client.PUT(
        '/admin/event-types/{id}',
        {
          params: { path: { id: id! } },
          body: { title, description, durationMinutes },
        }
      );
      if (apiError) {
        setError('Failed to update');
        setSubmitting(false);
      } else {
        navigate('/admin/event-types');
      }
    } else {
      const { error: apiError } = await client.POST('/admin/event-types', {
        body: { title, description, durationMinutes },
      });
      if (apiError) {
        setError('Failed to create');
        setSubmitting(false);
      } else {
        navigate('/admin/event-types');
      }
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

  return (
    <div className="max-w-lg mx-auto">
      <Link
        to="/admin/event-types"
        className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' mb-4'}
      >
        ← Back to Event Types
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Edit Event Type' : 'Create Event Type'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="30 Minute Meeting"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="A quick catch-up meeting"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="durationMinutes">Duration (minutes)</Label>
              <Input
                id="durationMinutes"
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) =>
                  setDurationMinutes(parseInt(e.target.value) || 1)
                }
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? 'Saving...'
                  : isEditing
                    ? 'Update'
                    : 'Create'}
              </Button>
              <Link
                to="/admin/event-types"
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
