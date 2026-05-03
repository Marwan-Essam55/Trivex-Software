import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { HomeView } from './components/HomeView';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { FusionEngineView } from './components/FusionEngineView';
import { HistoryView } from './components/HistoryView';
import { AccountView } from './components/AccountView';

function App() {
  const [currentView, setCurrentView] = useState('Home');

  const renderView = () => {
    switch (currentView) {
      case 'Home':
        return <HomeView onGetStarted={() => setCurrentView('Auth')} />;
      case 'Auth':
        return <LoginView onLogin={() => setCurrentView('Dashboard')} />;
      case 'Dashboard':
        return <DashboardView onAnalyze={() => setCurrentView('FusionEngine')} />;
      case 'FusionEngine':
        return <FusionEngineView />;
      case 'History':
        return <HistoryView onViewDetails={() => setCurrentView('FusionEngine')} />;
      case 'Account':
        return <AccountView onLogout={() => setCurrentView('Home')} />;
      default:
        return <HomeView onGetStarted={() => setCurrentView('Auth')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <Navigation currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 flex flex-col">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
