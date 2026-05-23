import { useState, useEffect } from 'react';
import { Search, CheckCircle2, Clock, AlertTriangle, Video, Loader2, FileVideo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';

interface VideoRecord {
  id: string;
  file_path: string;
  original_filename: string | null;
  file_size_mb: number | null;
  duration_seconds: number | null;
  status: string;
  uploaded_at: string;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function HistoryView() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/videos/my`, { headers: authHeaders() });
        if (res.ok) {
          const data: VideoRecord[] = await res.json();
          setVideos(data);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const statusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PROCESSING': return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'FAILED': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const filteredVideos = videos.filter(v => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (v.original_filename || '').toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analysis Archive</h1>
          <p className="text-sm text-slate-500 mt-1">Review historical multi-modal assessments and metrics.</p>
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
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 w-full sm:w-64 transition-colors shadow-sm"
              id="search-history"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin mr-2" />
            <span className="text-sm text-slate-500">Loading history…</span>
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Preview
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Asset Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredVideos.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
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
                      <div className="text-sm font-semibold text-slate-900">
                        {item.original_filename || `Video ${item.id.slice(0, 8)}`}
                      </div>
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
                        {item.status.toUpperCase() === 'COMPLETED'
                          ? <CheckCircle2 className="w-3 h-3 mr-1" />
                          : item.status.toUpperCase() === 'FAILED'
                            ? <AlertTriangle className="w-3 h-3 mr-1" />
                            : <Clock className="w-3 h-3 mr-1" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate('/fusion-engine', { state: { video: item } })}
                        className="text-slate-700 hover:text-white transition-colors bg-white border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-900 hover:border-slate-900 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
