import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UploadCloud, Video, BarChart3, Activity, CheckCircle2, Clock, PlayCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function DashboardView() {
  const router = useRouter();

  const handleAnalyze = () => {
    router.push('/(tabs)/fusion');
  };

  const recentFiles = [
    { id: 1, name: 'clinical_interview_042.mp4', date: 'Today, 10:45 AM', status: 'Completed', statusColor: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-700' },
    { id: 2, name: 'focus_group_session_b.mov', date: 'Today, 09:12 AM', status: 'Processing', statusColor: 'bg-slate-100 border-slate-200', textColor: 'text-slate-700' },
    { id: 3, name: 'usability_test_v3.mp4', date: 'Yesterday, 04:30 PM', status: 'Completed', statusColor: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-700' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 40 }}>
        
        <View className="mb-6">
          <Text className="text-2xl font-bold text-slate-900 tracking-tight">Overview</Text>
          <Text className="text-sm text-slate-500 mt-1">Monitor your data processing and analytical workloads.</Text>
        </View>

        <View className="gap-4 mb-8">
          <View className="bg-white rounded-lg border border-slate-200 p-5 flex-row items-center shadow-sm">
            <View className="p-3 rounded-md bg-slate-100 mr-4 border border-slate-200">
              <Video size={20} color="#334155" />
            </View>
            <View>
              <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500">Files Processed</Text>
              <Text className="text-2xl font-bold text-slate-900 mt-1">1,284</Text>
            </View>
          </View>
          
          <View className="bg-white rounded-lg border border-slate-200 p-5 flex-row items-center shadow-sm">
            <View className="p-3 rounded-md bg-slate-100 mr-4 border border-slate-200">
              <BarChart3 size={20} color="#334155" />
            </View>
            <View>
              <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Confidence</Text>
              <Text className="text-2xl font-bold text-slate-900 mt-1">94.2%</Text>
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

        <View className="bg-white rounded-lg border border-slate-200 p-6 mb-8 items-center justify-center shadow-sm">
          <TouchableOpacity 
            onPress={handleAnalyze}
            className="w-full border-2 border-dashed border-slate-300 rounded-lg p-6 flex items-center justify-center bg-slate-50"
          >
            <View className="w-16 h-16 bg-white border border-slate-200 rounded-lg items-center justify-center mb-4 shadow-sm">
              <UploadCloud size={32} color="#94a3b8" />
            </View>
            <Text className="text-lg font-semibold text-slate-900 mb-2">Ingest Media File</Text>
            <Text className="text-sm text-slate-500 text-center mb-6">
              Tap to browse. Supported formats: MP4, MOV, AVI. Max size: 2GB.
            </Text>
            <View className="bg-slate-900 px-6 py-3 rounded-lg shadow-sm">
              <Text className="text-white text-sm font-semibold">Browse Files</Text>
            </View>
          </TouchableOpacity>
          
          <View className="mt-6 flex-row items-center justify-center w-full">
            <Text className="text-xs font-medium uppercase text-slate-400 tracking-wider">or capture live</Text>
          </View>
          
          <TouchableOpacity className="mt-4 border border-slate-300 bg-white px-5 py-3 rounded-lg flex-row items-center shadow-sm">
            <PlayCircle size={16} color="#334155" />
            <Text className="text-slate-700 text-sm font-semibold ml-2">Initialize Stream</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm mb-8">
          <View className="px-5 py-4 border-b border-slate-200 bg-slate-50">
            <Text className="text-sm font-semibold text-slate-900 tracking-tight">Recent Ingestions</Text>
          </View>
          <View>
            {recentFiles.map((file, index) => (
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
                  {file.status === 'Completed' ? <CheckCircle2 size={12} color="#047857" /> : <Clock size={12} color="#334155" />}
                  <Text className={`text-xs font-semibold ml-1 ${file.textColor}`}>{file.status}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
