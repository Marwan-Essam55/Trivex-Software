import { Activity, Video, Mic, UserSquare2, ChevronRight } from 'lucide-react';

interface HomeViewProps {
  onGetStarted: () => void;
}

export function HomeView({ onGetStarted }: HomeViewProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-fade-in font-sans">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Activity className="h-6 w-6 text-slate-900" />
              <span className="ml-2 font-bold text-xl text-slate-900 tracking-wider uppercase">Trivex</span>
            </div>
            <div>
              <button 
                onClick={onGetStarted}
                className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2 transition-colors text-sm"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="relative flex-1 flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-8">
              Clinical-Grade Behavioral Analysis
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-slate-600 mb-12 max-w-2xl mx-auto font-normal leading-relaxed">
              Trivex provides an enterprise platform for researchers and analysts to decode human micro-expressions, vocal intonations, and kinematic posture with multi-modal AI.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={onGetStarted}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-200 bg-slate-900 border border-transparent rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-sm"
              >
                Access Workspace
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Multi-Modal Data Processing</h2>
              <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-base">
                Our secure infrastructure processes three distinct data streams simultaneously to deliver highly accurate behavioral profiles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="bg-white p-8 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-lg flex items-center justify-center mb-6 border border-slate-200">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Facial Micro-Expressions</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Detect and categorize transient facial movements that reveal genuine underlying emotions, ensuring objective evaluation metrics.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-lg flex items-center justify-center mb-6 border border-slate-200">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Vocal Intonation</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Analyze pitch, cadence, and frequency variations in real-time to quantify confidence levels, stress patterns, and hesitations.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-lg flex items-center justify-center mb-6 border border-slate-200">
                  <UserSquare2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Kinematic Posture</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Map and interpret skeletal posture and body language tracking to assess physical engagement, openness, and behavioral shifts.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
