import { useState, useEffect, useRef } from 'react';
import { User, Mail, Shield, Key, LogOut, Loader2, CheckCircle2, AlertTriangle, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  available_credits: number;
  is_active: boolean;
  profile_picture_url?: string | null;
}

function authHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function authHeadersRaw() {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function AccountView() {
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders() });
        if (!res.ok) throw new Error('Failed to load profile');
        const data: UserProfile = await res.json();
        setProfile(data);
        setFirstName(data.first_name);
        setLastName(data.last_name);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ first_name: firstName, last_name: lastName }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || 'Failed to update profile');
      }
      const updated: UserProfile = await res.json();
      setProfile(updated);
      setFirstName(updated.first_name);
      setLastName(updated.last_name);
      setSaveMsg({ type: 'ok', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setSaveMsg({ type: 'err', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      setSaveMsg({ type: 'err', text: 'Please select an image file.' });
      return;
    }

    setUploadingAvatar(true);
    setSaveMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/users/me/avatar`, {
        method: 'POST',
        headers: authHeadersRaw(),
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(d.detail || 'Avatar upload failed');
      }

      const updated: UserProfile = await res.json();
      setProfile(updated);
      setSaveMsg({ type: 'ok', text: 'Profile picture updated!' });
    } catch (err: any) {
      setSaveMsg({ type: 'err', text: err.message });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const roleDisplay = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1).toLowerCase()
    : '—';

  const initials = profile
    ? `${profile.first_name[0] || ''}${profile.last_name[0] || ''}`
    : '';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin mb-3" />
          <p className="text-sm text-slate-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="w-6 h-6 text-red-500 mb-3" />
          <p className="text-sm font-semibold text-slate-700">Failed to load profile</p>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your profile information.</p>
      </div>

      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
        id="avatar-file-input"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col items-center text-center">
            <button
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              className="relative w-24 h-24 rounded-full mb-4 group focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              title="Click to upload profile picture"
              id="btn-upload-avatar"
            >
              {profile.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 group-hover:border-slate-400 transition-colors"
                />
              ) : (
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200 group-hover:border-slate-400 transition-colors text-2xl font-bold text-slate-500">
                  {initials || <User className="w-10 h-10 text-slate-400" />}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-slate-900/0 group-hover:bg-slate-900/50 transition-colors flex items-center justify-center">
                {uploadingAvatar ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </button>

            <h2 className="text-xl font-bold text-slate-900">{profile.first_name} {profile.last_name}</h2>
            <p className="text-sm text-slate-500 mt-1">{roleDisplay}</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-semibold mt-4 ${
              profile.is_active
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-600'
            }`}>
              {profile.is_active ? 'Active Workspace' : 'Inactive'}
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
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
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
                  value={profile.email}
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
                  value={roleDisplay}
                  disabled
                  className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              {saveMsg && (
                <div className={`flex items-center gap-2 text-sm ${saveMsg.type === 'ok' ? 'text-emerald-700' : 'text-red-600'}`}>
                  {saveMsg.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {saveMsg.text}
                </div>
              )}

              <div className="pt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-slate-900 text-white font-semibold rounded-lg text-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-red-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-red-700 mb-2">Danger Zone</h3>
            <p className="text-sm text-slate-600 mb-6">Terminate your session and revoke active tokens from this device.</p>
            <button 
              onClick={handleLogout}
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
