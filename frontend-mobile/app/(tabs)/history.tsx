import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, CheckCircle2, Clock, Filter, Video, AlertTriangle, Brain } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../../services/api';

const POLL_INTERVAL_MS = 4000;

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoItem {
  id: string;
  original_filename: string | null;
  file_size_mb: number | null;
  duration_seconds: number | null;
  status: string;
  uploaded_at: string;
  analysis_results: any | null;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <View className="p-4 border-b border-slate-100 flex-row">
      <View className="h-16 w-24 bg-slate-200 rounded mr-4" style={{ opacity: 0.6 }} />
      <View className="flex-1 justify-center space-y-2">
        <View className="h-3 bg-slate-200 rounded w-3/4" style={{ opacity: 0.6 }} />
        <View className="h-2.5 bg-slate-200 rounded w-1/2" style={{ opacity: 0.4 }} />
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HistoryView() {
  const router = useRouter();
  const [historyData, setHistoryData] = useState<VideoItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchHistory = useCallback(async (isRefresh = false): Promise<VideoItem[]> => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const data: VideoItem[] = await apiFetch('/api/videos/my');
      setHistoryData(data);
      return data;
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Failed to load analysis archive.';
      setError(msg);
      if (!isRefresh) Alert.alert('Error', msg);
      return [];
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Start/stop polling based on whether any video is still in progress
  const managePolling = useCallback((data: VideoItem[]) => {
    const needsPoll = data.some(
      v => v.status.toUpperCase() === 'PENDING' || v.status.toUpperCase() === 'PROCESSING'
    );
    if (needsPoll && !pollRef.current) {
      pollRef.current = setInterval(async () => {
        const fresh = await fetchHistory(true);
        const stillPending = fresh.some(
          v => v.status.toUpperCase() === 'PENDING' || v.status.toUpperCase() === 'PROCESSING'
        );
        if (!stillPending && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }, POLL_INTERVAL_MS);
    } else if (!needsPoll && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [fetchHistory]);

  useEffect(() => {
    (async () => {
      const data = await fetchHistory();
      managePolling(data);
    })();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchHistory, managePolling]);

  useEffect(() => {
    managePolling(historyData);
  }, [historyData, managePolling]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory(true);
  };

  const handleViewReport = (item: VideoItem) => {
    if (item.status.toUpperCase() !== 'COMPLETED') return;
    router.push({ pathname: '/(tabs)/fusion', params: { video: JSON.stringify(item) } });
  };

  const filteredHistory = historyData.filter(item =>
    (item.original_filename || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Pending';
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Pending';
    }
  };

  const pendingCount = historyData.filter(
    v => v.status.toUpperCase() === 'PENDING' || v.status.toUpperCase() === 'PROCESSING'
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0f172a']} />
        }
      >

        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-slate-900 tracking-tight">Analysis Archive</Text>
          <Text className="text-sm text-slate-500 mt-1">Review historical multi-modal assessments.</Text>
        </View>

        {/* Search */}
        <View className="flex-row items-center space-x-3 mb-5">
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
            <Filter size={16} color="#334155" />
            <Text className="text-slate-700 text-sm font-semibold ml-2">Filter</Text>
          </TouchableOpacity>
        </View>

        {/* AI Analysing Banner */}
        {pendingCount > 0 && (
          <View className="mb-5 flex-row items-center gap-3 px-4 py-3.5 rounded-xl border border-violet-200 bg-violet-50">
            <View className="w-8 h-8 rounded-full bg-violet-100 items-center justify-center">
              <Brain size={16} color="#7c3aed" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-violet-800">AI is analysing your data…</Text>
              <Text className="text-xs text-violet-500 mt-0.5">
                {pendingCount} session{pendingCount > 1 ? 's' : ''} in pipeline · auto-refreshing
              </Text>
            </View>
            <ActivityIndicator size="small" color="#7c3aed" />
          </View>
        )}

        {/* Content */}
        {loading ? (
          <View className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </View>
        ) : error ? (
          <View className="bg-white p-8 rounded-lg border border-slate-200 items-center justify-center shadow-sm">
            <AlertTriangle size={24} color="#ef4444" />
            <Text className="text-slate-700 text-sm font-semibold text-center mt-3">{error}</Text>
            <TouchableOpacity onPress={() => fetchHistory()} className="mt-4 px-4 py-2 bg-slate-900 rounded-md">
              <Text className="text-white text-xs font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredHistory.length === 0 ? (
          <View className="bg-white p-8 rounded-lg border border-slate-200 items-center justify-center shadow-sm py-16">
            <Video size={36} color="#94a3b8" />
            <Text className="text-slate-700 text-sm font-semibold text-center mt-3">No ingestions found</Text>
            <Text className="text-slate-400 text-xs text-center mt-1">Upload a video or audio file to start.</Text>
          </View>
        ) : (
          <View className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            {filteredHistory.map((item, index) => {
              const statusUp = (item.status || 'PENDING').toUpperCase();
              const isCompleted  = statusUp === 'COMPLETED';
              const isProcessing = statusUp === 'PROCESSING' || statusUp === 'PENDING';
              const statusLabel  = statusUp.charAt(0) + statusUp.slice(1).toLowerCase();

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleViewReport(item)}
                  disabled={!isCompleted}
                  activeOpacity={isCompleted ? 0.7 : 1}
                  className={`p-4 flex-row ${index !== filteredHistory.length - 1 ? 'border-b border-slate-100' : ''} ${isProcessing ? 'bg-violet-50/50' : ''}`}
                >
                  {/* Thumbnail placeholder */}
                  <View className="mr-4">
                    <View className="h-16 w-24 bg-slate-100 rounded border border-slate-200 items-center justify-center">
                      {isProcessing ? (
                        <Brain size={20} color="#7c3aed" />
                      ) : (
                        <Video size={20} color="#94a3b8" />
                      )}
                    </View>
                  </View>

                  <View className="flex-1 justify-center">
                    <Text className="text-sm font-semibold text-slate-900" numberOfLines={1}>
                      {item.original_filename || 'Untitled Ingestion'}
                    </Text>

                    {/* Dominant emotion on completed items */}
                    {isCompleted && item.analysis_results?.dominant_emotion && (
                      <Text className="text-xs text-indigo-500 font-semibold mt-0.5 capitalize">
                        {item.analysis_results.dominant_emotion} ·{' '}
                        {Math.round((item.analysis_results.reliability_score ?? 0) * 100)}% reliable
                      </Text>
                    )}

                    {isProcessing && (
                      <Text className="text-xs text-violet-600 font-semibold mt-0.5">AI analysing…</Text>
                    )}

                    <View className="flex-row items-center justify-between mt-2">
                      <Text className="text-xs font-mono text-slate-500">{formatDate(item.uploaded_at)}</Text>

                      <View className="flex-row items-center">
                        {isCompleted ? (
                          <CheckCircle2 size={12} color="#047857" />
                        ) : isProcessing ? (
                          <ActivityIndicator size="small" color="#7c3aed" style={{ transform: [{ scale: 0.7 }] }} />
                        ) : (
                          <Clock size={12} color="#334155" />
                        )}
                        <Text className={`text-xs font-semibold ml-1 ${isCompleted ? 'text-emerald-700' : isProcessing ? 'text-violet-700' : 'text-slate-600'}`}>
                          {statusLabel}
                        </Text>
                      </View>
                    </View>

                    {/* View Report CTA for completed */}
                    {isCompleted && (
                      <View className="mt-2 self-start bg-slate-900 px-3 py-1 rounded-md">
                        <Text className="text-white text-xs font-bold">View Report →</Text>
                      </View>
                    )}
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
