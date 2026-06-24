import { useState, useEffect, useCallback } from 'react';
import {
  Users, UserPlus, Search, Filter, Shield, ShieldOff,
  Edit2, Trash2, X, CheckCircle2, XCircle, Eye, EyeOff,
  ChevronDown, AlertTriangle, Loader2, Key, ToggleLeft, UserCheck,
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

type UserRole = 'ADMIN' | 'USER' | 'admin' | 'user';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  available_credits: number;
  is_active: boolean;
  profile_picture_url?: string | null;
  company_name?: string | null;
  title?: string | null;
  created_by_id?: string | null;
}

function authHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function StatCard({
  label, value, icon: Icon, accent = false, danger = false,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent?: boolean;
  danger?: boolean;
}) {
  const iconBg = danger
    ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50'
    : accent
    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'
    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 flex items-center shadow-sm transition-colors duration-200">
      <div className={`p-3 rounded-md border me-4 ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export function RoleBadge({ role }: { role: UserRole }) {
  const isAdmin = role.toUpperCase() === 'ADMIN';
  return isAdmin ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">
      <Shield className="w-3 h-3" /> Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium">
      <UserCheck className="w-3 h-3" /> User
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
      <CheckCircle2 className="w-3 h-3" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-semibold">
      <XCircle className="w-3 h-3" /> Inactive
    </span>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-teal-500 focus:border-slate-900 dark:focus:border-teal-500 transition-colors';

function CreateUserModal({
  isSuperAdmin,
  onClose,
  onCreated,
}: {
  isSuperAdmin: boolean;
  onClose: () => void;
  onCreated: (user: UserProfile) => void;
}) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: (isSuperAdmin ? 'ADMIN' : 'USER') as UserRole,
    company_name: '',
    title: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        role: (isSuperAdmin ? 'ADMIN' : 'USER'),
        company_name: isSuperAdmin ? form.company_name : undefined,
        title: isSuperAdmin ? 'Admin' : form.title || undefined,
      };
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || 'Failed to create user');
      }
      const created: UserProfile = await res.json();
      onCreated(created);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-md transition-colors duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Create New User</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
            </div>
          )}
          {isSuperAdmin ? (
            <>
              <Field label="Company">
                <input className={inputCls} value={form.company_name} onChange={e => set('company_name', e.target.value)} required />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name">
                  <input className={inputCls} value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
                </Field>
                <Field label="Last Name">
                  <input className={inputCls} value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
                </Field>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name">
                  <input className={inputCls} value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
                </Field>
                <Field label="Last Name">
                  <input className={inputCls} value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
                </Field>
              </div>
              <Field label="Title">
                <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} required />
              </Field>
            </>
          )}
          <Field label="Email">
            <input type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} required />
          </Field>
          <Field label="Password">
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className={`${inputCls} pr-10`}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                minLength={8}
                required
              />
              <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-355" onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({
  user,
  isSuperAdmin,
  onClose,
  onUpdated,
}: {
  user: UserProfile;
  isSuperAdmin: boolean;
  onClose: () => void;
  onUpdated: (u: UserProfile) => void;
}) {
  const [info, setInfo] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role,
    company_name: user.company_name || '',
    title: user.title || '',
  });
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [pw, setPw] = useState({ new_password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [isActive, setIsActive] = useState(user.is_active);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const setInfoField = (k: string, v: string) => setInfo(f => ({ ...f, [k]: v }));

  const handleInfoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoLoading(true); setInfoMsg(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${user.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          first_name: info.first_name,
          last_name: info.last_name,
          email: info.email,
          role: info.role.toUpperCase(),
          company_name: isSuperAdmin ? info.company_name : undefined,
          title: !isSuperAdmin ? info.title : undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || 'Update failed'); }
      const updated: UserProfile = await res.json();
      onUpdated(updated);
      setInfoMsg({ type: 'ok', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setInfoMsg({ type: 'err', text: err.message });
    } finally { setInfoLoading(false); }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.new_password !== pw.confirm) { setPwMsg({ type: 'err', text: 'Passwords do not match.' }); return; }
    setPwLoading(true); setPwMsg(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ new_password: pw.new_password }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || 'Reset failed'); }
      setPwMsg({ type: 'ok', text: 'Password reset successfully.' });
      setPw({ new_password: '', confirm: '' });
    } catch (err: any) {
      setPwMsg({ type: 'err', text: err.message });
    } finally { setPwLoading(false); }
  };

  const handleToggleStatus = async () => {
    setStatusLoading(true); setStatusMsg(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${user.id}/toggle-status`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || 'Toggle failed'); }
      const updated: UserProfile = await res.json();
      setIsActive(updated.is_active);
      onUpdated(updated);
      setStatusMsg({ type: 'ok', text: `User is now ${updated.is_active ? 'Active' : 'Inactive'}.` });
    } catch (err: any) {
      setStatusMsg({ type: 'err', text: err.message });
    } finally { setStatusLoading(false); }
  };

  const Msg = ({ m }: { m: { type: 'ok' | 'err'; text: string } | null }) =>
    m ? (
      <p className={`text-xs mt-2 flex items-center gap-1 ${m.type === 'ok' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
        {m.type === 'ok' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
        {m.text}
      </p>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col transition-colors duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Edit User</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5" dir="ltr">{user.first_name} {user.last_name} · {user.email}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-250 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* ── Section 1: Basic Info ── */}
          <section className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <Edit2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Basic Information</span>
            </div>
            <form onSubmit={handleInfoSave} className="p-4 space-y-3">
              {isSuperAdmin ? (
                <>
                  <Field label="Company">
                    <input className={inputCls} value={info.company_name} onChange={e => setInfoField('company_name', e.target.value)} required />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="First Name">
                      <input className={inputCls} value={info.first_name} onChange={e => setInfoField('first_name', e.target.value)} required />
                    </Field>
                    <Field label="Last Name">
                      <input className={inputCls} value={info.last_name} onChange={e => setInfoField('last_name', e.target.value)} required />
                    </Field>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="First Name">
                      <input className={inputCls} value={info.first_name} onChange={e => setInfoField('first_name', e.target.value)} required />
                    </Field>
                    <Field label="Last Name">
                      <input className={inputCls} value={info.last_name} onChange={e => setInfoField('last_name', e.target.value)} required />
                    </Field>
                  </div>
                  <Field label="Title">
                    <input className={inputCls} value={info.title} onChange={e => setInfoField('title', e.target.value)} required />
                  </Field>
                </>
              )}
              <Field label="Email">
                <input type="email" className={inputCls} value={info.email} onChange={e => setInfoField('email', e.target.value)} required />
              </Field>
              <div className="flex items-center justify-between pt-1">
                <Msg m={infoMsg} />
                <button
                  type="submit"
                  disabled={infoLoading}
                  className="ml-auto px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  {infoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* ── Section 2: Reset Password ── */}
          <section className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <Key className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Reset Password</span>
            </div>
            <form onSubmit={handlePasswordReset} className="p-4 space-y-3">
              <Field label="New Password">
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className={`${inputCls} pr-10`}
                    value={pw.new_password}
                    onChange={e => setPw(p => ({ ...p, new_password: e.target.value }))}
                    minLength={8}
                    required
                  />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-355" onClick={() => setShowPw(v => !v)}>
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
              <Field label="Confirm Password">
                <input
                  type={showPw ? 'text' : 'password'}
                  className={inputCls}
                  value={pw.confirm}
                  onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                  required
                />
              </Field>
              <div className="flex items-center justify-between pt-1">
                <Msg m={pwMsg} />
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="ml-auto px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  {pwLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />} Reset Password
                </button>
              </div>
            </form>
          </section>

          <section className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <ToggleLeft className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Account Status</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Current Status</p>
                <div className="mt-1"><StatusBadge active={isActive} /></div>
                <Msg m={statusMsg} />
              </div>
              <button
                type="button"
                disabled={statusLoading}
                onClick={handleToggleStatus}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors disabled:opacity-60 ${
                  isActive
                    ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                    : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                }`}
              >
                {statusLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isActive ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                {isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmDialog({
  user,
  onClose,
  onDeleted,
}: {
  user: UserProfile;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (res.status === 204 || res.ok) {
        onDeleted(user.id);
      } else {
        const d = await res.json();
        throw new Error(d.detail || 'Delete failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-sm p-6 transition-colors duration-200">
        <div className="flex items-center justify-center w-12 h-12 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-full mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white text-center">Delete User</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-2">
          Are you sure you want to permanently delete {user.first_name} {user.last_name}?
          {' '}This action cannot be undone.
        </p>
        {error && (
          <div className="mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-400 text-center">{error}</div>
        )}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboardView() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch (err) {
      console.error('Failed to fetch current user profile', err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data: UserProfile[] = await res.json();
      setUsers(data);
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, [fetchCurrentUser, fetchUsers]);

  const isSuperAdmin = currentUser ? (currentUser.email === 'admin@admin.com' || !currentUser.company_name) : true;

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const inactiveUsers = totalUsers - activeUsers;

  const filtered = users.filter(u => {
    const q = searchQuery.toLowerCase();
    const matchesQ = !q || `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.is_active) ||
      (statusFilter === 'inactive' && !u.is_active);
    return matchesQ && matchesStatus;
  });

  const handleCreated = (u: UserProfile) => {
    setUsers(prev => [u, ...prev]);
    setIsCreateOpen(false);
  };

  const handleUpdated = (u: UserProfile) => {
    setUsers(prev => prev.map(x => x.id === u.id ? u : x));
  };

  const handleDeleted = (id: string) => {
    setUsers(prev => prev.filter(x => x.id !== id && x.created_by_id !== id));
    setDeleteUser(null);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isSuperAdmin ? "User Management" : (currentUser?.company_name || "Company Dashboard")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage platform users, roles, and access control.</p>
          </div>
          <button
            id="btn-create-user"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" /> New User
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <StatCard label="TOTAL USERS" value={loading ? '—' : totalUsers} icon={Users} />
          <StatCard label="ACTIVE" value={loading ? '—' : activeUsers} icon={CheckCircle2} accent />
          <StatCard label="INACTIVE" value={loading ? '—' : inactiveUsers} icon={XCircle} danger />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-200">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                id="search-users"
                type="text"
                placeholder="Search by name or email…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-teal-500 focus:border-slate-900 dark:focus:border-teal-500 transition-colors"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <select
                id="filter-status"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="pl-9 pr-8 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-teal-500 appearance-none text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {fetchError ? (
            <div className="px-6 py-16 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-full flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Failed to load users</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{fetchError}</p>
              <button onClick={fetchUsers} className="mt-4 px-4 py-2 text-sm font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="px-6 py-16 flex flex-col items-center">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading users…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 flex flex-col items-center">
              <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No users found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" id="users-table">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {isSuperAdmin ? "Company" : "Title"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Credits</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-600 dark:text-slate-300">
                            {u.role.toUpperCase() === 'ADMIN' && u.company_name ? u.company_name[0].toUpperCase() : `${u.first_name[0]}${u.last_name[0]}`}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {u.role.toUpperCase() === 'ADMIN' && u.company_name ? u.company_name : `${u.first_name} ${u.last_name}`}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400" dir="ltr">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isSuperAdmin ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                            {u.company_name || 'N/A'}
                          </span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-300 text-xs font-medium">
                            {u.title || 'N/A'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4"><StatusBadge active={u.is_active} /></td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">{u.available_credits.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`btn-edit-${u.id}`}
                            onClick={() => setEditUser(u)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          {u.email === 'admin@admin.com' || u.id === currentUser?.id ? (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 rounded-md bg-slate-50 dark:bg-slate-900 cursor-not-allowed select-none" title="Cannot delete master admin or current user">
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </span>
                          ) : (
                            <button
                              id={`btn-delete-${u.id}`}
                              onClick={() => setDeleteUser(u)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing {filtered.length} of {totalUsers} users
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isCreateOpen && <CreateUserModal isSuperAdmin={isSuperAdmin} onClose={() => setIsCreateOpen(false)} onCreated={handleCreated} />}
      {editUser && (
        <EditUserModal
          user={editUser}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setEditUser(null)}
          onUpdated={u => { handleUpdated(u); setEditUser(u); }}
        />
      )}
      {deleteUser && (
        <DeleteConfirmDialog
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
