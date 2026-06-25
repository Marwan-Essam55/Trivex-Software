import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UploadCloud, Video, BarChart3, Activity, CheckCircle2, Clock, PlayCircle, Camera as CameraIcon, X, Square, FileVideo, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AdminDashboard from './admin';

export default function DashboardView() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const router = useRouter();
  const { user } = useAuth();
  const role = (user?.role || 'USER').toUpperCase();
  const isAdmin = role === 'ADMIN';
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Camera States
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const fetchDashboardData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const data = await apiFetch('/api/videos/my');
      setVideos(data);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAdmin && user) {
      fetchDashboardData();
    }
  }, [isAdmin, user]);

  if (isAdmin) {
    return <AdminDashboard />;
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(true);
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['video/*', 'audio/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      if (file) {
        uploadFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'video/mp4',
        });
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An error occurred while opening the file picker.');
    }
  };

  const uploadFile = async (file: { uri: string; name: string; type: string }) => {
    setUploading(true);
    setUploadProgress('Uploading file to Trivex workspace...');

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      await apiFetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      Alert.alert('Upload Successful', `${file.name} has been uploaded and queued for clinical analysis.`);
      fetchDashboardData(true);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Upload Failed', err.message || 'An error occurred while uploading the file.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const openCamera = async () => {
    if (!cameraPermission?.granted) {
      const camReq = await requestCameraPermission();
      if (!camReq.granted) return Alert.alert('Permission needed', 'Camera permission is required');
    }
    if (!micPermission?.granted) {
      const micReq = await requestMicPermission();
      if (!micReq.granted) return Alert.alert('Permission needed', 'Microphone permission is required');
    }
    setCameraOpen(true);
  };

  const handleRecordVideo = async () => {
    if (cameraRef.current) {
      if (isRecording) {
        setIsRecording(false);
        cameraRef.current.stopRecording();
      } else {
        setIsRecording(true);
        try {
          const video = await cameraRef.current.recordAsync({ maxDuration: 60 });
          setCameraOpen(false);
          if (video && video.uri) {
            const fileName = `recording_${Date.now()}.mp4`;
            uploadFile({ uri: video.uri, name: fileName, type: 'video/mp4' });
          }
        } catch (e) {
          setIsRecording(false);
          Alert.alert('Recording Failed', 'An error occurred during recording.');
        }
      }
    }
  };

  const handleAnalyze = (videoObj: any) => {
    router.push({
      pathname: '/(tabs)/fusion',
      params: { video: JSON.stringify(videoObj) }
    });
  };

  const totalVideos = videos.length;
  const completedVideosCount = videos.filter(v => v.status === 'COMPLETED').length;

  const recentFiles = videos.slice(0, 3).map(v => {
    const statusDisplay = v.status ? v.status.charAt(0).toUpperCase() + v.status.slice(1).toLowerCase() : 'Pending';
    const isCompleted = statusDisplay === 'Completed';

    let statusColor = 'bg-slate-50 border-slate-200';
    let textColor = 'text-slate-600';
    if (isCompleted) {
      statusColor = 'bg-emerald-50 border-emerald-200';
      textColor = 'text-emerald-700';
    } else if (v.status === 'FAILED') {
      statusColor = 'bg-red-50 border-red-200';
      textColor = 'text-red-700';
    }

    const formattedDate = v.uploaded_at
      ? new Date(v.uploaded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : 'Just now';

    return {
      id: v.id,
      name: v.original_filename || v.filename || 'Untitled Ingestion',
      date: formattedDate,
      status: statusDisplay,
      statusColor,
      textColor,
      isCompleted,
      rawVideo: v,
    };
  });

  // ── Theme tokens ──
  const bg = isDark ? '#020617' : '#f8fafc';
  const cardBg = isDark ? '#0f172a' : '#ffffff';
  const cardBorder = isDark ? '#1e293b' : '#e2e8f0';
  const labelClr = isDark ? '#475569' : '#94a3b8';
  const valueClr = isDark ? '#f1f5f9' : '#0f172a';
  const subClr = isDark ? '#64748b' : '#94a3b8';
  const divider = isDark ? '#1e293b' : '#f1f5f9';
  const dashedBorder = isDark ? '#334155' : '#cbd5e1';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: bg }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />
        }
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: valueClr, letterSpacing: -0.5 }}>My Workspace</Text>
          <Text style={{ fontSize: 13, color: subClr, marginTop: 4 }}>Monitor your data processing and analytical workloads.</Text>
        </View>

        {/* Stat cards stack */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ backgroundColor: cardBg, borderRadius: 14, borderWidth: 1, borderColor: cardBorder, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 1 }}>
            <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderWidth: 1, borderColor: cardBorder, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Video size={20} color={isDark ? '#94a3b8' : '#475569'} />
            </View>
            <View>
              <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: labelClr, marginBottom: 4 }}>Total Videos</Text>
              {loading
                ? <ActivityIndicator size="small" color={subClr} style={{ alignSelf: 'flex-start' }} />
                : <Text style={{ fontSize: 26, fontWeight: '900', color: valueClr }}>{totalVideos}</Text>
              }
            </View>
          </View>

          <View style={{ backgroundColor: cardBg, borderRadius: 14, borderWidth: 1, borderColor: cardBorder, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 1 }}>
            <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <CheckCircle2 size={20} color="#047857" />
            </View>
            <View>
              <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: labelClr, marginBottom: 4 }}>Completed</Text>
              {loading
                ? <ActivityIndicator size="small" color={subClr} style={{ alignSelf: 'flex-start' }} />
                : <Text style={{ fontSize: 26, fontWeight: '900', color: valueClr }}>{completedVideosCount}</Text>
              }
            </View>
          </View>

          <View style={{ backgroundColor: cardBg, borderRadius: 14, borderWidth: 1, borderColor: cardBorder, padding: 16, flexDirection: 'row', alignItems: 'center', elevation: 1 }}>
            <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Activity size={20} color="#047857" />
            </View>
            <View>
              <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: labelClr, marginBottom: 4 }}>Engine Status</Text>
              <Text style={{ fontSize: 26, fontWeight: '900', color: valueClr }}>Operational</Text>
            </View>
          </View>
        </View>


        {/* Upload Zone */}
        <View style={{ backgroundColor: cardBg, borderRadius: 14, borderWidth: 1, borderColor: cardBorder, marginBottom: 20, padding: 16, elevation: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: valueClr, marginBottom: 14 }}>Ingest Media File</Text>
          <TouchableOpacity
            onPress={handlePickFile}
            disabled={uploading}
            style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: dashedBorder, borderRadius: 12, paddingVertical: 32, alignItems: 'center', backgroundColor: isDark ? '#1e293b' : '#f8fafc', marginBottom: 14 }}
            activeOpacity={0.7}
          >
            <View style={{ width: 56, height: 56, backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorder, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <UploadCloud size={26} color={isDark ? '#475569' : '#94a3b8'} />
            </View>
            {uploading ? (
              <View style={{ alignItems: 'center' }}>
                <ActivityIndicator size="large" color={isDark ? '#94a3b8' : '#0f172a'} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: valueClr, marginTop: 10 }}>Uploading file...</Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center', paddingHorizontal: 24 }}>
                <Text style={{ fontSize: 13, color: subClr, textAlign: 'center' }}>Tap to browse. MP4, MOV, AVI, MP3, WAV</Text>
                <View style={{ marginTop: 14, backgroundColor: '#0f172a', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}>
                  <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700' }}>Browse Files</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: cardBorder }} />
            <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: labelClr, letterSpacing: 1, paddingHorizontal: 12 }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: cardBorder }} />
          </View>

          <TouchableOpacity
            onPress={openCamera}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: cardBorder, backgroundColor: isDark ? '#1e293b' : '#ffffff', paddingVertical: 12, borderRadius: 10, gap: 8 }}
            activeOpacity={0.75}
          >
            <CameraIcon size={16} color={isDark ? '#94a3b8' : '#334155'} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#94a3b8' : '#334155' }}>Capture Live Video</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Ingestions */}
        <View style={{ backgroundColor: cardBg, borderRadius: 14, borderWidth: 1, borderColor: cardBorder, overflow: 'hidden', elevation: 1, marginBottom: 8 }}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderBottomWidth: 1, borderBottomColor: cardBorder }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: valueClr }}>Recent Ingestions</Text>
          </View>
          {loading ? (
            <View style={{ paddingVertical: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <ActivityIndicator size="small" color={subClr} />
              <Text style={{ fontSize: 13, color: subClr }}>Loading…</Text>
            </View>
          ) : recentFiles.length === 0 ? (
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <FileVideo size={24} color={isDark ? '#334155' : '#cbd5e1'} />
              <Text style={{ fontSize: 13, color: subClr, marginTop: 8, textAlign: 'center' }}>No recent analyses found.{`\n`}Upload your first file above.</Text>
            </View>
          ) : (
            recentFiles.map((file, index) => (
              <TouchableOpacity
                key={file.id}
                onPress={() => handleAnalyze(file.rawVideo)}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: index < recentFiles.length - 1 ? 1 : 0, borderBottomColor: divider }}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderWidth: 1, borderColor: cardBorder, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Video size={16} color={subClr} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: valueClr }} numberOfLines={1}>{file.name}</Text>
                    <Text style={{ fontSize: 11, color: subClr, marginTop: 2 }}>{file.date}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: file.isCompleted ? '#f0fdf4' : '#f8fafc', borderWidth: 1, borderColor: file.isCompleted ? '#bbf7d0' : '#e2e8f0', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, gap: 4 }}>
                  {file.isCompleted ? <CheckCircle2 size={11} color="#047857" /> : <Clock size={11} color="#334155" />}
                  <Text style={{ fontSize: 10, fontWeight: '700', color: file.isCompleted ? '#047857' : '#334155', textTransform: 'uppercase', letterSpacing: 0.5 }}>{file.status}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Camera Modal */}
      <Modal visible={cameraOpen} animationType="slide" transparent={false} onRequestClose={() => setCameraOpen(false)}>
        <View className="flex-1 bg-black">
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing="front"
            mode="video"
          />
          <SafeAreaView className="flex-1 justify-between">
            <View className="p-4 items-end">
              <TouchableOpacity onPress={() => {
                if (isRecording) {
                  cameraRef.current?.stopRecording();
                  setIsRecording(false);
                }
                setCameraOpen(false);
              }} className="p-2 bg-black/50 rounded-full">
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View className="p-8 items-center pb-12">
              <TouchableOpacity
                onPress={handleRecordVideo}
                className="w-20 h-20 rounded-full border-4 border-white/30 items-center justify-center"
              >
                <View className={`rounded-full bg-red-500 ${isRecording ? 'w-8 h-8 rounded-sm' : 'w-16 h-16'}`} />
              </TouchableOpacity>
              {isRecording && <Text className="text-white font-bold mt-4 animate-pulse">Recording...</Text>}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
