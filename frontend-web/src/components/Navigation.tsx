import { Activity, User, Menu, MessageSquare, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useTheme } from '../contexts/ThemeContext';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        const res = await fetch('http://127.0.0.1:8000/community/unread-count', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unread_count || 0);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnread();

    const intervalId = setInterval(fetchUnread, 15000);

    const handleMessagesRead = () => {
      fetchUnread();
    };

    window.addEventListener('messagesRead', handleMessagesRead);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('messagesRead', handleMessagesRead);
    };
  }, []);

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

  // History is ONLY for regular end-users — hide for admin and staff roles
  const showHistory = role === 'user';

  const dashboardPath = role === 'admin' ? '/dashboard/admin' : '/dashboard/user';
  const isDashboardActive = location.pathname.startsWith('/dashboard') || location.pathname === '/fusion-engine';
  const isCommunityActive = location.pathname === '/community';



  // Shared control button style for theme toggle
  const controlBtnBase =
    'inline-flex items-center justify-center h-8 w-8 rounded-lg border text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-500';
  const controlBtnStyle = `${controlBtnBase} border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-teal-300 dark:hover:border-teal-600`;

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center cursor-pointer">
              <Activity className="h-6 w-6 text-teal-600 animate-pulse" />
              <span className="ms-2 font-bold text-xl text-slate-900 dark:text-white tracking-wider uppercase">TriVex</span>
            </Link>
            <div className="hidden sm:ms-10 sm:flex sm:space-s-8 sm:gap-0">
              <Link
                to={dashboardPath}
                className={`${
                  isDashboardActive
                    ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-white'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200'
                } inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                Dashboard
              </Link>

              {/* History — regular users only */}
              {showHistory && (
                <Link
                  to="/history"
                  className={`${
                    location.pathname === '/history'
                      ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-white'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200'
                  } inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  History
                </Link>
              )}

              {/* Community tab with global unread badge */}
              <Link
                to="/community"
                className={`${
                  isCommunityActive
                    ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200'
                } inline-flex items-center gap-1.5 px-3 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 relative`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Community
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white rounded-full text-xs px-2 ml-2">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Desktop right-side controls */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Theme toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className={controlBtnStyle}
              aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </button>

            {/* Profile */}
            <Link
              to="/account"
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 block ms-1"
            >
              <span className="sr-only">Account</span>
              <User className="h-4 w-4" />
            </Link>

            <button
              onClick={handleSignOut}
              className="ms-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 sm:hidden">
            {/* Theme toggle (mobile) */}
            <button
              onClick={toggleTheme}
              className={controlBtnStyle}
              aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-900"
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="block h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-colors duration-200">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to={dashboardPath}
              onClick={() => setMobileMenuOpen(false)}
              className={`${
                isDashboardActive
                  ? 'bg-slate-50 dark:bg-slate-800 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200'
              } block w-full text-start ps-3 pe-4 py-2 border-s-4 text-base font-medium`}
            >
              Dashboard
            </Link>

            {showHistory && (
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className={`${
                  location.pathname === '/history'
                    ? 'bg-slate-50 dark:bg-slate-800 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-white'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 hover:text-slate-700 dark:hover:text-slate-200'
                } block w-full text-start ps-3 pe-4 py-2 border-s-4 text-base font-medium`}
              >
                History
              </Link>
            )}

            <Link
              to="/community"
              onClick={() => setMobileMenuOpen(false)}
              className={`${
                isCommunityActive
                  ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-600 text-teal-700 dark:text-teal-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 hover:text-slate-700 dark:hover:text-slate-200'
              } flex items-center justify-between w-full text-start ps-3 pe-4 py-2 border-s-4 text-base font-medium`}
            >
              <span className="flex items-center gap-2">
                Community
              </span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white rounded-full text-xs px-2 ml-2">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link
              to="/account"
              onClick={() => setMobileMenuOpen(false)}
              className={`${
                location.pathname === '/account'
                  ? 'bg-slate-50 dark:bg-slate-800 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 hover:text-slate-700 dark:hover:text-slate-200'
              } block w-full text-start ps-3 pe-4 py-2 border-s-4 text-base font-medium`}
            >
              Account
            </Link>

            <button
              onClick={() => {
                handleSignOut();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-start ps-3 pe-4 py-2 border-s-4 border-transparent text-base font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 hover:text-slate-700 dark:hover:text-slate-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
