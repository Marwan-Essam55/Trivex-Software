import { UploadCloud, Video, BarChart3, Activity, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function UserDashboardView() {
  const navigate = useNavigate();
  const recentFiles = [
    { id: 1, name: 'clinical_interview_042.mp4', date: 'Today, 10:45 AM', status: 'Completed', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 2, name: 'focus_group_session_b.mov', date: 'Today, 09:12 AM', status: 'Processing', statusColor: 'bg-slate-100 text-slate-700 border-slate-200' },
    { id: 3, name: 'usability_test_v3.mp4', date: 'Yesterday, 04:30 PM', status: 'Completed', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ];

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
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Files Processed</p>
            <p className="text-2xl font-bold text-slate-900">1,284</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6 flex items-center shadow-sm">
          <div className="p-3 rounded-md bg-slate-100 text-slate-700 mr-4 border border-slate-200">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Confidence</p>
            <p className="text-2xl font-bold text-slate-900">94.2%</p>
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
        <div 
          className="w-full max-w-3xl border-2 border-dashed border-slate-300 rounded-lg p-10 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 cursor-pointer group flex flex-col items-center"
          onClick={() => navigate('/fusion-engine')}
        >
          <div className="w-16 h-16 bg-white border border-slate-200 group-hover:border-slate-300 rounded-lg flex items-center justify-center mb-5 shadow-sm transition-colors">
            <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Ingest Media File</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Drag and drop your asset here, or click to browse. Supported formats: MP4, MOV, AVI. Maximum size: 2GB.
          </p>
          <button className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
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
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Recent Ingestions</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {recentFiles.map((file) => (
            <div key={file.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => navigate('/fusion-engine')}>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-md bg-white border border-slate-200 shadow-sm flex items-center justify-center mr-4 group-hover:border-slate-300 transition-colors">
                  <Video className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{file.date}</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-semibold tracking-wide ${file.statusColor}`}>
                  {file.status === 'Completed' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <Clock className="w-3.5 h-3.5 mr-1" />}
                  {file.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
