import { User, Mail, Shield, Settings, Key, Bell, LogOut } from 'lucide-react';

interface AccountViewProps {
  onLogout: () => void;
}

export function AccountView({ onLogout }: AccountViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your profile and workspace preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 mb-4">
              <User className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Dr. Sarah Jenkins</h2>
            <p className="text-sm text-slate-500 mt-1">Lead Researcher</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold mt-4">
              Active Workspace
            </span>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <nav className="flex flex-col">
              <button className="flex items-center px-4 py-3 bg-slate-50 border-l-4 border-slate-900 text-slate-900 text-sm font-semibold">
                <User className="w-4 h-4 mr-3" />
                Profile Information
              </button>
              <button className="flex items-center px-4 py-3 border-l-4 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition-colors">
                <Key className="w-4 h-4 mr-3" />
                Security & Access
              </button>
              <button className="flex items-center px-4 py-3 border-l-4 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition-colors">
                <Bell className="w-4 h-4 mr-3" />
                Notifications
              </button>
              <button className="flex items-center px-4 py-3 border-l-4 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition-colors">
                <Settings className="w-4 h-4 mr-3" />
                Workspace Preferences
              </button>
            </nav>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Profile Details</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                  <input
                    type="text"
                    defaultValue="Sarah"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    defaultValue="Jenkins"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-slate-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="s.jenkins@trivex.io"
                  disabled
                  className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-slate-400" />
                  Role & Permissions
                </label>
                <input
                  type="text"
                  defaultValue="Administrator"
                  disabled
                  className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="pt-6 flex justify-end">
                <button className="px-6 py-2 bg-slate-900 text-white font-semibold rounded-lg text-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-red-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-red-700 mb-2">Danger Zone</h3>
            <p className="text-sm text-slate-600 mb-6">Terminate your session and revoke active tokens from this device.</p>
            <button 
              onClick={onLogout}
              className="flex items-center justify-center px-6 py-2 border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 font-semibold rounded-lg text-sm transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out Securely
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
