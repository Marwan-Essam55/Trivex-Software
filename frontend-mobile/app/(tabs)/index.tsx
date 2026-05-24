import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UploadCloud, Video, BarChart3, Activity, CheckCircle2, Clock, PlayCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { apiFetch } from '../../services/api';

export default function DashboardView() {
  const router = useRouter();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

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
    fetchDashboardData();
  }, []);

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

      const selectedAsset = result.assets[0];
      if (selectedAsset) {
        uploadFile(selectedAsset);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An error occurred while opening the file picker.');
    }
  };

  const uploadFile = async (asset: DocumentPicker.DocumentPickerAsset) => {
    setUploading(true);
    setUploadProgress('Uploading file to Trivex workspace...');

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        type: asset.mimeType || 'video/mp4',
        name: asset.name,
      } as any);

      await apiFetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      Alert.alert('Upload Successful', `${asset.name} has been uploaded and queued for clinical analysis.`);
      fetchDashboardData(true);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Upload Failed', err.message || 'An error occurred while uploading the file.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleAnalyze = () => {
    router.push('/(tabs)/fusion');
  };

  // Compute Stats Dynamically from real backend records
  const filesProcessed = videos.length;
  
  // Calculate average confidence score of all completed analyses
  const completedVideos = videos.filter(v => v.status === 'COMPLETED' && v.assessment_reliability !== null);
  const avgConfidence = completedVideos.length > 0
    ? `${Math.round((completedVideos.reduce((sum, v) => sum + v.assessment_reliability, 0) / completedVideos.length) * 100)}%`
    : '—';

  // Get the 3 most recent ingestions
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
      name: v.filename,
      date: formattedDate,
      status: statusDisplay,
      statusColor,
      textColor,
      isCompleted,
    };
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView 
        className="flex-1 px-4 py-6" 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0f172a']} />
        }
      >
        
        <View className="mb-6">
          <Text className="text-2xl font-bold text-slate-900 tracking-tight">Overview</Text>
          <Text className="text-sm text-slate-500 mt-1">Monitor your data processing and analytical workloads.</Text>
        </View>

        {/* Dynamic Analytics Cards */}
        <View className="gap-4 mb-8">
          <View className="bg-white rounded-lg border border-slate-200 p-5 flex-row items-center shadow-sm">
            <View className="p-3 rounded-md bg-slate-100 mr-4 border border-slate-200">
              <Video size={20} color="#334155" />
            </View>
            <View>
              <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500">Files Processed</Text>
              {loading ? (
                <ActivityIndicator size="small" color="#0f172a" className="mt-1 self-start" />
              ) : (
                <Text className="text-2xl font-bold text-slate-900 mt-1">{filesProcessed}</Text>
              )}
            </View>
          </View>
          
          <View className="bg-white rounded-lg border border-slate-200 p-5 flex-row items-center shadow-sm">
            <View className="p-3 rounded-md bg-slate-100 mr-4 border border-slate-200">
              <BarChart3 size={20} color="#334155" />
            </View>
            <View>
              <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Confidence</Text>
              {loading ? (
                <ActivityIndicator size="small" color="#0f172a" className="mt-1 self-start" />
              ) : (
                <Text className="text-2xl font-bold text-slate-900 mt-1">{avgConfidence}</Text>
              )}
            </View>
          </View>

          <View className="bg-white rounded-lg border border-slate-200 p-5 flex-row items-center shadow-sm">
            <View className="p-3 rounded-md bg-emerald-50 mr-4 border border-emerald-100">
              <Activity size={20} color="#047857" />
            </View>
            <View>
              <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500">Engine Status</Text>
              <Text className="text-2xl font-bold text-slate-900 mt-1">Operational</Text>
            </View>
          </View>
        </View>

        {/* Media Ingestion Pick Card */}
        <View className="bg-white rounded-lg border border-slate-200 p-6 mb-8 items-center justify-center shadow-sm">
          <TouchableOpacity 
            onPress={handlePickFile}
            disabled={uploading}
            className="w-full border-2 border-dashed border-slate-300 rounded-lg p-6 flex items-center justify-center bg-slate-50"
          >
            <View className="w-16 h-16 bg-white border border-slate-200 rounded-lg items-center justify-center mb-4 shadow-sm">
              <UploadCloud size={32} color="#94a3b8" />
            </View>
            
            {uploading ? (
              <View className="items-center">
                <ActivityIndicator size="large" color="#0f172a" />
                <Text className="text-sm font-semibold text-slate-900 mt-4 text-center">Uploading file...</Text>
                <Text className="text-xs text-slate-500 mt-1 text-center">{uploadProgress}</Text>
              </View>
            ) : (
              <View className="items-center">
                <Text className="text-lg font-semibold text-slate-900 mb-2">Ingest Media File</Text>
                <Text className="text-sm text-slate-500 text-center mb-6 px-4">
                  Tap to browse video or audio. Supported formats: MP4, MOV, AVI, MP3, WAV.
                </Text>
                <View className="bg-slate-900 px-6 py-3 rounded-lg shadow-sm">
                  <Text className="text-white text-sm font-semibold">Browse Files</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
          
          <View className="mt-6 flex-row items-center justify-center w-full">
            <Text className="text-xs font-medium uppercase text-slate-400 tracking-wider">or capture live</Text>
          </View>
          
          <TouchableOpacity className="mt-4 border border-slate-300 bg-white px-5 py-3 rounded-lg flex-row items-center shadow-sm">
            <PlayCircle size={16} color="#334155" />
            <Text className="text-slate-700 text-sm font-semibold ml-2">Initialize Stream</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Recent Ingestions */}
        <View className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm mb-8">
          <View className="px-5 py-4 border-b border-slate-200 bg-slate-50">
            <Text className="text-sm font-semibold text-slate-900 tracking-tight">Recent Ingestions</Text>
          </View>
          <View>
            {loading ? (
              <View className="py-6 justify-center items-center">
                <ActivityIndicator size="small" color="#0f172a" />
              </View>
            ) : recentFiles.length === 0 ? (
              <View className="py-8 items-center justify-center">
                <Text className="text-sm text-slate-400">No recent analyses found</Text>
              </View>
            ) : (
              recentFiles.map((file, index) => (
                <TouchableOpacity 
                  key={file.id} 
                  onPress={handleAnalyze}
                  className={`px-5 py-4 flex-row items-center justify-between ${index !== recentFiles.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <View className="flex-row items-center flex-1 pr-4">
                    <View className="w-10 h-10 rounded-md bg-white border border-slate-200 shadow-sm items-center justify-center mr-3">
                      <Video size={16} color="#64748b" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-slate-900" numberOfLines={1}>{file.name}</Text>
                      <Text className="text-xs text-slate-500 mt-1">{file.date}</Text>
                    </View>
                  </View>
                  <View className={`flex-row items-center px-2 py-1 rounded-md border ${file.statusColor}`}>
                    {file.isCompleted ? <CheckCircle2 size={12} color="#047857" /> : <Clock size={12} color="#334155" />}
                    <Text className={`text-xs font-semibold ml-1 ${file.textColor}`}>{file.status}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
