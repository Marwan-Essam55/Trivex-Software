import {
  Download, MessageSquare, Pause, Play, SkipBack, SkipForward,
  Volume2, Maximize, ArrowLeft, Clock, FileVideo, Brain, Zap,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';

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
  happy:     'bg-emerald-500',
  confident: 'bg-slate-800',
  engaged:   'bg-indigo-500',
  neutral:   'bg-slate-400',
  anxious:   'bg-amber-500',
  stressed:  'bg-red-500',
};

function fmtTime(sec: number) {
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Circular reliability gauge */
function ReliabilityGauge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const circumference = 352;
  const offset = circumference - (circumference * pct) / 100;
  return (
    <div className="flex justify-center mb-8 relative">
      <svg className="w-32 h-32 transform -rotate-90">
        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
        <circle
          cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-slate-900 transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900 tracking-tight">
          {pct}<span className="text-lg">%</span>
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">Reliability</span>
      </div>
    </div>
  );
}

/** Emotion breakdown bar chart */
function EmotionBreakdownChart({ breakdown }: { breakdown: EmotionBreakdown }) {
  const entries = Object.entries(breakdown).sort(([, a], [, b]) => b - a);
  return (
    <div className="space-y-2.5">
      {entries.map(([emotion, value]) => (
        <div key={emotion}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-600 capitalize">{emotion}</span>
            <span className="text-xs font-mono text-slate-500">{Math.round(value * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.round(value * 100)}%`, backgroundColor: EMOTION_COLORS[emotion] ?? '#94a3b8' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Timeline heatmap from real segments */
function TimelineHeatmap({ segments, duration }: { segments: TimelineSegment[]; duration: number }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Temporal State Heatmap</h3>
      <div className="h-4 w-full rounded-md overflow-hidden flex border border-slate-200">
        {segments.map((seg, i) => {
          const width = ((seg.end_sec - seg.start_sec) / duration) * 100;
          const colorClass = SEGMENT_COLORS[seg.emotion] ?? 'bg-slate-400';
          return (
            <div
              key={i}
              className={`h-full ${colorClass} transition-all duration-300`}
              style={{ width: `${width}%`, opacity: 0.5 + seg.intensity * 0.5 }}
              title={`${capitalize(seg.emotion)} · ${fmtTime(seg.start_sec)}–${fmtTime(seg.end_sec)}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] font-mono text-slate-400">{fmtTime(0)}</span>
        <span className="text-[10px] font-mono text-slate-400">{fmtTime(duration / 2)}</span>
        <span className="text-[10px] font-mono text-slate-400">{fmtTime(duration)}</span>
      </div>
    </div>
  );
}

/** Acoustic waveform from real 24-point array */
function AcousticWaveform({ profile }: { profile: AcousticProfile }) {
  const waveform = profile.waveform ?? Array(24).fill(0.5);
  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
        <span className="w-2 h-2 rounded-sm bg-slate-400 mr-2" />
        Acoustic Analysis
      </h3>
      <p className="text-[11px] text-slate-400 mb-3">
        {profile.tone_label} · {profile.cadence_wpm} WPM · {Math.round(profile.tone_clarity * 100)}% clarity
      </p>
      <div className="h-24 flex items-end justify-center space-x-1">
        {waveform.map((amp, i) => (
          <div
            key={i}
            className="w-1.5 rounded-t-sm transition-all duration-300"
            style={{
              height: `${Math.max(8, amp * 100)}%`,
              backgroundColor: amp > 0.7 ? '#0f172a' : '#e2e8f0',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** Experta conclusions list */
function ExpertaPanel({ conclusions }: { conclusions: ExpertaConclusion[] }) {
  return (
    <div className="space-y-3">
      {conclusions.map((c, i) => (
        <div key={i} className="flex gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <Zap className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-0.5">{c.rule}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{c.conclusion}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">confidence: {Math.round(c.confidence * 100)}%</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Processing / pending overlay */
function PendingState({ status }: { status: string }) {
  const isProcessing = status.toUpperCase() === 'PROCESSING';
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-25" />
        <Brain className="relative w-8 h-8 text-violet-600 animate-pulse" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-slate-900">
          {isProcessing ? 'AI is analysing your behavioural data…' : 'Queued for Analysis'}
        </p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          {isProcessing
            ? 'The neural network and Experta engine are processing this session. This page will update automatically.'
            : 'Your video has been uploaded and is in the processing queue.'}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FusionEngineView() {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const video: VideoData | undefined = location.state?.video;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  if (!video) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center mb-5">
            <FileVideo className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Video Selected</h2>
          <p className="text-sm text-slate-500 max-w-md mb-6">
            Open a completed session from your Analysis Archive to view the full report.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Archive
          </button>
        </div>
      </div>
    );
  }

  const ar = video.analysis_results;
  const isCompleted = video.status.toUpperCase() === 'COMPLETED';
  const duration = video.duration_seconds ?? 120;

  const statusBadge = () => {
    switch (video.status.toUpperCase()) {
      case 'COMPLETED':  return { text: 'Analysis Complete',  cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
      case 'PROCESSING': return { text: 'Processing',         cls: 'border-violet-200 bg-violet-50 text-violet-700' };
      case 'FAILED':     return { text: 'Failed',             cls: 'border-red-200 bg-red-50 text-red-600' };
      default:           return { text: 'Pending Analysis',   cls: 'border-amber-200 bg-amber-50 text-amber-700' };
    }
  };
  const badge = statusBadge();
  const filename = video.original_filename || 'Unknown file';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analysis Engine Output</h1>
            <p className="text-sm text-slate-500 mt-1 font-mono text-xs truncate max-w-xs">{filename}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-md border text-xs font-semibold uppercase tracking-wider ${badge.cls}`}>
          {badge.text}
        </span>
      </div>

      {!isCompleted ? (
        <PendingState status={video.status} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ── Left / Centre column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Video player */}
            <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800 relative aspect-video flex flex-col group">
              <div className="flex-1 bg-slate-950 flex items-center justify-center relative">
                <video
                  ref={videoRef}
                  src={video.file_path}
                  className="absolute inset-0 w-full h-full object-contain"
                  onEnded={() => setIsPlaying(false)}
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center space-x-4">
                    <button className="hover:text-white transition-colors"><SkipBack className="w-4 h-4" /></button>
                    <button className="hover:text-white transition-colors" onClick={togglePlay}>
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <button className="hover:text-white transition-colors"><SkipForward className="w-4 h-4" /></button>
                    <div className="flex items-center space-x-2 ml-4">
                      <Volume2 className="w-4 h-4" />
                      <div className="w-16 h-1 bg-slate-700 rounded-full">
                        <div className="w-2/3 h-full bg-slate-300 rounded-full" />
                      </div>
                    </div>
                    {video.duration_seconds && (
                      <span className="text-xs font-mono ml-4">{fmtTime(video.duration_seconds)}</span>
                    )}
                  </div>
                  <button className="hover:text-white transition-colors"><Maximize className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            {/* Meta cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'File',      value: filename },
                { label: 'Size',      value: video.file_size_mb ? `${video.file_size_mb} MB` : '—' },
                { label: 'Duration',  value: video.duration_seconds ? fmtTime(video.duration_seconds) : '—' },
                { label: 'Status',    value: video.status },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-sm font-semibold text-slate-900 truncate" title={value}>{value}</p>
                </div>
              ))}
            </div>

            {/* Timeline heatmap */}
            {ar?.timeline_segments && ar.timeline_segments.length > 0 && (
              <TimelineHeatmap segments={ar.timeline_segments} duration={duration} />
            )}

            {/* Acoustic waveform + Kinematic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {ar?.acoustic_profile && <AcousticWaveform profile={ar.acoustic_profile} />}

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
                  <span className="w-2 h-2 rounded-sm bg-slate-900 mr-2" />
                  Kinematic Skeleton
                </h3>
                <div className="h-24 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                  <div className="text-slate-500 font-mono text-xs uppercase font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    State: {ar?.kinematic_state ?? 'Open'}
                  </div>
                </div>
              </div>
            </div>

            {/* Emotion breakdown bars */}
            {ar?.emotion_breakdown && (
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  Emotion Probability Distribution
                </h3>
                <EmotionBreakdownChart breakdown={ar.emotion_breakdown} />
              </div>
            )}

            {/* Experta conclusions */}
            {ar?.experta_conclusions && ar.experta_conclusions.length > 0 && (
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-indigo-500" />
                  Experta Rule Engine — Conclusions
                </h3>
                <ExpertaPanel conclusions={ar.experta_conclusions} />
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 h-full flex flex-col shadow-sm">

              <div className="mb-8 text-center border-b border-slate-100 pb-6">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Primary Assessment</h2>
                <p className="text-2xl font-bold text-slate-900 leading-tight capitalize">
                  {ar?.dominant_emotion ? `${capitalize(ar.dominant_emotion)} ${getLabel(ar.dominant_emotion)}` : 'Completed'}
                </p>
              </div>

              {ar?.reliability_score != null && (
                <ReliabilityGauge score={ar.reliability_score} />
              )}

              <div className="mb-8 flex-1">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Synthesized Report</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {ar?.nlp_summary ?? 'No summary available.'}
                </p>
              </div>

              <div className="space-y-3 mt-auto pt-6 border-t border-slate-100">
                <button
                  onClick={() => exportCSV(video)}
                  className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data (.CSV)
                </button>
                <button className="w-full flex items-center justify-center py-2.5 px-4 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Flag False Positive
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function getLabel(emotion: string): string {
  const map: Record<string, string> = {
    happy:     'Engagement',
    confident: 'Presence',
    engaged:   'Attentiveness',
    neutral:   'Baseline',
    anxious:   'Tension',
    stressed:  'Stress',
  };
  return map[emotion] ?? '';
}

function exportCSV(video: VideoData) {
  const ar = video.analysis_results;
  if (!ar) return;

  const rows: string[][] = [
    ['Field', 'Value'],
    ['Video ID', video.id],
    ['Filename', video.original_filename ?? ''],
    ['Status', video.status],
    ['Dominant Emotion', ar.dominant_emotion ?? ''],
    ['Confidence Score', String(ar.confidence_score ?? '')],
    ['Reliability Score', String(ar.reliability_score ?? '')],
    ['Kinematic State', ar.kinematic_state ?? ''],
    ['NLP Summary', `"${(ar.nlp_summary ?? '').replace(/"/g, '""')}"`],
    [],
    ['--- Emotion Breakdown ---'],
    ...Object.entries(ar.emotion_breakdown ?? {}).map(([k, v]) => [k, String(Math.round(v * 100)) + '%']),
    [],
    ['--- Experta Conclusions ---'],
    ...(ar.experta_conclusions ?? []).map(c => [c.rule, c.conclusion, Math.round(c.confidence * 100) + '%']),
    [],
    ['--- Timeline Segments ---'],
    ['Start (s)', 'End (s)', 'Emotion', 'Intensity'],
    ...(ar.timeline_segments ?? []).map(s => [String(s.start_sec), String(s.end_sec), s.emotion, String(s.intensity)]),
  ];

  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `trivex_report_${video.id.slice(0, 8)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
