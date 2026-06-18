import { Activity, User, Menu } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show navigation on Auth or Home (root) page
  if (location.pathname === '/login' || location.pathname === '/') return null;

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const token = localStorage.getItem('access_token');
  let role = 'user';
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      role = decoded.role;
    } catch (e) {}
  }

  const dashboardPath = role === 'admin' ? '/dashboard/admin' : '/dashboard/user';
  const isDashboardActive = location.pathname.startsWith('/dashboard') || location.pathname === '/fusion-engine';

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={dashboardPath} className="flex-shrink-0 flex items-center cursor-pointer">
              <Activity className="h-6 w-6 text-teal-600 animate-pulse" />
              <span className="ml-2 font-bold text-xl text-slate-900 tracking-wider uppercase">TriVex</span>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                to={dashboardPath}
                className={`${
                  isDashboardActive
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                Dashboard
              </Link>
              <Link
                to="/history"
                className={`${
                  location.pathname === '/history'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                History
              </Link>
            </div>
          </div>
          <div className="hidden sm:flex items-center">
            <div className="flex-shrink-0 relative">
              <Link 
                to="/account"
                className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 block"
              >
                <span className="sr-only">User Profile</span>
                <User className="h-4 w-4" />
              </Link>
            </div>
            <button 
              onClick={handleSignOut}
              className="ml-4 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              Sign Out
            </button>
          </div>
          
          <div className="flex items-center sm:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-900"
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="block h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to={dashboardPath}
              onClick={() => setMobileMenuOpen(false)}
              className={`${
                isDashboardActive
                  ? 'bg-slate-50 border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
              } block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Dashboard
            </Link>
            <Link
              to="/history"
              onClick={() => setMobileMenuOpen(false)}
              className={`${
                location.pathname === '/history'
                  ? 'bg-slate-50 border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
              } block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              History
            </Link>
            <Link
              to="/account"
              onClick={() => setMobileMenuOpen(false)}
              className={`${
                location.pathname === '/account'
                  ? 'bg-slate-50 border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
              } block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Account
            </Link>
            <button
              onClick={() => {
                handleSignOut();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
