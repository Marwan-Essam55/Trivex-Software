import { Download, MessageSquare, Pause, Play, SkipBack, SkipForward, Volume2, Maximize, ArrowLeft, Clock, FileVideo } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';

interface VideoData {
  id: string;
  file_path: string;
  original_filename: string | null;
  file_size_mb: number | null;
  duration_seconds: number | null;
  status: string;
  uploaded_at: string;
}

export function FusionEngineView() {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const video: VideoData | undefined = location.state?.video;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const statusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return { text: 'Analysis Complete', cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
      case 'PROCESSING':
        return { text: 'Processing', cls: 'border-slate-200 bg-slate-50 text-slate-700' };
      case 'FAILED':
        return { text: 'Failed', cls: 'border-red-200 bg-red-50 text-red-600' };
      default:
        return { text: 'Pending Analysis', cls: 'border-amber-200 bg-amber-50 text-amber-700' };
    }
  };

  const badge = statusBadge(video?.status || 'PENDING');
  const filename = video?.original_filename || 'Unknown file';

  if (!video) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center mb-5">
            <FileVideo className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Video Selected</h2>
          <p className="text-sm text-slate-500 max-w-md mb-6">
            Upload a video from your workspace to view the analysis engine output.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
      
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
            <p className="text-sm text-slate-500 mt-1 font-mono text-xs">ID: {filename}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-md border text-xs font-semibold uppercase tracking-wider ${badge.cls}`}>
          {badge.text}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          
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
                    <div className="w-16 h-1 bg-slate-700 rounded-full"><div className="w-2/3 h-full bg-slate-300 rounded-full"></div></div>
                  </div>
                  {video.duration_seconds && (
                    <span className="text-xs font-mono ml-4">
                      {Math.floor(video.duration_seconds / 60)}:{String(video.duration_seconds % 60).padStart(2, '0')}
                    </span>
                  )}
                </div>
                <button className="hover:text-white transition-colors"><Maximize className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">File</p>
              <p className="text-sm font-semibold text-slate-900 truncate" title={filename}>{filename}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Size</p>
              <p className="text-sm font-semibold text-slate-900">
                {video.file_size_mb ? `${video.file_size_mb} MB` : '—'}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Duration</p>
              <p className="text-sm font-semibold text-slate-900">
                {video.duration_seconds
                  ? `${Math.floor(video.duration_seconds / 60)}:${String(video.duration_seconds % 60).padStart(2, '0')}`
                  : '—'}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</p>
              <p className="text-sm font-semibold text-slate-900">{video.status}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Temporal State Heatmap</h3>
            <div className="h-4 w-full rounded-md overflow-hidden flex border border-slate-200">
              {video.status === 'COMPLETED' ? (
                <>
                  <div className="h-full bg-emerald-500 w-1/4" title="Positive Engagement"></div>
                  <div className="h-full bg-slate-400 w-1/3" title="Neutral Baseline"></div>
                  <div className="h-full bg-amber-500 w-1/6" title="Stress Indicator"></div>
                  <div className="h-full bg-slate-400 w-1/4" title="Neutral Baseline"></div>
                </>
              ) : (
                <div className="h-full bg-slate-200 w-full flex items-center justify-center">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Awaiting Analysis</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
                <span className="w-2 h-2 rounded-sm bg-slate-400 mr-2"></span>
                Acoustic Analysis
              </h3>
              <div className="h-24 flex items-end justify-center space-x-1">
                {[...Array(24)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-slate-200 rounded-t-sm" 
                    style={{ height: `${Math.max(10, Math.random() * 100)}%`, opacity: i === 9 ? 1 : 0.7, backgroundColor: i === 9 ? '#0f172a' : '' }}
                  ></div>
                ))}
              </div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
                <span className="w-2 h-2 rounded-sm bg-slate-900 mr-2"></span>
                Kinematic Skeleton
              </h3>
              <div className="h-24 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                <div className="text-slate-500 font-mono text-xs uppercase font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {video.status === 'COMPLETED' ? 'State: Open' : 'Awaiting Processing'}
                </div>
              </div>
            </div>
          </div>
          
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 h-full flex flex-col shadow-sm">
            
            <div className="mb-8 text-center border-b border-slate-100 pb-6">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Primary Assessment</h2>
              <p className="text-2xl font-bold text-slate-900 leading-tight">
                {video.status === 'COMPLETED' ? 'Confident Engagement' : 'Pending Analysis'}
              </p>
            </div>

            <div className="flex justify-center mb-8 relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle
                  cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray={352}
                  strokeDashoffset={video.status === 'COMPLETED' ? 352 - (352 * 88) / 100 : 352}
                  className="text-slate-900 transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                  {video.status === 'COMPLETED' ? <>88<span className="text-lg">%</span></> : '—'}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">Reliability</span>
              </div>
            </div>

            <div className="mb-8 flex-1">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Synthesized Report</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {video.status === 'COMPLETED'
                  ? 'The subject displays an open kinematic posture and consistent visual fixation, correlating strongly with confidence. Acoustic analysis confirms a stable frequency with positive inflections. A brief stress indicator was detected at 02:15, accompanied by micro-expressions of hesitation, but the baseline state remains highly positive and engaged.'
                  : 'Your video has been staged for analysis. Once the AI processing pipeline completes, a synthesized behavioral report will appear here with detailed insights into facial micro-expressions, vocal intonation, and kinematic posture.'}
              </p>
            </div>

            <div className="space-y-3 mt-auto pt-6 border-t border-slate-100">
              <button className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900">
                <Download className="w-4 h-4 mr-2" />
                Export Data (.CSV)
              </button>
              <button className="w-full flex items-center justify-center py-2.5 px-4 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900">
                <MessageSquare className="w-4 h-4 mr-2" />
                Flag False Positive
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
