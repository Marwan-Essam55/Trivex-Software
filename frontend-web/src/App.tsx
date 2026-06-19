import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { Navigation } from './components/Navigation';
import { HomeView } from './components/HomeView';
import { LoginView } from './components/LoginView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { UserDashboardView } from './components/UserDashboardView';
import { FusionEngineView } from './components/FusionEngineView';
import { HistoryView } from './components/HistoryView';
import { AccountView } from './components/AccountView';
import { CommunityView } from './components/CommunityView';
import { ProtectedRoute } from './components/ProtectedRoute';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp > currentTime) {
          // Session is active and valid!
          // If the user lands on the Landing page (/) or Login page (/login), automatically redirect to their dashboard
          if (location.pathname === '/' || location.pathname === '/login') {
            const dashboardPath = decoded.role === 'admin' ? '/dashboard/admin' : '/dashboard/user';
            navigate(dashboardPath, { replace: true });
          }
        } else {
          // Token is expired, remove all session info
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
      } catch (err) {
        // Invalid token structure, clear session info
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <Navigation />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/login" element={<LoginView />} />
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/dashboard/admin" element={<AdminDashboardView />} />
          </Route>

          {/* User Routes */}
          <Route element={<ProtectedRoute allowedRole="user" />}>
            <Route path="/dashboard/user" element={<UserDashboardView />} />
          </Route>

          {/* Shared Authenticated Routes (Accessible by any logged in user) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/fusion-engine" element={<FusionEngineView />} />
            <Route path="/history" element={<HistoryView />} />
            <Route path="/account" element={<AccountView />} />
            <Route path="/community" element={<CommunityView />} />
          </Route>
          
          {/* Redirect any unknown route to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <AppContent />
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

