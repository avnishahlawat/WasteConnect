import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function PublicLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    useEffect(() => {
        if (location.hash) {
            const target = document.querySelector(location.hash);
            if (target) {
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }, [location]);
    const handleNavClick = (hash) => {
        if (location.pathname === '/') {
            const target = document.querySelector(hash);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                window.history.replaceState(null, '', hash);
            }
        }
        else {
            navigate(`/${hash}`);
        }
    };
    return (<div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={user ? "/app" : "/"} className="flex items-center gap-2 text-primary">
            <Leaf className="w-6 h-6"/>
            <span className="text-xl font-bold tracking-tight">WasteConnect</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-muted">
            <button type="button" onClick={() => handleNavClick('#how-it-works')} className="hover:text-primary transition-colors cursor-pointer bg-transparent border-0 p-0 font-medium text-sm text-text-muted hover:text-primary">
              How It Works
            </button>
            <button type="button" onClick={() => handleNavClick('#citizens')} className="hover:text-primary transition-colors cursor-pointer bg-transparent border-0 p-0 font-medium text-sm text-text-muted hover:text-primary">
              For Citizens
            </button>
            <button type="button" onClick={() => handleNavClick('#authorities')} className="hover:text-primary transition-colors cursor-pointer bg-transparent border-0 p-0 font-medium text-sm text-text-muted hover:text-primary">
              For Authorities
            </button>
          </nav>
          <div className="flex items-center gap-3 text-sm font-medium">
            {user ? (
              <Link to="/app" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors font-medium text-sm flex items-center gap-2">
                <span>Dashboard ({user.firstName})</span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-text hover:text-primary transition-colors">Sign In</Link>
                <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-surface border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-primary opacity-80">
            <Leaf className="w-5 h-5"/>
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
    </div>);
}
