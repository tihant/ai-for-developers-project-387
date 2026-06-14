import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return (
    <div className="max-w-md mx-auto text-center py-12">
      <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
      <h1 className="text-2xl font-bold mb-4">Booking Confirmed!</h1>
      <Card className="mb-6 text-left">
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-2">
            Your booking has been created successfully.
          </p>
          {bookingId && (
            <p className="text-sm">
              Booking ID:{' '}
              <code className="bg-muted px-1 py-0.5 rounded">{bookingId}</code>
            </p>
          )}
        </CardContent>
      </Card>
      <div className="flex gap-2 justify-center">
        <Link to="/" className={buttonVariants({ variant: 'outline' })}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
