import { Link, Outlet } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-primary text-primary-foreground text-sm font-extrabold">
              CB
            </span>
            Calendar Booking
          </Link>
          <nav className="flex gap-2">
            <Link to="/" className={buttonVariants({ variant: 'ghost' })}>
              Home
            </Link>
            <Link to="/admin" className={buttonVariants({ variant: 'ghost' })}>
              Admin
            </Link>
          </nav>
        </div>
      </header>
      <Separator />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
