import React, { useMemo } from 'react';
import { useColorScheme } from 'nativewind';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Download, MessageSquare, ArrowLeft, Brain, Zap, Clock,
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { API_BASE } from '../../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmotionBreakdown {
  happy: number;
  neutral: number;
  confident: number;
  anxious: number;
  stressed: number;
  engaged: number;
}

interface ExpertaConclusion {
  rule: string;
  conclusion: string;
  confidence: number;
}

interface TimelineSegment {
  start_sec: number;
  end_sec: number;
  emotion: string;
  intensity: number;
}

interface AcousticProfile {
  tone_label: string;
  pitch_hz: number;
  cadence_wpm: number;
  tone_clarity: number;
  waveform: number[];
}

interface AnalysisResults {
  dominant_emotion: string | null;
  confidence_score: number | null;
  reliability_score: number | null;
  nlp_summary: string | null;
  emotion_breakdown: EmotionBreakdown | null;
  experta_conclusions: ExpertaConclusion[] | null;
  acoustic_profile: AcousticProfile | null;
  kinematic_state: string | null;
  timeline_segments: TimelineSegment[] | null;
}

interface VideoData {
  id: string;
  file_path: string;
  original_filename: string | null;
  file_size_mb: number | null;
  duration_seconds: number | null;
  status: string;
  uploaded_at: string;
  analysis_results: AnalysisResults | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMOTION_COLORS: Record<string, string> = {
  happy:     '#22c55e',
  confident: '#0f172a',
  engaged:   '#6366f1',
  neutral:   '#94a3b8',
  anxious:   '#f59e0b',
  stressed:  '#ef4444',
};

const SEGMENT_COLORS: Record<string, string> = {
  happy:     '#22c55e',
  confident: '#0f172a',
  engaged:   '#6366f1',
  neutral:   '#94a3b8',
  anxious:   '#f59e0b',
  stressed:  '#ef4444',
};

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function fmtTime(sec: number) {
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Circular reliability gauge (pure RN, no SVG) */
function ReliabilityGauge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  return (
    <View className="items-center justify-center mb-8">
      <View
        className="items-center justify-center w-32 h-32 rounded-full"
        style={{
          borderWidth: 8,
          borderColor: '#f1f5f9',
        }}
      >
        {/* Simulated arc via rotation overlay */}
        <View
          className="absolute w-32 h-32 rounded-full"
          style={{
            borderWidth: 8,
            borderColor: '#0f172a',
            borderRightColor: 'transparent',
            borderBottomColor: pct > 50 ? '#0f172a' : 'transparent',
            transform: [{ rotate: `${(pct / 100) * 360}deg` }],
          }}
        />
        <Text className="text-3xl font-bold text-slate-900 dark:text-white">{pct}%</Text>
        <Text className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">
          Reliability
        </Text>
      </View>
    </View>
  );
}

/** Emotion breakdown bar chart */
function EmotionBreakdownChart({ breakdown }: { breakdown: EmotionBreakdown }) {
  const entries = Object.entries(breakdown).sort(([, a], [, b]) => b - a);
  return (
    <View className="space-y-3">
      {entries.map(([emotion, value]) => (
        <View key={emotion}>
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-xs font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500 capitalize">{emotion}</Text>
            <Text className="text-xs font-mono text-slate-500 dark:text-slate-400 dark:text-slate-500">{Math.round(value * 100)}%</Text>
          </View>
          <View className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${Math.round(value * 100)}%`,
                backgroundColor: EMOTION_COLORS[emotion] ?? '#94a3b8',
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Timeline heatmap from real segments */
function TimelineHeatmap({ segments, duration }: { segments: TimelineSegment[]; duration: number }) {
  return (
    <View className="mt-5">
      <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
        Temporal State Heatmap
      </Text>
      <View className="h-4 w-full rounded-md overflow-hidden flex-row border border-slate-200 dark:border-slate-800">
        {segments.map((seg, i) => {
          const flex = (seg.end_sec - seg.start_sec) / duration;
          return (
            <View
              key={i}
              style={{
                flex,
                height: '100%',
                backgroundColor: SEGMENT_COLORS[seg.emotion] ?? '#94a3b8',
                opacity: 0.5 + seg.intensity * 0.5,
              }}
            />
          );
        })}
      </View>
      <View className="flex-row justify-between mt-1">
        <Text className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{fmtTime(0)}</Text>
        <Text className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{fmtTime(duration / 2)}</Text>
        <Text className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{fmtTime(duration)}</Text>
      </View>
    </View>
  );
}

/** Acoustic waveform from 24-point array */
function AcousticWaveform({ profile }: { profile: AcousticProfile }) {
  const bars = profile.waveform ?? Array(12).fill(0.5);
  const visible = bars.slice(0, 16); // show 16 bars on mobile
  return (
    <View className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
      <View className="flex-row items-center mb-1">
        <View className="w-2 h-2 rounded-sm bg-slate-400 mr-2" />
        <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Acoustic Analysis
        </Text>
      </View>
      <Text className="text-[11px] text-slate-400 dark:text-slate-500 mb-3">
        {profile.tone_label} · {profile.cadence_wpm} WPM · {Math.round(profile.tone_clarity * 100)}% clarity
      </Text>
      <View className="h-20 flex-row items-end justify-between">
        {visible.map((amp, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              marginHorizontal: 1,
              height: `${Math.max(8, amp * 100)}%`,
              backgroundColor: amp > 0.7 ? '#0f172a' : '#e2e8f0',
              borderRadius: 2,
            }}
          />
        ))}
      </View>
    </View>
  );
}

/** Experta rule conclusions */
function ExpertaPanel({ conclusions }: { conclusions: ExpertaConclusion[] }) {
  return (
    <View>
      {conclusions.map((c, i) => (
        <View key={i} className="flex-row gap-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg" style={{ marginBottom: i < conclusions.length - 1 ? 12 : 0 }}>
          <Zap size={14} color="#6366f1" style={{ marginTop: 2, flexShrink: 0 }} />
          <View className="flex-1">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-0.5">
              {c.rule}
            </Text>
            <Text className="text-xs text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-relaxed">{c.conclusion}</Text>
            <Text className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
              confidence: {Math.round(c.confidence * 100)}%
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** Pending / processing state */
function PendingState({ status }: { status: string }) {
  const isProcessing = status.toUpperCase() === 'PROCESSING';
  return (
    <View className="py-20 items-center justify-center px-8">
      <View className="w-16 h-16 rounded-full bg-violet-100 items-center justify-center mb-5">
        <Brain size={28} color="#7c3aed" />
      </View>
      <Text className="text-base font-bold text-slate-900 dark:text-white text-center">
        {isProcessing ? 'AI is analysing your data…' : 'Queued for Analysis'}
      </Text>
      <Text className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2 text-center leading-relaxed">
        {isProcessing
          ? 'The neural network and Experta engine are processing this session. Go back to the archive to see when it completes.'
          : 'Your video is in the queue and will be processed shortly.'}
      </Text>
      {isProcessing && (
        <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 20 }} />
      )}
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FusionEngineView() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const router = useRouter();
  const params = useLocalSearchParams<{ video?: string }>();

  const video = useMemo<VideoData | null>(() => {
    if (!params.video) return null;
    try {
      return JSON.parse(params.video) as VideoData;
    } catch {
      return null;
    }
  }, [params.video]);

  if (!video) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-800 items-center justify-center px-8" edges={['top']}>
        <View className="w-16 h-16 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg items-center justify-center mb-5">
          <Brain size={28} color="#94a3b8" />
        </View>
        <Text className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">No Session Selected</Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 text-center mb-6">
          Open a completed session from your Analysis Archive to view the full report.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center px-5 py-2.5 bg-slate-900 rounded-lg"
        >
          <ArrowLeft size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text className="text-white text-sm font-semibold">Back to Archive</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const ar = video.analysis_results;
  const isCompleted  = video.status.toUpperCase() === 'COMPLETED';
  const isProcessing = video.status.toUpperCase() === 'PROCESSING';
  const duration     = video.duration_seconds ?? 120;
  const filename     = video.original_filename || 'Untitled Session';

  const badgeStyle = () => {
    switch (video.status.toUpperCase()) {
      case 'COMPLETED':  return { text: 'Analysis Complete', bg: '#ecfdf5', border: '#6ee7b7', color: '#065f46' };
      case 'PROCESSING': return { text: 'Processing',        bg: '#ede9fe', border: '#c4b5fd', color: '#5b21b6' };
      case 'FAILED':     return { text: 'Failed',            bg: '#fef2f2', border: '#fca5a5', color: '#991b1b' };
      default:           return { text: 'Pending',           bg: '#fffbeb', border: '#fcd34d', color: '#92400e' };
    }
  };
  const badge = badgeStyle();

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-800" edges={['top']}>
      <ScrollView
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: 60 }}
      >

        {/* Header */}
        <View className="mb-5 flex-row items-start justify-between gap-3">
          <View className="flex-row items-center gap-3 flex-1">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
            >
              <ArrowLeft size={16} color="#475569" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Analysis Engine Output</Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5 font-mono" numberOfLines={1}>{filename}</Text>
            </View>
          </View>
          <View
            className="self-start px-3 py-1 rounded-md border"
            style={{ backgroundColor: badge.bg, borderColor: badge.border }}
          >
            <Text className="text-xs font-semibold uppercase tracking-wider" style={{ color: badge.color }}>
              {badge.text}
            </Text>
          </View>
        </View>

        {/* Pending / Processing state */}
        {!isCompleted && <PendingState status={video.status} />}

        {/* Full report — COMPLETED only */}
        {isCompleted && ar && (
          <View className="space-y-6">

            {/* Video player */}
            <View className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800 relative w-full mb-2" style={{ aspectRatio: 16/9 }}>
              <Video
                source={{ uri: video.file_path.startsWith('http') ? video.file_path : `${API_BASE}${video.file_path.startsWith('/') ? '' : '/'}${video.file_path}` }}
                style={{ flex: 1 }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
              />
            </View>

            {/* Meta cards */}
            <View className="flex-row flex-wrap gap-3">
              {[
                { label: 'File',     value: filename },
                { label: 'Size',     value: video.file_size_mb ? `${video.file_size_mb} MB` : '—' },
                { label: 'Duration', value: video.duration_seconds ? fmtTime(video.duration_seconds) : '—' },
                { label: 'Posture',  value: ar.kinematic_state ?? '—' },
              ].map(({ label, value }) => (
                <View key={label} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3 shadow-sm" style={{ minWidth: '45%', flex: 1 }}>
                  <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{label}</Text>
                  <Text className="text-sm font-semibold text-slate-900 dark:text-white" numberOfLines={1}>{value}</Text>
                </View>
              ))}
            </View>

            {/* Timeline heatmap */}
            {ar.timeline_segments && ar.timeline_segments.length > 0 && (
              <TimelineHeatmap segments={ar.timeline_segments} duration={duration} />
            )}

            {/* Acoustic waveform */}
            {ar.acoustic_profile && (
              <View className="mt-5">
                <AcousticWaveform profile={ar.acoustic_profile} />
              </View>
            )}

            {/* Kinematic state card removed */}

            {/* Emotion breakdown */}
            {ar.emotion_breakdown && (
              <View className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm mt-5">
                <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                  Emotion Probability Distribution
                </Text>
                <EmotionBreakdownChart breakdown={ar.emotion_breakdown} />
              </View>
            )}

            {/* Experta conclusions */}
            {ar.experta_conclusions && ar.experta_conclusions.length > 0 && (
              <View className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm mt-5">
                <View className="flex-row items-center gap-1.5 mb-4">
                  <Brain size={14} color="#6366f1" />
                  <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Experta Rule Engine — Conclusions
                  </Text>
                </View>
                <ExpertaPanel conclusions={ar.experta_conclusions} />
              </View>
            )}

            {/* Primary assessment card */}
            <View className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm mt-5">
              <View className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-6 items-center">
                <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Primary Assessment
                </Text>
                <Text className="text-2xl font-bold text-slate-900 dark:text-white leading-tight text-center">
                  {ar.dominant_emotion ? capitalize(ar.dominant_emotion) : 'Completed'}
                </Text>
              </View>

              {ar.reliability_score != null && (
                <ReliabilityGauge score={ar.reliability_score} />
              )}

              <View className="mb-6">
                <Text className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Synthesized Report
                </Text>
                <Text className="text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-relaxed">
                  {ar.nlp_summary ?? 'No summary available.'}
                </Text>
              </View>

              {/* Action buttons */}
              <View className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <TouchableOpacity className="w-full flex-row items-center justify-center py-3 px-4 rounded-lg bg-slate-900">
                  <Download size={16} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text className="text-sm font-semibold text-white">Export Data (.CSV)</Text>
                </TouchableOpacity>
                <TouchableOpacity className="w-full flex-row items-center justify-center py-3 px-4 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 mt-3">
                  <MessageSquare size={16} color="#334155" style={{ marginRight: 8 }} />
                  <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">Flag False Positive</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
