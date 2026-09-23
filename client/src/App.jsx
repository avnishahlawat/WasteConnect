import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Suspense, lazy } from 'react';
import { LoadingSkeleton } from './components/ui/LoadingSkeleton';
// Public pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
// Citizen Pages
const CitizenDashboard = lazy(() => import('./pages/citizen/Dashboard'));
const RequestPickupPage = lazy(() => import('./pages/citizen/RequestPickupPage'));
const CitizenMyPickupsPage = lazy(() => import('./pages/citizen/MyPickupsPage'));
const PickupDetailPage = lazy(() => import('./pages/citizen/PickupDetailPage'));
const ReportIssuePage = lazy(() => import('./pages/citizen/ReportIssuePage'));
const CitizenMyIssuesPage = lazy(() => import('./pages/citizen/MyIssuesPage'));
const IssueDetailPage = lazy(() => import('./pages/citizen/IssueDetailPage'));
// Collector Pages
const CollectorDashboard = lazy(() => import('./pages/collector/Dashboard'));
const AvailablePickupsPage = lazy(() => import('./pages/collector/AvailablePickupsPage'));
const CollectorMyPickupsPage = lazy(() => import('./pages/collector/MyPickupsPage'));
const CollectorHistoryPage = lazy(() => import('./pages/collector/CollectorHistoryPage'));
const CollectorPerformancePage = lazy(() => import('./pages/collector/CollectorPerformancePage'));
// Authority Pages
const AuthorityDashboard = lazy(() => import('./pages/authority/Dashboard'));
const IssueQueuePage = lazy(() => import('./pages/authority/IssueQueuePage'));
const AuthorityIssueDetailPage = lazy(() => import('./pages/authority/IssueDetailPage'));
const CityMapPage = lazy(() => import('./pages/authority/CityMapPage'));
const HotspotsPage = lazy(() => import('./pages/authority/HotspotsPage'));
const AuthorityAnalyticsPage = lazy(() => import('./pages/authority/AuthorityAnalyticsPage'));
const AuthorityAnnouncementsPage = lazy(() => import('./pages/authority/AnnouncementsPage'));
// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const AdminCollectorsPage = lazy(() => import('./pages/admin/CollectorsPage'));
const AdminIssuesPage = lazy(() => import('./pages/admin/IssuesPage'));
const AdminPickupsPage = lazy(() => import('./pages/admin/PickupsPage'));
const ServiceAreasPage = lazy(() => import('./pages/admin/ServiceAreasPage'));
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
// Shared Pages
const NotificationsPage = lazy(() => import('./pages/shared/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/shared/ProfilePage'));
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
        },
    },
});
const RoleRedirect = () => {
    const { user, isAuthenticated } = useAuth();
    if (!isAuthenticated)
        return <Navigate to="/login" replace/>;
    const routes = {
        CITIZEN: '/citizen/dashboard',
        COLLECTOR: '/collector/dashboard',
        AUTHORITY: '/authority/dashboard',
        ADMIN: '/admin/dashboard',
    };
    return <Navigate to={routes[user?.role || ''] || '/login'} replace/>;
};
const PageLoader = () => (<div className="p-6 space-y-4">
    <LoadingSkeleton type="card"/>
  </div>);
function AppRoutes() {
    return (<Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />}/>
      <Route path="/login" element={<LoginPage />}/>
      <Route path="/register" element={<RegisterPage />}/>

      {/* Role redirect */}
      <Route path="/app" element={<RoleRedirect />}/>

      {/* Citizen */}
      <Route element={<ProtectedRoute allowedRoles={['CITIZEN']}/>}>
        <Route path="/citizen/dashboard" element={<Suspense fallback={<PageLoader />}><CitizenDashboard /></Suspense>}/>
        <Route path="/citizen/pickups" element={<Suspense fallback={<PageLoader />}><CitizenMyPickupsPage /></Suspense>}/>
        <Route path="/citizen/pickups/:id" element={<Suspense fallback={<PageLoader />}><PickupDetailPage /></Suspense>}/>
        <Route path="/citizen/request-pickup" element={<Suspense fallback={<PageLoader />}><RequestPickupPage /></Suspense>}/>
        <Route path="/citizen/issues" element={<Suspense fallback={<PageLoader />}><CitizenMyIssuesPage /></Suspense>}/>
        <Route path="/citizen/issues/:id" element={<Suspense fallback={<PageLoader />}><IssueDetailPage /></Suspense>}/>
        <Route path="/citizen/report-issue" element={<Suspense fallback={<PageLoader />}><ReportIssuePage /></Suspense>}/>
        <Route path="/citizen/notifications" element={<Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense>}/>
        <Route path="/citizen/profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>}/>
      </Route>

      {/* Collector */}
      <Route element={<ProtectedRoute allowedRoles={['COLLECTOR']}/>}>
        <Route path="/collector/dashboard" element={<Suspense fallback={<PageLoader />}><CollectorDashboard /></Suspense>}/>
        <Route path="/collector/available" element={<Suspense fallback={<PageLoader />}><AvailablePickupsPage /></Suspense>}/>
        <Route path="/collector/pickups" element={<Suspense fallback={<PageLoader />}><CollectorMyPickupsPage /></Suspense>}/>
        <Route path="/collector/history" element={<Suspense fallback={<PageLoader />}><CollectorHistoryPage /></Suspense>}/>
        <Route path="/collector/performance" element={<Suspense fallback={<PageLoader />}><CollectorPerformancePage /></Suspense>}/>
        <Route path="/collector/notifications" element={<Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense>}/>
        <Route path="/collector/profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>}/>
      </Route>

      {/* Authority */}
      <Route element={<ProtectedRoute allowedRoles={['AUTHORITY']}/>}>
        <Route path="/authority/dashboard" element={<Suspense fallback={<PageLoader />}><AuthorityDashboard /></Suspense>}/>
        <Route path="/authority/issues" element={<Suspense fallback={<PageLoader />}><IssueQueuePage /></Suspense>}/>
        <Route path="/authority/issues/:id" element={<Suspense fallback={<PageLoader />}><AuthorityIssueDetailPage /></Suspense>}/>
        <Route path="/authority/map" element={<Suspense fallback={<PageLoader />}><CityMapPage /></Suspense>}/>
        <Route path="/authority/hotspots" element={<Suspense fallback={<PageLoader />}><HotspotsPage /></Suspense>}/>
        <Route path="/authority/analytics" element={<Suspense fallback={<PageLoader />}><AuthorityAnalyticsPage /></Suspense>}/>
        <Route path="/authority/announcements" element={<Suspense fallback={<PageLoader />}><AuthorityAnnouncementsPage /></Suspense>}/>
        <Route path="/authority/operations" element={<Navigate to="/authority/issues" replace/>}/>
        <Route path="/authority/notifications" element={<Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense>}/>
        <Route path="/authority/profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>}/>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']}/>}>
        <Route path="/admin/dashboard" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>}/>
        <Route path="/admin/users" element={<Suspense fallback={<PageLoader />}><UsersPage /></Suspense>}/>
        <Route path="/admin/collectors" element={<Suspense fallback={<PageLoader />}><AdminCollectorsPage /></Suspense>}/>
        <Route path="/admin/issues" element={<Suspense fallback={<PageLoader />}><AdminIssuesPage /></Suspense>}/>
        <Route path="/admin/pickups" element={<Suspense fallback={<PageLoader />}><AdminPickupsPage /></Suspense>}/>
        <Route path="/admin/service-areas" element={<Suspense fallback={<PageLoader />}><ServiceAreasPage /></Suspense>}/>
        <Route path="/admin/categories" element={<Suspense fallback={<PageLoader />}><CategoriesPage /></Suspense>}/>
        <Route path="/admin/audit-logs" element={<Suspense fallback={<PageLoader />}><AuditLogsPage /></Suspense>}/>
        <Route path="/admin/analytics" element={<Suspense fallback={<PageLoader />}><AdminAnalyticsPage /></Suspense>}/>
        <Route path="/admin/settings" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>}/>
        <Route path="/admin/notifications" element={<Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense>}/>
        <Route path="/admin/profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>}/>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>);
}
export default function App() {
    return (<QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>);
}
