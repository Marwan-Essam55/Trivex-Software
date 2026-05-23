import { useState, useRef, useCallback, useEffect } from 'react';
import { UploadCloud, Video, BarChart3, Activity, CheckCircle2, Clock, PlayCircle, Loader2, AlertTriangle, X, FileVideo } from 'lucide-react';
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

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export function UserDashboardView() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [recentVideos, setRecentVideos] = useState<VideoRecord[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/videos/my`, { headers: authHeaders() });
        if (res.ok) {
          const data: VideoRecord[] = await res.json();
          setRecentVideos(data);
        }
      } catch {
      } finally {
        setLoadingVideos(false);
      }
    };
    fetchVideos();
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a video file (MP4, MOV, AVI).');
      return;
    }
    if (file.size > 2 * 1024 * 1024 * 1024) {
      setUploadError('File size exceeds the 2GB limit.');
      return;
    }
    setSelectedFile(file);
    setUploadError(null);
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploadState('uploading');
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/api/videos/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(err.detail || 'Upload failed');
      }

      const video: VideoRecord = await res.json();
      setUploadState('success');

      setTimeout(() => {
        navigate('/fusion-engine', { state: { video } });
      }, 800);

    } catch (err: any) {
      setUploadState('error');
      setUploadError(err.message || 'An unexpected error occurred.');
      setSelectedFile(null);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const resetUpload = () => {
    setUploadState('idle');
    setSelectedFile(null);
    setUploadError(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffHours < 48) {
      return `Yesterday, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const statusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PROCESSING': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'FAILED': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const totalVideos = recentVideos.length;
  const completedVideos = recentVideos.filter(v => v.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Workspace</h1>
        <p className="text-sm text-slate-500">Monitor your data processing and analytical workloads.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 flex items-center shadow-sm">
          <div className="p-3 rounded-md bg-slate-100 text-slate-700 mr-4 border border-slate-200">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Videos</p>
            <p className="text-2xl font-bold text-slate-900">{loadingVideos ? '—' : totalVideos}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6 flex items-center shadow-sm">
          <div className="p-3 rounded-md bg-slate-100 text-slate-700 mr-4 border border-slate-200">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed</p>
            <p className="text-2xl font-bold text-slate-900">{loadingVideos ? '—' : completedVideos}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6 flex items-center shadow-sm">
          <div className="p-3 rounded-md bg-emerald-50 text-emerald-700 mr-4 border border-emerald-100">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Engine Status</p>
            <p className="text-2xl font-bold text-slate-900">Operational</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-8 sm:p-12 mb-8 flex flex-col items-center justify-center text-center shadow-sm">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleInputChange}
          id="video-file-input"
        />

        {uploadState === 'idle' && (
          <>
            <div
              className={`w-full max-w-3xl border-2 border-dashed rounded-lg p-10 transition-all duration-200 cursor-pointer group flex flex-col items-center ${
                dragOver
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400'
              }`}
              onClick={handleBrowseClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              id="dropzone"
            >
              <div className="w-16 h-16 bg-white border border-slate-200 group-hover:border-slate-300 rounded-lg flex items-center justify-center mb-5 shadow-sm transition-colors">
                <UploadCloud className={`w-8 h-8 transition-colors ${dragOver ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-700'}`} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Ingest Media File</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                Drag and drop your asset here, or click to browse. Supported formats: MP4, MOV, AVI. Maximum size: 2GB.
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleBrowseClick(); }}
                className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                id="btn-browse-files"
              >
                Browse Files
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <span className="text-xs font-medium uppercase text-slate-400 mx-4 tracking-wider">or capture live</span>
            </div>

            <button className="mt-4 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
              <PlayCircle className="w-4 h-4 mr-2" />
              Initialize Stream
            </button>
          </>
        )}

        {uploadState === 'uploading' && (
          <div className="w-full max-w-3xl py-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center mb-5">
              <Loader2 className="w-8 h-8 text-slate-700 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Uploading to Cloud…</h3>
            <p className="text-sm text-slate-500 mb-4">
              {selectedFile?.name && (
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200">
                  {selectedFile.name}
                </span>
              )}
            </p>
            <div className="w-full max-w-md">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-slate-900 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {selectedFile && `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`} · This may take a moment for large files…
              </p>
            </div>
          </div>
        )}

        {uploadState === 'success' && (
          <div className="w-full max-w-3xl py-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Complete</h3>
            <p className="text-sm text-slate-500">Redirecting to Analysis Engine…</p>
          </div>
        )}

        {uploadState === 'error' && (
          <div className="w-full max-w-3xl py-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center mb-5">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Failed</h3>
            <p className="text-sm text-red-600 mb-4">{uploadError}</p>
            <button
              onClick={resetUpload}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Recent Ingestions</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {loadingVideos ? (
            <div className="px-6 py-8 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin mr-2" />
              <span className="text-sm text-slate-500">Loading…</span>
            </div>
          ) : recentVideos.length === 0 ? (
            <div className="px-6 py-8 flex flex-col items-center text-center">
              <FileVideo className="w-6 h-6 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">No videos uploaded yet. Upload your first file above.</p>
            </div>
          ) : (
            recentVideos.slice(0, 5).map((video) => (
              <div
                key={video.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => navigate('/fusion-engine', { state: { video } })}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-md bg-white border border-slate-200 shadow-sm flex items-center justify-center mr-4 group-hover:border-slate-300 transition-colors">
                    <Video className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {video.original_filename || `Video ${video.id.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(video.uploaded_at)}
                      {video.file_size_mb && ` · ${video.file_size_mb} MB`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-semibold tracking-wide ${statusStyle(video.status)}`}>
                    {video.status === 'COMPLETED' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <Clock className="w-3.5 h-3.5 mr-1" />}
                    {video.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
