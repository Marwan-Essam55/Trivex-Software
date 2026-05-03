import { Download, MessageSquare, Pause, SkipBack, SkipForward, Volume2, Maximize } from 'lucide-react';

export function FusionEngineView() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analysis Engine Output</h1>
          <p className="text-sm text-slate-500 mt-1 font-mono text-xs">ID: clinical_interview_042.mp4</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-md border border-emerald-200 text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700">
          Analysis Complete
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800 relative aspect-video flex flex-col group">
            <div className="flex-1 bg-slate-950 flex items-center justify-center relative">
               <img 
                 src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200&h=675" 
                 alt="Video frame" 
                 className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale contrast-125"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-full h-1 bg-slate-700 rounded-full mb-4 cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-slate-300 rounded-full w-1/3"></div>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center space-x-4">
                  <button className="hover:text-white transition-colors"><SkipBack className="w-4 h-4" /></button>
                  <button className="hover:text-white transition-colors"><Pause className="w-5 h-5" /></button>
                  <button className="hover:text-white transition-colors"><SkipForward className="w-4 h-4" /></button>
                  <div className="flex items-center space-x-2 ml-4">
                    <Volume2 className="w-4 h-4" />
                    <div className="w-16 h-1 bg-slate-700 rounded-full"><div className="w-2/3 h-full bg-slate-300 rounded-full"></div></div>
                  </div>
                  <span className="text-xs font-mono ml-4">01:24 / 04:12</span>
                </div>
                <button className="hover:text-white transition-colors"><Maximize className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Temporal State Heatmap</h3>
            <div className="h-4 w-full rounded-md overflow-hidden flex border border-slate-200">
              <div className="h-full bg-emerald-500 w-1/4" title="Positive Engagement"></div>
              <div className="h-full bg-slate-400 w-1/3" title="Neutral Baseline"></div>
              <div className="h-full bg-amber-500 w-1/6" title="Stress Indicator"></div>
              <div className="h-full bg-slate-400 w-1/4" title="Neutral Baseline"></div>
            </div>
            <div className="flex justify-between text-xs font-mono text-slate-400 mt-2">
              <span>0:00</span>
              <span>1:00</span>
              <span>2:00</span>
              <span>3:00</span>
              <span>4:12</span>
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
                <img 
                  src="https://images.unsplash.com/photo-1555212697-194d092e3b8f?auto=format&fit=crop&q=80&w=300&h=300" 
                  alt="Skeleton tracking" 
                  className="h-full object-cover opacity-40 mix-blend-multiply grayscale"
                />
                <div className="absolute text-slate-700 font-mono text-[10px] uppercase font-bold top-2 left-2 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200">State: Open</div>
              </div>
            </div>
          </div>
          
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 h-full flex flex-col shadow-sm">
            
            <div className="mb-8 text-center border-b border-slate-100 pb-6">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Primary Assessment</h2>
              <p className="text-2xl font-bold text-slate-900 leading-tight">
                Confident Engagement
              </p>
            </div>

            <div className="flex justify-center mb-8 relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={352} strokeDashoffset={352 - (352 * 88) / 100} className="text-slate-900 transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">88<span className="text-lg">%</span></span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">Reliability</span>
              </div>
            </div>

            <div className="mb-8 flex-1">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Synthesized Report</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                The subject displays an open kinematic posture and consistent visual fixation, correlating strongly with confidence. Acoustic analysis confirms a stable frequency with positive inflections. A brief stress indicator was detected at 02:15, accompanied by micro-expressions of hesitation, but the baseline state remains highly positive and engaged.
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
