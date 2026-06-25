import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ActivityIndicator,
  Alert, Modal, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users, UserPlus, Search, Shield, ShieldOff,
  Edit2, Trash2, X, CheckCircle2, XCircle, Eye, EyeOff,
  AlertTriangle, Key, UserCheck, ChevronDown, ToggleLeft, Activity, Filter
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiFetch } from '../../services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

type UserRole = 'ADMIN' | 'USER';

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
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, accent = false, danger = false, isDark = false,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent?: boolean;
  danger?: boolean;
  isDark?: boolean;
}) {
  let iconBg = '#f1f5f9';
  let iconBgBorder = '#e2e8f0';
  let iconColor = '#475569';

  if (danger) {
    iconBg = '#fef2f2';
    iconBgBorder = '#fecaca';
    iconColor = '#dc2626';
  } else if (accent) {
    iconBg = '#f0fdf4';
    iconBgBorder = '#bbf7d0';
    iconColor = '#047857';
  }

  return (
    <View style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: isDark ? '#1e293b' : '#e2e8f0', padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 1 }}>
      <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: iconBg, borderWidth: 1, borderColor: iconBgBorder, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
        <Icon size={20} color={iconColor} />
      </View>
      <View>
        <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: isDark ? '#475569' : '#94a3b8', marginBottom: 4 }}>{label}</Text>
        <Text style={{ fontSize: 26, fontWeight: '900', color: isDark ? '#f1f5f9' : '#0f172a' }}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Badge Components ────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: UserRole }) {
  const isAdmin = role?.toUpperCase() === 'ADMIN';
  return (
    <View className={`flex-row items-center px-2 py-1 rounded border ${isAdmin ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200'}`}>
      {isAdmin ? <Shield size={11} color="#475569" /> : <UserCheck size={11} color="#94a3b8" />}
      <Text className={`text-[11px] font-bold ml-1 ${isAdmin ? 'text-slate-600' : 'text-slate-400'}`}>
        {isAdmin ? 'Admin' : 'User'}
      </Text>
    </View>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <View className={`flex-row items-center px-2 py-1 rounded border ${active ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
      {active ? <CheckCircle2 size={11} color="#047857" /> : <XCircle size={11} color="#dc2626" />}
      <Text className={`text-[11px] font-bold ml-1 ${active ? 'text-emerald-700' : 'text-red-600'}`}>
        {active ? 'Active' : 'Inactive'}
      </Text>
    </View>
  );
}

// ─── Create User Modal ───────────────────────────────────────────────────────

function CreateUserModal({
  visible, onClose, onCreated, isSuperAdmin
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: (user: UserProfile) => void;
  isSuperAdmin: boolean;
  onRequestDelete?: () => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [title, setTitle] = useState('');
  const [role] = useState<UserRole>(isSuperAdmin ? 'ADMIN' : 'USER');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFirstName(''); setLastName(''); setEmail(''); setPassword(''); setCompanyName(''); setTitle('');
    setShowPw(false); setError(null);
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError('All basic fields are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role: role.toUpperCase(),
      };

      if (isSuperAdmin && companyName.trim()) {
        payload.company_name = companyName.trim();
        payload.title = 'Admin';
      } else if (!isSuperAdmin && title.trim()) {
        payload.title = title.trim();
      }

      const created = await apiFetch('/admin/users/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      onCreated(created);
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-center items-center p-4">
        <View className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100">
            <View className="flex-row items-center">
              <UserPlus size={18} color="#0f172a" />
              <Text className="text-base font-bold text-slate-900 ml-2">Create New User</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1 rounded-md bg-slate-50 border border-slate-100">
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View className="p-5">
            {error && (
              <View className="flex-row items-center p-3 rounded-lg bg-red-50 border border-red-200 mb-4">
                <AlertTriangle size={14} color="#dc2626" />
                <Text className="text-xs text-red-700 ml-2 flex-1">{error}</Text>
              </View>
            )}

            {isSuperAdmin && (
              <View className="mb-4">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Company Name</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  value={companyName} onChangeText={setCompanyName} placeholder="e.g. Acme Ltd"
                />
              </View>
            )}

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">First Name</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:border-slate-900"
                  value={firstName} onChangeText={setFirstName} placeholder="John"
                />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Last Name</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:border-slate-900"
                  value={lastName} onChangeText={setLastName} placeholder="Doe"
                />
              </View>
            </View>

            {!isSuperAdmin && (
              <View className="mb-4">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Title</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:border-slate-900"
                  value={title} onChangeText={setTitle} placeholder="e.g. Sales Manager"
                />
              </View>
            )}

            <View className="mb-4">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email</Text>
              <TextInput
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:border-slate-900"
                value={email} onChangeText={setEmail} placeholder="john@example.com" keyboardType="email-address" autoCapitalize="none"
              />
            </View>

            <View className="mb-5">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password</Text>
              <View className="relative">
                <TextInput
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 pr-10 text-sm text-slate-900 focus:border-slate-900"
                  value={password} onChangeText={setPassword} secureTextEntry={!showPw} placeholder="Min. 8 characters"
                />
                <TouchableOpacity onPress={() => setShowPw(v => !v)} className="absolute right-3 top-0 bottom-0 justify-center">
                  {showPw ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={onClose} className="flex-1 py-3 rounded-lg border border-slate-300 items-center justify-center">
                <Text className="text-sm font-semibold text-slate-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} disabled={loading} className={`flex-1 py-3 rounded-lg bg-slate-900 flex-row items-center justify-center gap-2 ${loading ? 'opacity-60' : ''}`}>
                {loading ? <ActivityIndicator size="small" color="#fff" /> : <UserPlus size={16} color="#fff" />}
                <Text className="text-sm font-bold text-white">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Edit User Modal ─────────────────────────────────────────────────────────

function EditUserModal({
  user, visible, onClose, onUpdated, isSuperAdmin, onRequestDelete
}: {
  user: UserProfile;
  visible: boolean;
  onClose: () => void;
  onUpdated: (u: UserProfile) => void;
  isSuperAdmin: boolean;
  onRequestDelete?: () => void;
}) {
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name || '');
  const [email, setEmail] = useState(user.email);
  const [companyName, setCompanyName] = useState(user.company_name || '');
  const [title, setTitle] = useState(user.title || '');
  const [role, setRole] = useState<UserRole>(user.role?.toUpperCase() as UserRole || 'USER');
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [isActive, setIsActive] = useState(user.is_active);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleInfoSave = async () => {
    setInfoLoading(true);
    setInfoMsg(null);
    try {
      const payload: any = { first_name: firstName, last_name: lastName, email, role: role.toUpperCase() };
      if (isSuperAdmin) payload.company_name = companyName;
      if (!isSuperAdmin) payload.title = title;

      const updated = await apiFetch(`/admin/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      onUpdated(updated);
      setInfoMsg({ type: 'ok', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setInfoMsg({ type: 'err', text: err.message });
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setPwMsg({ type: 'err', text: 'Passwords do not match or are empty.' });
      return;
    }
    setPwLoading(true); setPwMsg(null);
    try {
      await apiFetch(`/admin/users/${user.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ new_password: newPassword }),
      });
      setPwMsg({ type: 'ok', text: 'Password reset successfully.' });
      setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      setPwMsg({ type: 'err', text: err.message });
    } finally { setPwLoading(false); }
  };

  const handleToggleStatus = async () => {
    setStatusLoading(true); setStatusMsg(null);
    try {
      const updated = await apiFetch(`/admin/users/${user.id}/toggle-status`, { method: 'POST' });
      setIsActive(updated.is_active);
      onUpdated(updated);
      setStatusMsg({ type: 'ok', text: `User is now ${updated.is_active ? 'Active' : 'Inactive'}.` });
    } catch (err: any) {
      setStatusMsg({ type: 'err', text: err.message });
    } finally { setStatusLoading(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-slate-50 w-full rounded-t-3xl max-h-[90%] border-t border-slate-200 overflow-hidden shadow-2xl">
          <View className="flex-row items-center justify-between px-6 py-5 bg-white border-b border-slate-100">
            <View>
              <Text className="text-lg font-bold text-slate-900">Edit User</Text>
              <Text className="text-xs text-slate-500 mt-1">{user.first_name} {user.last_name} • {user.email}</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 rounded-full bg-slate-100">
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={[{ key: 'content' }]}
            renderItem={() => (
              <View className="p-5 gap-5">
                {/* Basic Info */}
                <View className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <View className="flex-row items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <Edit2 size={14} color="#64748b" />
                    <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Basic Information</Text>
                  </View>
                  <View className="p-4 gap-4">
                    {isSuperAdmin && (
                      <View>
                        <Text className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Company</Text>
                        <TextInput className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900" value={companyName} onChangeText={setCompanyName} />
                      </View>
                    )}
                    <View className="flex-row gap-3">
                      <View className="flex-1">
                        <Text className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">First Name</Text>
                        <TextInput className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900" value={firstName} onChangeText={setFirstName} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Last Name</Text>
                        <TextInput className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900" value={lastName} onChangeText={setLastName} />
                      </View>
                    </View>
                    {!isSuperAdmin && (
                      <View>
                        <Text className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Title</Text>
                        <TextInput className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900" value={title} onChangeText={setTitle} />
                      </View>
                    )}
                    <View>
                      <Text className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Email</Text>
                      <TextInput className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900" value={email} onChangeText={setEmail} keyboardType="email-address" />
                    </View>

                    <View className="flex-row items-center justify-between mt-2">
                      {infoMsg && (
                        <Text className={`text-xs ${infoMsg.type === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>{infoMsg.text}</Text>
                      )}
                      <TouchableOpacity onPress={handleInfoSave} disabled={infoLoading} className="ml-auto px-4 py-2 bg-slate-900 rounded-lg flex-row items-center gap-2">
                        {infoLoading && <ActivityIndicator size="small" color="#fff" />}
                        <Text className="text-xs font-bold text-white">Save Changes</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Reset Password */}
                <View className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <View className="flex-row items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <Key size={14} color="#64748b" />
                    <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Reset Password</Text>
                  </View>
                  <View className="p-4 gap-4">
                    <View>
                      <Text className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">New Password</Text>
                      <View className="relative">
                        <TextInput className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 pr-10 text-sm text-slate-900" value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showPw} />
                        <TouchableOpacity onPress={() => setShowPw(v => !v)} className="absolute right-3 top-0 bottom-0 justify-center">
                          {showPw ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View>
                      <Text className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Confirm Password</Text>
                      <TextInput className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPw} />
                    </View>
                    <View className="flex-row items-center justify-between mt-2">
                      {pwMsg && (
                        <Text className={`text-xs flex-1 mr-2 ${pwMsg.type === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>{pwMsg.text}</Text>
                      )}
                      <TouchableOpacity onPress={handlePasswordReset} disabled={pwLoading} className="ml-auto px-4 py-2 bg-slate-900 rounded-lg flex-row items-center gap-2">
                        {pwLoading && <ActivityIndicator size="small" color="#fff" />}
                        <Text className="text-xs font-bold text-white">Reset</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Account Status */}
                <View className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <View className="flex-row items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <ToggleLeft size={14} color="#64748b" />
                    <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Account Status</Text>
                  </View>
                  <View className="p-4 flex-row items-center justify-between">
                    <View>
                      <Text className="text-xs font-bold text-slate-900 mb-2">Current Status</Text>
                      <StatusBadge active={isActive} />
                      {statusMsg && <Text className={`text-[10px] mt-2 ${statusMsg.type === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>{statusMsg.text}</Text>}
                    </View>

                    <TouchableOpacity
                      onPress={handleToggleStatus} disabled={statusLoading}
                      className={`px-4 py-2 rounded-lg border flex-row items-center gap-2 ${isActive ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}
                    >
                      {statusLoading && <ActivityIndicator size="small" color={isActive ? '#dc2626' : '#047857'} />}
                      {!statusLoading && (isActive ? <ShieldOff size={14} color="#dc2626" /> : <Shield size={14} color="#047857" />)}
                      <Text className={`text-xs font-bold ${isActive ? 'text-red-700' : 'text-emerald-700'}`}>{isActive ? 'Deactivate' : 'Activate'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Account Actions */}
                {user.email !== 'admin@admin.com' && (
                  <View className="bg-white border border-red-200 rounded-xl overflow-hidden shadow-sm mb-4">
                    <View className="flex-row items-center gap-2 px-4 py-3 bg-red-50 border-b border-red-200">
                      <Trash2 size={14} color="#dc2626" />
                      <Text className="text-[11px] font-bold uppercase tracking-widest text-red-700">Danger Zone</Text>
                    </View>
                    <View className="p-4 flex-row items-center justify-between">
                      <View className="flex-1 mr-4">
                        <Text className="text-xs font-bold text-slate-900 mb-1">Delete User</Text>
                        <Text className="text-[10px] text-slate-500">Permanently delete this user. This action cannot be undone.</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          onClose();
                          if (onRequestDelete) onRequestDelete();
                        }}
                        className="px-4 py-2 rounded-lg bg-red-600 flex-row items-center gap-2"
                      >
                        <Text className="text-xs font-bold text-white">Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────

function DeleteConfirmModal({
  user, visible, onClose, onDeleted,
}: {
  user: UserProfile;
  visible: boolean;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/admin/users/${user.id}`, { method: 'DELETE' });
      onDeleted(user.id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-center items-center p-4">
        <View className="bg-white w-full max-w-sm rounded-2xl p-6 items-center shadow-xl">
          <View className="w-14 h-14 rounded-full bg-red-50 border border-red-100 items-center justify-center mb-4">
            <Trash2 size={24} color="#dc2626" />
          </View>
          <Text className="text-base font-bold text-slate-900 text-center mb-2">Delete User</Text>
          <Text className="text-sm text-slate-500 text-center leading-5 mb-6">
            Are you sure you want to permanently delete {user.first_name} {user.last_name}? This action cannot be undone.
          </Text>

          {error && <Text className="text-xs text-red-600 mb-4">{error}</Text>}

          <View className="flex-row gap-3 w-full">
            <TouchableOpacity onPress={onClose} className="flex-1 py-3 rounded-xl border border-slate-300 items-center">
              <Text className="text-sm font-semibold text-slate-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} disabled={loading} className={`flex-1 py-3 rounded-xl bg-red-600 items-center flex-row justify-center gap-2 ${loading ? 'opacity-60' : ''}`}>
              {loading && <ActivityIndicator size="small" color="#fff" />}
              <Text className="text-sm font-bold text-white">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Admin Dashboard ────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // ── Theme tokens ──
  const bg = isDark ? '#020617' : '#ffffff';
  const cardBg = isDark ? '#0f172a' : '#ffffff';
  const cardBorder = isDark ? '#1e293b' : '#e2e8f0';
  const valueClr = isDark ? '#f1f5f9' : '#0f172a';
  const subClr = isDark ? '#64748b' : '#64748b';
  const labelClr = isDark ? '#475569' : '#94a3b8';
  const inputBg = isDark ? '#0f172a' : '#ffffff';
  const sectionBg = isDark ? '#1e293b' : '#f8fafc';
  const divider = isDark ? '#1e293b' : '#e2e8f0';

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);

  const isSuperAdmin = currentUser ? (currentUser.email === 'admin@admin.com' || !currentUser.company_name) : true;

  const fetchUsers = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await apiFetch('/admin/users/');
      setUsers(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers(true);
  };

  const activeUsers = users.filter(u => u.is_active).length;
  const inactiveUsers = users.length - activeUsers;
  const filtered = users.filter(u => {
    const q = searchQuery.toLowerCase();
    const matchesQ = !q || `${u.first_name} ${u.last_name} ${u.email} ${u.company_name || ''}`.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.is_active) ||
      (statusFilter === 'inactive' && !u.is_active);
    return matchesQ && matchesStatus;
  });

  const showFilterMenu = () => {
    setFilterMenuVisible(true);
  };

  const getFilterText = () => {
    if (statusFilter === 'active') return 'Active';
    if (statusFilter === 'inactive') return 'Inactive';
    return 'All Status';
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d9488" />}
        contentContainerStyle={{ paddingBottom: 40, backgroundColor: bg }}
        style={{ backgroundColor: bg }}
        ListHeaderComponent={
          <>
            <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, backgroundColor: bg }}>
              <Text style={{ fontSize: 28, fontWeight: '900', color: valueClr, marginBottom: 4, letterSpacing: -0.5 }}>User Management</Text>
              <Text style={{ fontSize: 14, color: subClr, marginBottom: 24 }}>Manage platform users, roles, and access control.</Text>

              <TouchableOpacity onPress={() => setIsCreateOpen(true)} style={{ width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: '#0d9488', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <UserPlus size={18} color="#fff" />
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff', marginLeft: 8 }}>New User</Text>
              </TouchableOpacity>

              <View>
                <StatCard label="TOTAL USERS" value={users.length} icon={Users} isDark={isDark} />
                <StatCard label="ACTIVE" value={activeUsers} icon={CheckCircle2} accent isDark={isDark} />
                <StatCard label="INACTIVE" value={inactiveUsers} icon={XCircle} danger isDark={isDark} />
              </View>
            </View>

            <View style={{ paddingHorizontal: 16, paddingBottom: 0 }}>
              <View style={{ backgroundColor: cardBg, borderTopLeftRadius: 14, borderTopRightRadius: 14, borderWidth: 1, borderBottomWidth: 0, borderColor: cardBorder, overflow: 'hidden' }}>
                <View style={{ paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: cardBorder }}>
                  <View className="flex-row items-center mb-3">
                    <View className="flex-1 relative justify-center">
                      <View className="absolute left-3 z-10">
                        <Search size={16} color="#94a3b8" />
                      </View>
                      <TextInput
                        className="pl-9 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                        placeholder="Search by name or email..."
                        placeholderTextColor={subClr}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                      />
                    </View>
                  </View>
                  <TouchableOpacity onPress={showFilterMenu} style={{ alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: cardBorder, flexDirection: 'row', alignItems: 'center', backgroundColor: sectionBg }}>
                    <Filter size={15} color={subClr} />
                    <Text style={{ fontSize: 13, fontWeight: '500', color: valueClr, marginLeft: 6, marginRight: 12 }}>{getFilterText()}</Text>
                    <ChevronDown size={15} color={subClr} />
                  </TouchableOpacity>
                </View>


                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: sectionBg, borderBottomWidth: 1, borderBottomColor: cardBorder }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: labelClr, textTransform: 'uppercase', letterSpacing: 1.5 }}>USER</Text>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: labelClr, textTransform: 'uppercase', letterSpacing: 1.5 }}>COMPANY</Text>
                </View>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={() => (
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ backgroundColor: cardBg, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: cardBorder, padding: 40, alignItems: 'center', justifyContent: 'center' }}>
              {loading
                ? <ActivityIndicator size="large" color="#0d9488" />
                : (
                  <>
                    <Users size={32} color={isDark ? '#334155' : '#cbd5e1'} />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: subClr, marginTop: 16 }}>No users found</Text>
                  </>
                )}
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 20 }}>
            <TouchableOpacity
              onPress={() => setEditUser(item)}
              style={{ backgroundColor: cardBg, borderBottomWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: divider, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderWidth: 1, borderColor: cardBorder, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: valueClr, textTransform: 'uppercase' }}>
                    {item.role === 'ADMIN' && item.company_name ? item.company_name[0] : `${item.first_name[0]}${item.last_name ? item.last_name[0] : ''}`}
                  </Text>
                </View>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: valueClr, lineHeight: 20 }}>
                    {item.role === 'ADMIN' && item.company_name ? item.company_name : `${item.first_name} ${item.last_name}`}
                  </Text>
                  <Text style={{ fontSize: 12, color: subClr, marginTop: 2 }}>{item.email}</Text>
                </View>
              </View>
              <View style={{ marginLeft: 8 }}>
                {isSuperAdmin ? (
                  item.company_name && item.company_name.toLowerCase() !== 'n/a' ? (
                    <View style={{ backgroundColor: isDark ? '#172554' : '#eff6ff', borderWidth: 1, borderColor: isDark ? '#1e3a8a' : '#bfdbfe', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#60a5fa' : '#1d4ed8' }}>{item.company_name}</Text>
                    </View>
                  ) : (
                    <View style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderWidth: 1, borderColor: cardBorder, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: subClr }}>N/A</Text>
                    </View>
                  )
                ) : (
                  item.title && item.title.toLowerCase() !== 'n/a' ? (
                    <View style={{ backgroundColor: isDark ? '#172554' : '#eff6ff', borderWidth: 1, borderColor: isDark ? '#1e3a8a' : '#bfdbfe', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#60a5fa' : '#1d4ed8' }}>{item.title}</Text>
                    </View>
                  ) : (
                    <View style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderWidth: 1, borderColor: cardBorder, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: subClr }}>N/A</Text>
                    </View>
                  )
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={{ paddingHorizontal: 20, marginBottom: 40 }}>
            <View style={{ backgroundColor: cardBg, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, borderWidth: 1, borderColor: cardBorder, padding: 14 }}>
              <Text style={{ fontSize: 13, color: subClr }}>Showing {filtered.length} of {users.length} users</Text>
            </View>
          </View>
        )}
      />

      {isCreateOpen && (
        <CreateUserModal
          visible={isCreateOpen}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setIsCreateOpen(false)}
          onCreated={(u) => setUsers([u, ...users])}
        />
      )}
      {editUser && (
        <EditUserModal
          user={editUser}
          visible={!!editUser}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setEditUser(null)}
          onUpdated={(u) => {
            setUsers(users.map(old => old.id === u.id ? u : old));
            setEditUser(null);
          }}
          onRequestDelete={() => setDeleteUser(editUser)}
        />
      )}
      {deleteUser && (
        <DeleteConfirmModal
          user={deleteUser}
          visible={!!deleteUser}
          onClose={() => setDeleteUser(null)}
          onDeleted={(id) => {
            setUsers(users.filter(u => u.id !== id));
            setDeleteUser(null);
          }}
        />
      )}

      {/* Custom Filter Modal */}
      <Modal visible={filterMenuVisible} transparent animationType="fade" onRequestClose={() => setFilterMenuVisible(false)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setFilterMenuVisible(false)}
          className="flex-1 bg-black/40 justify-center items-center px-4"
        >
          <TouchableOpacity activeOpacity={1} className="w-full max-w-[90%] bg-[#362f2f] rounded-3xl overflow-hidden shadow-2xl">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'active', label: 'Active' },
              { id: 'inactive', label: 'Inactive' },
            ].map((option, idx) => {
              const isSelected = statusFilter === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => {
                    setStatusFilter(option.id as any);
                    setFilterMenuVisible(false);
                  }}
                  className={`flex-row items-center justify-between px-6 py-5 ${idx !== 2 ? 'border-b border-white/10' : ''}`}
                >
                  <Text className="text-white text-[17px]">{option.label}</Text>
                  <View className="w-6 h-6 rounded-full border-2 border-[#e2e8f0] items-center justify-center">
                    {isSelected && <View className="w-3.5 h-3.5 rounded-full bg-[#fca5a5]" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}
