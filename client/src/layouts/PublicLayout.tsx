import { Link } from 'react-router-dom';
import { ReactNode } from 'react';
import { Leaf } from 'lucide-react';

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <Leaf className="w-6 h-6" />
            <span className="text-xl font-bold tracking-tight">WasteConnect</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-muted">
            <Link to="/#how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
            <Link to="/#citizens" className="hover:text-primary transition-colors">For Citizens</Link>
            <Link to="/#authorities" className="hover:text-primary transition-colors">For Authorities</Link>
          </nav>
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link to="/login" className="text-text hover:text-primary transition-colors">Sign In</Link>
            <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors">Get Started</Link>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-surface border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-primary opacity-80">
            <Leaf className="w-5 h-5" />
            <span className="font-semibold">WasteConnect</span>
          </div>
          <p className="text-sm text-text-muted">Connecting communities to cleaner cities.</p>
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
