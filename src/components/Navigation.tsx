import { Activity, User, Menu } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export function Navigation({ currentView, setCurrentView }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (currentView === 'Auth' || currentView === 'Home') return null;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => setCurrentView('Dashboard')}>
              <Activity className="h-6 w-6 text-slate-900" />
              <span className="ml-2 font-bold text-xl text-slate-900 tracking-wider uppercase">Trivex</span>
            </div>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <button
                onClick={() => setCurrentView('Dashboard')}
                className={`${
                  currentView === 'Dashboard' || currentView === 'FusionEngine'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('History')}
                className={`${
                  currentView === 'History'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                History
              </button>
            </div>
          </div>
          <div className="hidden sm:flex items-center">
            <div className="flex-shrink-0 relative">
              <button 
                onClick={() => setCurrentView('Account')}
                className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
              >
                <span className="sr-only">User Profile</span>
                <User className="h-4 w-4" />
              </button>
            </div>
            <button 
              onClick={() => setCurrentView('Auth')}
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
            <button
              onClick={() => {
                setCurrentView('Dashboard');
                setMobileMenuOpen(false);
              }}
              className={`${
                currentView === 'Dashboard' || currentView === 'FusionEngine'
                  ? 'bg-slate-50 border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
              } block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setCurrentView('History');
                setMobileMenuOpen(false);
              }}
              className={`${
                currentView === 'History'
                  ? 'bg-slate-50 border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
              } block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              History
            </button>
            <button
              onClick={() => {
                setCurrentView('Account');
                setMobileMenuOpen(false);
              }}
              className={`${
                currentView === 'Account'
                  ? 'bg-slate-50 border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
              } block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Account
            </button>
            <button
              onClick={() => {
                setCurrentView('Auth');
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
