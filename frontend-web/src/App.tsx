import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { HomeView } from './components/HomeView';
import { LoginView } from './components/LoginView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { UserDashboardView } from './components/UserDashboardView';
import { FusionEngineView } from './components/FusionEngineView';
import { HistoryView } from './components/HistoryView';
import { AccountView } from './components/AccountView';
import { ProtectedRoute } from './components/ProtectedRoute';

function AppContent() {
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
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
