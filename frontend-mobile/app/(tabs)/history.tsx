import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, CheckCircle2, Clock, Filter, Video, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../../services/api';

export default function HistoryView() {
  const router = useRouter();
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const data = await apiFetch('/api/videos/my');
      setHistoryData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load analysis archive.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory(true);
  };

  const handleViewDetails = (id: string) => {
    router.push('/(tabs)/fusion');
  };

  // Filter history based on search query
  const filteredHistory = historyData.filter(item => 
    (item.filename || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.primary_assessment || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

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
          <Text className="text-2xl font-bold text-slate-900 tracking-tight">Analysis Archive</Text>
          <Text className="text-sm text-slate-500 mt-1">Review historical multi-modal assessments.</Text>
        </View>

        <View className="flex-row items-center space-x-3 mb-6">
          <View className="flex-1 relative justify-center">
            <View className="absolute left-3 z-10">
              <Search size={16} color="#94a3b8" />
            </View>
            <TextInput
              placeholder="Search ID or name..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="pl-9 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900"
            />
          </View>
          <TouchableOpacity className="flex-row items-center px-4 py-3 bg-white border border-slate-300 rounded-lg">
            <Filter size={16} color="#334155" className="mr-2" />
            <Text className="text-slate-700 text-sm font-semibold">Filter</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="py-20 justify-center items-center">
            <ActivityIndicator size="large" color="#0f172a" />
            <Text className="text-sm text-slate-500 mt-4">Loading analyses...</Text>
          </View>
        ) : error ? (
          <View className="bg-white p-8 rounded-lg border border-slate-200 items-center justify-center shadow-sm">
            <AlertTriangle size={24} color="#ef4444" className="mb-3" />
            <Text className="text-slate-700 text-sm font-semibold text-center">{error}</Text>
            <TouchableOpacity onPress={() => fetchHistory()} className="mt-4 px-4 py-2 bg-slate-900 rounded-md">
              <Text className="text-white text-xs font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredHistory.length === 0 ? (
          <View className="bg-white p-8 rounded-lg border border-slate-200 items-center justify-center shadow-sm py-16">
            <Video size={36} color="#94a3b8" className="mb-3" />
            <Text className="text-slate-700 text-sm font-semibold text-center">No ingestions found</Text>
            <Text className="text-slate-400 text-xs text-center mt-1">Upload a video or audio file to start.</Text>
          </View>
        ) : (
          <View className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            {filteredHistory.map((item, index) => {
              const statusDisplay = item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase() : 'Pending';
              const reliabilityPct = item.assessment_reliability ? `${Math.round(item.assessment_reliability * 100)}%` : '-';
              const emotionText = item.primary_assessment || (statusDisplay === 'Completed' ? 'Neutral Baseline' : 'Pending');

              return (
                <TouchableOpacity 
                  key={item.id} 
                  onPress={() => handleViewDetails(item.id)}
                  className={`p-4 flex-row ${index !== filteredHistory.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <View className="mr-4">
                    {/* We display a nice fallback video thumbnail icon since we do not store static frame previews natively */}
                    <View className="h-16 w-24 bg-slate-100 rounded border border-slate-200 items-center justify-center">
                      <Video size={20} color="#94a3b8" />
                    </View>
                  </View>

                  <View className="flex-1 justify-center space-y-1">
                    <Text className="text-sm font-semibold text-slate-900" numberOfLines={1}>{item.filename}</Text>
                    
                    <View className="flex-row items-center justify-between mt-1">
                      <View className={`px-2 py-0.5 rounded border ${
                        emotionText === 'Confident Engagement' ? 'bg-emerald-50 border-emerald-200' :
                        emotionText === 'Pending' ? 'bg-slate-50 border-slate-200' :
                        emotionText === 'High Stress' ? 'bg-amber-50 border-amber-200' :
                        'bg-indigo-50 border-indigo-200'
                      }`}>
                        <Text className={`text-[10px] font-semibold ${
                          emotionText === 'Confident Engagement' ? 'text-emerald-700' :
                          emotionText === 'Pending' ? 'text-slate-600' :
                          emotionText === 'High Stress' ? 'text-amber-700' :
                          'text-indigo-700'
                        }`}>{emotionText}</Text>
                      </View>
                      <Text className="text-xs font-mono font-semibold text-slate-900">{reliabilityPct}</Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-1.5">
                      <Text className="text-xs font-mono text-slate-500">{formatDate(item.uploaded_at)}</Text>
                      <View className="flex-row items-center">
                        {statusDisplay === 'Completed' ? (
                          <CheckCircle2 size={12} color="#047857" className="mr-1" />
                        ) : (
                          <Clock size={12} color="#334155" className="mr-1" />
                        )}
                        <Text className="text-xs font-semibold text-slate-600">{statusDisplay}</Text>
                      </View>
                    </View>

                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
