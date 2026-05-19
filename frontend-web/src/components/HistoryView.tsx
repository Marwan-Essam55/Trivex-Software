import { Search, CheckCircle2, Clock, Filter, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HistoryView() {
  const navigate = useNavigate();
  const historyData = [
    { id: '1', name: 'clinical_interview_042.mp4', date: '2026-04-19', emotion: 'Confident Engagement', score: '88%', status: 'Completed', thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=100' },
    { id: '2', name: 'focus_group_session_b.mov', date: '2026-04-19', emotion: 'Pending', score: '-', status: 'Processing', thumbnail: '' },
    { id: '3', name: 'usability_test_v3.mp4', date: '2026-04-18', emotion: 'Neutral Baseline', score: '92%', status: 'Completed', thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=150&h=100' },
    { id: '4', name: 'customer_feedback_01.avi', date: '2026-04-17', emotion: 'High Stress', score: '85%', status: 'Completed', thumbnail: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=150&h=100' },
    { id: '5', name: 'employee_onboarding.mp4', date: '2026-04-15', emotion: 'Active Listening', score: '94%', status: 'Completed', thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=150&h=100' },
  ];

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
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 w-full sm:w-64 transition-colors shadow-sm"
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
            <Filter className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Subject Media
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Asset Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Primary State
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Reliability
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
              {historyData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" className="h-10 w-16 object-cover rounded shadow-sm border border-slate-200 grayscale contrast-125 opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="h-10 w-16 bg-slate-100 rounded border border-slate-200 flex items-center justify-center">
                        <Video className="h-4 w-4 text-slate-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded border tracking-wide ${
                      item.emotion === 'Confident Engagement' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      item.emotion === 'Pending' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                      item.emotion === 'High Stress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {item.emotion}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-mono font-semibold">
                    {item.score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold tracking-wide ${
                      item.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {item.status === 'Completed' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => navigate('/fusion-engine')}
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
      </div>
    </div>
  );
}
