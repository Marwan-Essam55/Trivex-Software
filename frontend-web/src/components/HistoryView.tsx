import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, CheckCircle2, Clock, AlertTriangle, Video, Loader2, FileVideo, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import API_BASE from '../config';
const POLL_INTERVAL_MS = 4000;

interface AnalysisResults {
  dominant_emotion: string | null;
  confidence_score: number | null;
  reliability_score: number | null;
  nlp_summary: string | null;
  emotion_breakdown: Record<string, number> | null;
  experta_conclusions: Array<{ rule: string; conclusion: string; confidence: number }> | null;
  acoustic_profile: Record<string, any> | null;
  kinematic_state: string | null;
  timeline_segments: Array<{ start_sec: number; end_sec: number; emotion: string; intensity: number }> | null;
}

interface VideoRecord {
  id: string;
  file_path: string;
  original_filename: string | null;
  file_size_mb: number | null;
  duration_seconds: number | null;
  status: string;
  uploaded_at: string;
  analysis_results: AnalysisResults | null;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  return { Authorization: `Bearer ${token}` };
}

function StatusIcon({ status }: { status: string }) {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />;
    case 'FAILED':
      return <AlertTriangle className="w-3 h-3 mr-1 text-red-500" />;
    case 'PROCESSING':
      return <Loader2 className="w-3 h-3 mr-1 text-violet-500 animate-spin" />;
    default:
      return <Clock className="w-3 h-3 mr-1 text-amber-500" />;
  }
}

function statusStyle(status: string) {
  switch (status.toUpperCase()) {
    case 'COMPLETED':  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PROCESSING': return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'FAILED':     return 'bg-red-50 text-red-600 border-red-200';
    default:           return 'bg-amber-50 text-amber-700 border-amber-200';
  }
}

/** Skeleton row for the table */
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-10 w-16 bg-slate-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-5 w-24 bg-slate-200 rounded-full" /></td>
      <td className="px-6 py-4"><div className="h-8 w-24 bg-slate-200 rounded-md ml-auto" /></td>
    </tr>
  );
}

/** Animated AI-analyzing banner shown inline on processing rows */
function ProcessingBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700">
      <Brain className="w-3.5 h-3.5 animate-pulse" />
      <span className="animate-pulse">AI analysing…</span>
    </span>
  );
}

export function HistoryView() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/videos/my`, { headers: authHeaders() });
      if (res.ok) {
        const data: VideoRecord[] = await res.json();
        setVideos(data);
        return data;
      }
    } catch {/* silent */}
    return [];
  }, []);

  // Start polling if any video is not yet COMPLETED/FAILED
  const startPolling = useCallback((data: VideoRecord[]) => {
    const needsPoll = data.some(
      v => v.status.toUpperCase() === 'PENDING' || v.status.toUpperCase() === 'PROCESSING'
    );

    if (needsPoll && !pollRef.current) {
      pollRef.current = setInterval(async () => {
        const fresh = await fetchVideos();
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
  }, [fetchVideos]);

  useEffect(() => {
    (async () => {
      const data = await fetchVideos();
      setLoading(false);
      startPolling(data);
    })();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchVideos, startPolling]);

  // Re-evaluate polling whenever video list updates
  useEffect(() => {
    startPolling(videos);
  }, [videos, startPolling]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });

  const filteredVideos = videos.filter(v => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (v.original_filename || '').toLowerCase().includes(q) || v.id.toLowerCase().includes(q);
  });

  const pendingCount = videos.filter(
    v => v.status.toUpperCase() === 'PENDING' || v.status.toUpperCase() === 'PROCESSING'
  ).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Analysis Archive</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review historical multi-modal assessments and metrics.</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search ID or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-teal-500 focus:border-slate-900 dark:focus:border-teal-500 w-full sm:w-64 transition-colors shadow-sm"
              id="search-history"
            />
          </div>
        </div>
      </div>

      {/* AI analysing banner */}
      {pendingCount > 0 && (
        <div className="mb-6 flex items-center gap-3 px-5 py-3.5 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 shadow-sm">
          <div className="relative flex h-8 w-8 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-30" />
            <Brain className="relative w-4 h-4 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-violet-800">
              AI is analysing your behavioural data…
            </p>
            <p className="text-xs text-violet-500 mt-0.5">
              {pendingCount} session{pendingCount > 1 ? 's' : ''} in the pipeline · polling every {POLL_INTERVAL_MS / 1000}s
            </p>
          </div>
          <Loader2 className="ml-auto w-4 h-4 text-violet-400 animate-spin" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 w-full transition-colors duration-200">
        {loading ? (
          <div className="overflow-x-auto w-full block rounded-lg">
            <table className="min-w-[900px] w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  {['Preview','Asset Name','Date','Size','Duration','Status',''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="px-6 py-16 flex flex-col items-center text-center">
            <FileVideo className="w-8 h-8 text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              {videos.length === 0 ? 'No videos yet' : 'No matching results'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {videos.length === 0
                ? 'Upload your first video from the workspace to get started.'
                : 'Try a different search query.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full block rounded-lg">
            <table className="min-w-[900px] w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preview</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Asset Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                {filteredVideos.map((item) => {
                  const isProcessing = item.status.toUpperCase() === 'PROCESSING' || item.status.toUpperCase() === 'PENDING';
                  const isCompleted  = item.status.toUpperCase() === 'COMPLETED';
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group ${isProcessing ? 'bg-violet-50/30 dark:bg-violet-900/10' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.file_path ? (
                          <video
                            src={item.file_path}
                            className="h-10 w-16 object-cover rounded shadow-sm border border-slate-200 opacity-80 group-hover:opacity-100 transition-opacity"
                            muted
                            preload="metadata"
                          />
                        ) : (
                          <div className="h-10 w-16 bg-slate-100 rounded border border-slate-200 flex items-center justify-center">
                            <Video className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {item.original_filename || `Video ${item.id.slice(0, 8)}`}
                        </div>
                        {isProcessing && (
                          <div className="mt-1"><ProcessingBadge /></div>
                        )}
                        {isCompleted && item.analysis_results?.dominant_emotion && (
                          <div className="text-xs text-slate-400 mt-0.5 capitalize">
                            {item.analysis_results.dominant_emotion} · {Math.round((item.analysis_results.reliability_score ?? 0) * 100)}% reliable
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">
                        {formatDate(item.uploaded_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {item.file_size_mb ? `${item.file_size_mb} MB` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">
                        {item.duration_seconds
                          ? `${Math.floor(item.duration_seconds / 60)}:${String(item.duration_seconds % 60).padStart(2, '0')}`
                          : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold tracking-wide ${statusStyle(item.status)}`}>
                          <StatusIcon status={item.status} />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isCompleted ? (
                          <button
                            onClick={() => navigate('/fusion-engine', { state: { video: item } })}
                            className="text-slate-700 hover:text-white transition-colors bg-white border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-900 hover:border-slate-900 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                          >
                            View Report
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic select-none">
                            {isProcessing ? 'Processing…' : 'Queued'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
