import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator,
  Alert, Modal, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users, UserPlus, Search, Shield, ShieldOff,
  Edit2, Trash2, X, CheckCircle2, XCircle, Eye, EyeOff,
  AlertTriangle, Key, UserCheck, ChevronDown, ToggleLeft,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
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
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, accentColor = '#475569', bgColor = '#f1f5f9', borderColor = '#e2e8f0',
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accentColor?: string;
  bgColor?: string;
  borderColor?: string;
}) {
  return (
    <View style={{
      backgroundColor: '#ffffff',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginHorizontal: 4,
    }}>
      <View style={{
        width: 40, height: 40, borderRadius: 8, backgroundColor: bgColor,
        borderWidth: 1, borderColor, alignItems: 'center', justifyContent: 'center', marginRight: 12,
      }}>
        <Icon size={18} color={accentColor} />
      </View>
      <View>
        <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: '#94a3b8' }}>{label}</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172a', marginTop: 2 }}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Badge Components ────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: UserRole }) {
  const isAdmin = role?.toUpperCase() === 'ADMIN';
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3,
      borderRadius: 6, borderWidth: 1,
      backgroundColor: isAdmin ? '#f1f5f9' : '#ffffff',
      borderColor: isAdmin ? '#cbd5e1' : '#e2e8f0',
    }}>
      {isAdmin ? <Shield size={11} color="#475569" /> : <UserCheck size={11} color="#94a3b8" />}
      <Text style={{
        fontSize: 11, fontWeight: isAdmin ? '700' : '500',
        color: isAdmin ? '#475569' : '#94a3b8', marginLeft: 4,
      }}>{isAdmin ? 'Admin' : 'User'}</Text>
    </View>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3,
      borderRadius: 6, borderWidth: 1,
      backgroundColor: active ? '#ecfdf5' : '#fef2f2',
      borderColor: active ? '#a7f3d0' : '#fecaca',
    }}>
      {active ? <CheckCircle2 size={11} color="#047857" /> : <XCircle size={11} color="#dc2626" />}
      <Text style={{
        fontSize: 11, fontWeight: '700',
        color: active ? '#047857' : '#dc2626', marginLeft: 4,
      }}>{active ? 'Active' : 'Inactive'}</Text>
    </View>
  );
}

// ─── Create User Modal ───────────────────────────────────────────────────────

function CreateUserModal({
  visible, onClose, onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: (user: UserProfile) => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFirstName(''); setLastName(''); setEmail(''); setPassword(''); setRole('USER');
    setShowPw(false); setError(null);
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const created = await apiFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          first_name: firstName, last_name: lastName, email, password, role: role.toUpperCase(),
        }),
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
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: '#e2e8f0' }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <UserPlus size={16} color="#475569" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a', marginLeft: 8 }}>Create New User</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 4, borderRadius: 6 }}>
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={{ padding: 20 }}>
            {error && (
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', marginBottom: 16 }}>
                <AlertTriangle size={14} color="#dc2626" />
                <Text style={{ fontSize: 13, color: '#b91c1c', marginLeft: 8, flex: 1 }}>{error}</Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>First Name</Text>
                <TextInput
                  style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a' }}
                  value={firstName} onChangeText={setFirstName} placeholder="John"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Last Name</Text>
                <TextInput
                  style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a' }}
                  value={lastName} onChangeText={setLastName} placeholder="Doe"
                />
              </View>
            </View>

            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Email</Text>
              <TextInput
                style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a' }}
                value={email} onChangeText={setEmail} placeholder="john@example.com" keyboardType="email-address" autoCapitalize="none"
              />
            </View>

            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Password</Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, paddingRight: 44, fontSize: 14, color: '#0f172a' }}
                  value={password} onChangeText={setPassword} secureTextEntry={!showPw} placeholder="Min. 8 characters"
                />
                <TouchableOpacity onPress={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}>
                  {showPw ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Role</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setRole('USER')}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, alignItems: 'center',
                    backgroundColor: role === 'USER' ? '#0f172a' : '#f8fafc',
                    borderColor: role === 'USER' ? '#0f172a' : '#cbd5e1',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: role === 'USER' ? '#fff' : '#64748b' }}>User</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setRole('ADMIN')}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, alignItems: 'center',
                    backgroundColor: role === 'ADMIN' ? '#0f172a' : '#f8fafc',
                    borderColor: role === 'ADMIN' ? '#0f172a' : '#cbd5e1',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: role === 'ADMIN' ? '#fff' : '#64748b' }}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={onClose} style={{
                flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center',
              }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} disabled={loading} style={{
                flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#0f172a', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', opacity: loading ? 0.6 : 1,
              }}>
                {loading ? <ActivityIndicator size="small" color="#fff" /> : <UserPlus size={14} color="#fff" />}
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff', marginLeft: 6 }}>Create User</Text>
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
  user, visible, onClose, onUpdated,
}: {
  user: UserProfile;
  visible: boolean;
  onClose: () => void;
  onUpdated: (u: UserProfile) => void;
}) {
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [email, setEmail] = useState(user.email);
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
      const updated = await apiFetch(`/admin/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, role: role.toUpperCase() }),
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
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'err', text: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg({ type: 'err', text: 'Password must be at least 8 characters.' });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      await apiFetch(`/admin/users/${user.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ new_password: newPassword }),
      });
      setPwMsg({ type: 'ok', text: 'Password reset successfully.' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwMsg({ type: 'err', text: err.message });
    } finally {
      setPwLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setStatusLoading(true);
    setStatusMsg(null);
    try {
      const updated = await apiFetch(`/admin/users/${user.id}/toggle-status`, { method: 'POST' });
      setIsActive(updated.is_active);
      onUpdated(updated);
      setStatusMsg({ type: 'ok', text: `User is now ${updated.is_active ? 'active' : 'inactive'}.` });
    } catch (err: any) {
      setStatusMsg({ type: 'err', text: err.message });
    } finally {
      setStatusLoading(false);
    }
  };

  const MsgDisplay = ({ m }: { m: { type: 'ok' | 'err'; text: string } | null }) =>
    m ? (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        {m.type === 'ok' ? <CheckCircle2 size={13} color="#047857" /> : <AlertTriangle size={13} color="#dc2626" />}
        <Text style={{ fontSize: 12, color: m.type === 'ok' ? '#047857' : '#dc2626', marginLeft: 6, flex: 1 }}>{m.text}</Text>
      </View>
    ) : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, maxHeight: '90%', borderWidth: 1, borderColor: '#e2e8f0' }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }}>Edit User</Text>
              <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{user.first_name} {user.last_name} · {user.email}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 20 }} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* ── Section 1: Basic Info ── */}
            <View style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, marginBottom: 16, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
                <Edit2 size={13} color="#475569" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 8 }}>Basic Information</Text>
              </View>
              <View style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>First Name</Text>
                    <TextInput
                      style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a' }}
                      value={firstName} onChangeText={setFirstName}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>Last Name</Text>
                    <TextInput
                      style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a' }}
                      value={lastName} onChangeText={setLastName}
                    />
                  </View>
                </View>
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>Email</Text>
                  <TextInput
                    style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a' }}
                    value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
                  />
                </View>
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>Role</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => setRole('USER')}
                      style={{
                        flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, alignItems: 'center',
                        backgroundColor: role === 'USER' ? '#0f172a' : '#f8fafc', borderColor: role === 'USER' ? '#0f172a' : '#cbd5e1',
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: role === 'USER' ? '#fff' : '#64748b' }}>User</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setRole('ADMIN')}
                      style={{
                        flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, alignItems: 'center',
                        backgroundColor: role === 'ADMIN' ? '#0f172a' : '#f8fafc', borderColor: role === 'ADMIN' ? '#0f172a' : '#cbd5e1',
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: role === 'ADMIN' ? '#fff' : '#64748b' }}>Admin</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <MsgDisplay m={infoMsg} />
                <TouchableOpacity onPress={handleInfoSave} disabled={infoLoading} style={{
                  marginTop: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: '#0f172a', alignItems: 'center',
                  flexDirection: 'row', justifyContent: 'center', opacity: infoLoading ? 0.6 : 1,
                }}>
                  {infoLoading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 6 }} />}
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff' }}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Section 2: Reset Password ── */}
            <View style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, marginBottom: 16, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
                <Key size={13} color="#475569" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 8 }}>Reset Password</Text>
              </View>
              <View style={{ padding: 14 }}>
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>New Password</Text>
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, paddingRight: 44, fontSize: 14, color: '#0f172a' }}
                      value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showPw} placeholder="Min. 8 characters"
                    />
                    <TouchableOpacity onPress={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}>
                      {showPw ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>Confirm Password</Text>
                  <TextInput
                    style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a' }}
                    value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPw}
                  />
                </View>
                <MsgDisplay m={pwMsg} />
                <TouchableOpacity onPress={handlePasswordReset} disabled={pwLoading} style={{
                  marginTop: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: '#0f172a', alignItems: 'center',
                  flexDirection: 'row', justifyContent: 'center', opacity: pwLoading ? 0.6 : 1,
                }}>
                  {pwLoading ? <ActivityIndicator size="small" color="#fff" style={{ marginRight: 6 }} /> : <Key size={14} color="#fff" style={{ marginRight: 6 }} />}
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff' }}>Reset Password</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Section 3: Account Status ── */}
            <View style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
                <ToggleLeft size={13} color="#475569" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 8 }}>Account Status</Text>
              </View>
              <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>Current Status</Text>
                  <View style={{ marginTop: 6 }}>
                    <StatusBadge active={isActive} />
                  </View>
                  <MsgDisplay m={statusMsg} />
                </View>
                <TouchableOpacity onPress={handleToggleStatus} disabled={statusLoading} style={{
                  flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1,
                  backgroundColor: isActive ? '#fef2f2' : '#ecfdf5',
                  borderColor: isActive ? '#fecaca' : '#a7f3d0',
                  opacity: statusLoading ? 0.6 : 1,
                }}>
                  {statusLoading ? (
                    <ActivityIndicator size="small" color={isActive ? '#dc2626' : '#047857'} />
                  ) : isActive ? (
                    <ShieldOff size={16} color="#dc2626" />
                  ) : (
                    <Shield size={16} color="#047857" />
                  )}
                  <Text style={{
                    fontSize: 13, fontWeight: '600', marginLeft: 6,
                    color: isActive ? '#b91c1c' : '#047857',
                  }}>{isActive ? 'Deactivate' : 'Activate'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Delete Confirm Dialog ───────────────────────────────────────────────────

function DeleteConfirmDialog({
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
    setError(null);
    try {
      await apiFetch(`/admin/users/${user.id}`, { method: 'DELETE' });
      onDeleted(user.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 340, padding: 24, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' }}>
          <View style={{
            width: 48, height: 48, borderRadius: 24, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <Trash2 size={20} color="#dc2626" />
          </View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a', textAlign: 'center' }}>Delete User</Text>
          <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
            Are you sure you want to permanently delete{' '}
            <Text style={{ fontWeight: '700', color: '#334155' }}>{user.first_name} {user.last_name}</Text>?
            This action cannot be undone.
          </Text>
          {error && (
            <View style={{ marginTop: 12, padding: 10, borderRadius: 8, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', width: '100%' }}>
              <Text style={{ fontSize: 12, color: '#b91c1c', textAlign: 'center' }}>{error}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20, width: '100%' }}>
            <TouchableOpacity onPress={onClose} style={{
              flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center',
            }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} disabled={loading} style={{
              flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#dc2626', alignItems: 'center',
              flexDirection: 'row', justifyContent: 'center', opacity: loading ? 0.6 : 1,
            }}>
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Trash2 size={14} color="#fff" />}
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff', marginLeft: 6 }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── User Row ────────────────────────────────────────────────────────────────

function UserRow({
  user, onEdit, onDelete,
}: {
  user: UserProfile;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const initials = `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase();

  return (
    <View style={{
      paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
      backgroundColor: '#fff',
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Avatar */}
        <View style={{
          width: 38, height: 38, borderRadius: 19, backgroundColor: '#e2e8f0', borderWidth: 1, borderColor: '#cbd5e1',
          alignItems: 'center', justifyContent: 'center', marginRight: 12,
        }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#475569' }}>{initials}</Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>{user.first_name} {user.last_name}</Text>
          <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>{user.email}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <RoleBadge role={user.role} />
            <StatusBadge active={user.is_active} />
            <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '500' }}>
              {user.available_credits?.toLocaleString() ?? 0} credits
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, paddingLeft: 50 }}>
        <TouchableOpacity onPress={onEdit} style={{
          flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7,
          borderRadius: 6, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#fff',
        }}>
          <Edit2 size={13} color="#475569" />
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginLeft: 5 }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={{
          flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7,
          borderRadius: 6, borderWidth: 1, borderColor: '#fecaca', backgroundColor: '#fff',
        }}>
          <Trash2 size={13} color="#dc2626" />
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#dc2626', marginLeft: 5 }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main Admin Dashboard ────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);

  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setFetchError(null);
    try {
      const data = await apiFetch('/admin/users');
      setUsers(data);
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('403')) {
        signOut();
        return;
      }
      setFetchError(err.message || 'Failed to fetch users.');
    } finally {
      if (isRefresh) setRefreshing(false); else setLoading(false);
    }
  }, [signOut]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

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
  };

  const handleUpdated = (u: UserProfile) => {
    setUsers(prev => prev.map(x => x.id === u.id ? u : x));
  };

  const handleDeleted = (id: string) => {
    setUsers(prev => prev.filter(x => x.id !== id));
  };

  const toggleStatusFilter = () => {
    const order: ('all' | 'active' | 'inactive')[] = ['all', 'active', 'inactive'];
    const idx = order.indexOf(statusFilter);
    setStatusFilter(order[(idx + 1) % order.length]);
  };

  const statusFilterLabel = statusFilter === 'all' ? 'All Status' : statusFilter === 'active' ? 'Active' : 'Inactive';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172a', letterSpacing: -0.3 }}>User Management</Text>
            <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Manage platform users, roles, and access.</Text>
          </View>
          <TouchableOpacity onPress={() => setIsCreateOpen(true)} style={{
            flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
            backgroundColor: '#0f172a', borderRadius: 10,
          }}>
            <UserPlus size={14} color="#fff" />
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff', marginLeft: 6 }}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 12, marginBottom: 16 }}>
        <StatCard label="Total" value={loading ? '—' : totalUsers} icon={Users} />
        <StatCard label="Active" value={loading ? '—' : activeUsers} icon={CheckCircle2} accentColor="#047857" bgColor="#ecfdf5" borderColor="#a7f3d0" />
        <StatCard label="Inactive" value={loading ? '—' : inactiveUsers} icon={XCircle} accentColor="#dc2626" bgColor="#fef2f2" borderColor="#fecaca" />
      </View>

      {/* Search & Filter Bar */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or email…"
              placeholderTextColor="#94a3b8"
              style={{
                backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10,
                paddingLeft: 38, paddingRight: 14, paddingVertical: 10, fontSize: 14, color: '#0f172a',
              }}
            />
          </View>
          <TouchableOpacity onPress={toggleStatusFilter} style={{
            flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
            backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10,
          }}>
            <Text style={{ fontSize: 13, fontWeight: '500', color: '#475569' }}>{statusFilterLabel}</Text>
            <ChevronDown size={14} color="#94a3b8" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* User List */}
      <View style={{ flex: 1, backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' }}>
        {fetchError ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <AlertTriangle size={20} color="#dc2626" />
            </View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#334155' }}>Failed to load users</Text>
            <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{fetchError}</Text>
            <TouchableOpacity onPress={() => fetchUsers()} style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#0f172a', borderRadius: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <ActivityIndicator size="large" color="#64748b" />
            <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 12 }}>Loading users…</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <Users size={32} color="#cbd5e1" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginTop: 12 }}>No users found</Text>
            <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Try adjusting your search or filters.</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <UserRow
                user={item}
                onEdit={() => setEditUser(item)}
                onDelete={() => setDeleteUser(item)}
              />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => fetchUsers(true)} tintColor="#64748b" />
            }
            ListFooterComponent={() => (
              <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f8fafc', borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                  Showing <Text style={{ fontWeight: '600', color: '#475569' }}>{filtered.length}</Text> of <Text style={{ fontWeight: '600', color: '#475569' }}>{totalUsers}</Text> users
                </Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Bottom Spacer */}
      <View style={{ height: 16 }} />

      {/* Modals */}
      <CreateUserModal
        visible={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleCreated}
      />
      {editUser && (
        <EditUserModal
          user={editUser}
          visible={!!editUser}
          onClose={() => setEditUser(null)}
          onUpdated={(u) => { handleUpdated(u); setEditUser(u); }}
        />
      )}
      {deleteUser && (
        <DeleteConfirmDialog
          user={deleteUser}
          visible={!!deleteUser}
          onClose={() => setDeleteUser(null)}
          onDeleted={handleDeleted}
        />
      )}
    </SafeAreaView>
  );
}
