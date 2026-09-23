import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { LayoutDashboard, Truck, Plus, AlertTriangle, FileText, Bell, User, Inbox, Clock, BarChart2, List, Activity, Map, Flame, Megaphone, Users, Package, Tag, MapPin, Shield, Settings, Menu, X, LogOut, Leaf } from 'lucide-react';
const navConfig = {
    CITIZEN: [
        { label: 'Dashboard', href: '/citizen/dashboard', icon: LayoutDashboard },
        { label: 'My Pickups', href: '/citizen/pickups', icon: Truck },
        { label: 'Request Pickup', href: '/citizen/request-pickup', icon: Plus },
        { label: 'Report Issue', href: '/citizen/report-issue', icon: AlertTriangle },
        { label: 'My Issues', href: '/citizen/issues', icon: FileText },
        { label: 'Notifications', href: '/citizen/notifications', icon: Bell },
        { label: 'Profile', href: '/citizen/profile', icon: User },
    ],
    COLLECTOR: [
        { label: 'Dashboard', href: '/collector/dashboard', icon: LayoutDashboard },
        { label: 'Available Pickups', href: '/collector/available', icon: Inbox },
        { label: 'My Pickups', href: '/collector/pickups', icon: Truck },
        { label: 'History', href: '/collector/history', icon: Clock },
        { label: 'Performance', href: '/collector/performance', icon: BarChart2 },
        { label: 'Notifications', href: '/collector/notifications', icon: Bell },
        { label: 'Profile', href: '/collector/profile', icon: User },
    ],
    AUTHORITY: [
        { label: 'Dashboard', href: '/authority/dashboard', icon: LayoutDashboard },
        { label: 'Issue Queue', href: '/authority/issues', icon: List },
        { label: 'Operations', href: '/authority/operations', icon: Activity },
        { label: 'City Map', href: '/authority/map', icon: Map },
        { label: 'Hotspots', href: '/authority/hotspots', icon: Flame },
        { label: 'Analytics', href: '/authority/analytics', icon: BarChart2 },
        { label: 'Announcements', href: '/authority/announcements', icon: Megaphone },
        { label: 'Profile', href: '/authority/profile', icon: User },
    ],
    ADMIN: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Users', href: '/admin/users', icon: Users },
        { label: 'Collectors', href: '/admin/collectors', icon: Truck },
        { label: 'Issues', href: '/admin/issues', icon: AlertTriangle },
        { label: 'Pickups', href: '/admin/pickups', icon: Package },
        { label: 'Categories', href: '/admin/categories', icon: Tag },
        { label: 'Service Areas', href: '/admin/service-areas', icon: MapPin },
        { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
        { label: 'Audit Logs', href: '/admin/audit-logs', icon: Shield },
        { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
};
export function AppLayout({ role, children }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const links = navConfig[role] || [];
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const Sidebar = () => (<div className="flex flex-col h-full bg-surface border-r border-border">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link to="/app" className="flex items-center gap-2 text-primary">
          <Leaf className="w-6 h-6"/>
          <span className="text-xl font-bold tracking-tight">WasteConnect</span>
        </Link>
      </div>
      
      <div className="flex-1 py-6 px-4 overflow-y-auto">
        <div className="space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.href || location.pathname.startsWith(`${link.href}/`);
            return (<Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)} className={cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors", isActive
                    ? "bg-primary-muted/30 text-primary"
                    : "text-text-muted hover:bg-gray-50 hover:text-text")}>
                <link.icon className="w-5 h-5"/>
                {link.label}
              </Link>);
        })}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-primary-muted flex items-center justify-center text-primary font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-text-muted truncate capitalize">{user?.role.toLowerCase()}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-status-error hover:bg-status-errorBg rounded-md transition-colors">
          <LogOut className="w-5 h-5"/>
          Sign Out
        </button>
      </div>
    </div>);
    return (<div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 bg-surface border-b border-border">
        <Link to="/app" className="flex items-center gap-2 text-primary">
          <Leaf className="w-6 h-6"/>
          <span className="text-xl font-bold tracking-tight">WasteConnect</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-text-muted">
          {mobileOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (<div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div className="w-64 h-full bg-surface" onClick={e => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>)}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 fixed inset-y-0 z-30">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>);
}
