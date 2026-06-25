import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Cpu, 
  Video, 
  Mic, 
  UserSquare2, 
  Smartphone, 
  Shield, 
  FileText, 
  LineChart, 
  Activity, 
  Users, 
  ChevronRight,
  ChevronLeft 
} from 'lucide-react';

export function HomeView() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Carousel Slider State for Targeted Use Cases
  const [useCaseIndex, setUseCaseIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0); // -1 = left, 1 = right

  // Parse and validate JWT on mount (cohesive with App.tsx auth checking)
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp > currentTime) {
          setIsAuthenticated(true);
          setUserRole(decoded.role || 'user');
        } else {
          // Clean expired session
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
      } catch (err) {
        // Clean corrupted session
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleCTAClick = () => {
    if (isAuthenticated) {
      const dashboardPath = userRole === 'admin' ? '/dashboard/admin' : '/dashboard/user';
      navigate(dashboardPath);
    } else {
      navigate('/login');
    }
  };

  // Targeted Use Cases content data list
  const useCases = [
    {
      title: "Clinical Diagnostics",
      description: "Objective evaluation tools for clinical psychologists and therapists to quantify emotional trajectories and patient recovery states.",
      icon: Activity,
      tag: "Clinical Systems"
    },
    {
      title: "Research Analysis",
      description: "Accelerating behavioral research, behavioral schema encoding, multi-modal signal collation, and automated database curation.",
      icon: LineChart,
      tag: "Academic Datasets"
    },
    {
      title: "Enterprise HR",
      description: "Streamlining talent assessment, corporate leadership development, stress evaluation safeguards, and professional training cycles.",
      icon: Users,
      tag: "HR Operations"
    }
  ];

  // Carousel handlers
  const handlePrevSlide = () => {
    setSlideDirection(-1);
    setUseCaseIndex((prev) => (prev === 0 ? useCases.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setSlideDirection(1);
    setUseCaseIndex((prev) => (prev === useCases.length - 1 ? 0 : prev + 1));
  };

  const handleJumpToSlide = (index: number) => {
    setSlideDirection(index > useCaseIndex ? 1 : -1);
    setUseCaseIndex(index);
  };

  // Framer Motion animation variants

  // Hero section container (staggers child fades)
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  // Hero items fade-in-up transition
  const heroItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring" as const,
        stiffness: 70,
        damping: 18,
        duration: 0.6 
      } 
    }
  };

  // Staggered list grid triggers
  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  // Card slide fade-in-up as it enters viewport
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 60,
        damping: 16,
        duration: 0.5
      }
    }
  };

  // Carousel slide animations variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 120 : -120,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 180, damping: 22 },
        opacity: { duration: 0.25 }
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 120 : -120,
      opacity: 0,
      transition: {
        x: { type: "spring" as const, stiffness: 180, damping: 22 },
        opacity: { duration: 0.2 }
      }
    })
  };

  const CurrentIcon = useCases[useCaseIndex].icon;

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-teal-600 selection:text-white relative overflow-x-hidden">
      
      {/* Dynamic Keyframes for floating background ambient elements */}
      <style>{`
        @keyframes float-blob-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(45px, -35px) scale(1.05); }
        }
        @keyframes float-blob-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-35px, 45px) scale(0.95); }
        }
        .animate-float-blob-1 { animation: float-blob-1 15s ease-in-out infinite; }
        .animate-float-blob-2 { animation: float-blob-2 19s ease-in-out infinite; }
      `}</style>

      {/* 1. Navbar Section */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
              <Activity className="h-6 w-6 text-teal-600 animate-pulse" />
              <span className="font-bold text-xl text-slate-900 tracking-wider uppercase">Trivex</span>
            </div>
            <div>
              {isAuthenticated ? (
                <button 
                  onClick={handleCTAClick}
                  className="text-slate-600 hover:text-teal-600 font-medium px-4 py-2 transition-colors text-sm"
                >
                  Dashboard
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/login')}
                  className="text-slate-600 hover:text-teal-600 font-medium px-4 py-2 transition-colors text-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative">
        
        {/* 2. Hero Section */}
        <section className="relative bg-white py-20 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          
          {/* Subtle Background Animated Gradient Blobs in Teal-Blue Palette */}
          <div className="absolute top-10 left-[20%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-teal-100/40 via-cyan-50/15 to-slate-200/30 blur-[100px] pointer-events-none -z-10 animate-float-blob-1" />
          <div className="absolute bottom-10 right-[15%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-teal-50/20 via-indigo-50/10 to-slate-100/20 blur-[110px] pointer-events-none -z-10 animate-float-blob-2" />

          <motion.div 
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto text-center relative z-10"
          >
            <motion.h1 
              variants={heroItemVariants} 
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8"
            >
              Advanced Behavioral Intelligence Platform
            </motion.h1>
            
            <motion.p 
              variants={heroItemVariants} 
              className="text-lg sm:text-xl text-slate-500 mb-12 max-w-3xl mx-auto font-normal leading-relaxed"
            >
              Trivex provides an enterprise platform for researchers and analysts to decode human micro-expressions, vocal intonations, and kinematic posture with multimodal AI.
            </motion.p>
            
            <motion.div variants={heroItemVariants} className="flex justify-center">
              <button 
                onClick={handleCTAClick}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-300 bg-teal-600 hover:bg-teal-500 rounded-lg hover:shadow-lg hover:shadow-teal-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 hover:scale-[1.01]"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Access Workspace'}
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* 3. Hybrid Technology Section */}
        <section className="bg-slate-50/50 border-y border-slate-100 py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Our Core Hybrid Technology
              </h2>
              <p className="mt-4 text-slate-500 text-base leading-relaxed">
                We combine state-of-the-art Neural Networks for feature extraction with established Expert Systems for reliable decision making.
              </p>
            </div>

            {/* 2 Columns with viewport trigger entrance */}
            <motion.div 
              variants={listContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto"
            >
              
              {/* Column 1: Neural Networks */}
              <motion.div 
                variants={cardVariants}
                whileHover={{ 
                  y: -8, 
                  boxShadow: "0 20px 40px rgba(13, 148, 136, 0.04)",
                  borderColor: "rgba(13, 148, 136, 0.15)",
                  transition: { duration: 0.2, ease: "easeOut" } 
                }}
                className="bg-white p-8 rounded-lg border border-slate-200 transition-all duration-200 text-left group cursor-pointer"
              >
                <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-lg flex items-center justify-center mb-6 border border-slate-200/80 group-hover:bg-teal-50/30 group-hover:border-teal-200 group-hover:text-teal-600 transition-colors duration-200">
                  <Cpu className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors duration-200">Neural Networks</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Advanced deep learning models for high-fidelity extraction of facial expressions, vocal features, and posture data.
                </p>
              </motion.div>

              {/* Column 2: Experta Rules Engine */}
              <motion.div 
                variants={cardVariants}
                whileHover={{ 
                  y: -8, 
                  boxShadow: "0 20px 40px rgba(13, 148, 136, 0.04)",
                  borderColor: "rgba(13, 148, 136, 0.15)",
                  transition: { duration: 0.2, ease: "easeOut" } 
                }}
                className="bg-white p-8 rounded-lg border border-slate-200 transition-all duration-200 text-left group cursor-pointer"
              >
                <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-lg flex items-center justify-center mb-6 border border-slate-200/80 group-hover:bg-teal-50/30 group-hover:border-teal-200 group-hover:text-teal-600 transition-colors duration-200">
                  <Brain className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors duration-200">Experta Rules Engine</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Integration of symbolic AI and expert rules for logical, accurate behavioral analysis and interpretation.
                </p>
              </motion.div>

            </motion.div>

          </div>
        </section>

        {/* 4. Feature Grid Section (Faint Teal Canvas separating pure white flow) */}
        <section className="bg-teal-50/15 border-y border-teal-100/40 py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Comprehensive Analysis Features
              </h2>
              <p className="mt-4 text-slate-500 text-base leading-relaxed">
                Trivex delivers a full suite of analytical capabilities designed to meet high academic benchmarks and production-ready deployments.
              </p>
            </div>

            {/* 3-Column Card Grid (6 Cards) with viewport entrance */}
            <motion.div 
              variants={listContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              
              {/* Card 1: Facial Micro-Expressions */}
              <motion.div 
                variants={cardVariants}
                whileHover={{ 
                  y: -8, 
                  boxShadow: "0 20px 40px rgba(13, 148, 136, 0.04)",
                  borderColor: "rgba(13, 148, 136, 0.15)",
                  transition: { duration: 0.2, ease: "easeOut" } 
                }}
                className="bg-white p-8 rounded-lg border border-slate-200 transition-all duration-200 text-left group cursor-pointer"
              >
                <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-lg flex items-center justify-center mb-6 border border-slate-200/80 group-hover:bg-teal-50/30 group-hover:border-teal-200 group-hover:text-teal-600 transition-colors duration-200">
                  <Video className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors duration-200">Facial Micro-Expressions</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Detect and categorize transient facial movements that reveal genuine underlying emotions, ensuring objective evaluation metrics.
                </p>
              </motion.div>

              {/* Card 2: Vocal Intonation */}
              <motion.div 
                variants={cardVariants}
                whileHover={{ 
                  y: -8, 
                  boxShadow: "0 20px 40px rgba(13, 148, 136, 0.04)",
                  borderColor: "rgba(13, 148, 136, 0.15)",
                  transition: { duration: 0.2, ease: "easeOut" } 
                }}
                className="bg-white p-8 rounded-lg border border-slate-200 transition-all duration-200 text-left group cursor-pointer"
              >
                <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-lg flex items-center justify-center mb-6 border border-slate-200/80 group-hover:bg-teal-50/30 group-hover:border-teal-200 group-hover:text-teal-600 transition-colors duration-200">
                  <Mic className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors duration-200">Vocal Intonation</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Analyze pitch, cadence, and frequency variations in real-time to quantify confidence levels, stress patterns, and hesitations.
                </p>
              </motion.div>

              {/* Card 3: Kinematic Posture */}
              <motion.div 
                variants={cardVariants}
                whileHover={{ 
                  y: -8, 
                  boxShadow: "0 20px 40px rgba(13, 148, 136, 0.04)",
                  borderColor: "rgba(13, 148, 136, 0.15)",
                  transition: { duration: 0.2, ease: "easeOut" } 
                }}
                className="bg-white p-8 rounded-lg border border-slate-200 transition-all duration-200 text-left group cursor-pointer"
              >
                <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-lg flex items-center justify-center mb-6 border border-slate-200/80 group-hover:bg-teal-50/30 group-hover:border-teal-200 group-hover:text-teal-600 transition-colors duration-200">
                  <UserSquare2 className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors duration-200">Kinematic Posture</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Map and interpret skeletal posture and body language tracking to assess physical engagement, openness, and behavioral shifts.
                </p>
              </motion.div>

              {/* Card 4: Cross-Platform Accessibility */}
              <motion.div 
                variants={cardVariants}
                whileHover={{ 
                  y: -8, 
                  boxShadow: "0 20px 40px rgba(13, 148, 136, 0.04)",
                  borderColor: "rgba(13, 148, 136, 0.15)",
                  transition: { duration: 0.2, ease: "easeOut" } 
                }}
                className="bg-white p-8 rounded-lg border border-slate-200 transition-all duration-200 text-left group cursor-pointer"
              >
                <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-lg flex items-center justify-center mb-6 border border-slate-200/80 group-hover:bg-teal-50/30 group-hover:border-teal-200 group-hover:text-teal-600 transition-colors duration-200">
                  <Smartphone className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors duration-200">Cross-Platform Accessibility</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Access the platform seamlessly across web and mobile ecosystems with our dedicated Expo app.
                </p>
              </motion.div>

              {/* Card 5: Role-Based Access Control */}
              <motion.div 
                variants={cardVariants}
                whileHover={{ 
                  y: -8, 
                  boxShadow: "0 20px 40px rgba(13, 148, 136, 0.04)",
                  borderColor: "rgba(13, 148, 136, 0.15)",
                  transition: { duration: 0.2, ease: "easeOut" } 
                }}
                className="bg-white p-8 rounded-lg border border-slate-200 transition-all duration-200 text-left group cursor-pointer"
              >
                <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-lg flex items-center justify-center mb-6 border border-slate-200/80 group-hover:bg-teal-50/30 group-hover:border-teal-200 group-hover:text-teal-600 transition-colors duration-200">
                  <Shield className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors duration-200">Role-Based Access Control</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Separation of administrator controls and standard investigator workspaces ensures secure data segregation.
                </p>
              </motion.div>

              {/* Card 6: Detailed Performance Reports */}
              <motion.div 
                variants={cardVariants}
                whileHover={{ 
                  y: -8, 
                  boxShadow: "0 20px 40px rgba(13, 148, 136, 0.04)",
                  borderColor: "rgba(13, 148, 136, 0.15)",
                  transition: { duration: 0.2, ease: "easeOut" } 
                }}
                className="bg-white p-8 rounded-lg border border-slate-200 transition-all duration-200 text-left group cursor-pointer relative overflow-hidden"
              >
                <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-lg flex items-center justify-center mb-6 border border-slate-200/80 group-hover:bg-teal-50/30 group-hover:border-teal-200 group-hover:text-teal-600 transition-colors duration-200">
                  <FileText className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors duration-200">Detailed Performance Reports</h3>
                  <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 border border-teal-100 rounded px-1.5 py-0.5">
                    Coming Soon
                  </span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Generate comprehensive, audit-ready clinical and analytical PDF diagnostic assessments.
                </p>
              </motion.div>

            </motion.div>

          </div>
        </section>

        {/* 5. Use Cases Section (Overhauled into an Interactive Slider/Carousel in Teal-Blue style) */}
        <section className="bg-slate-50/50 border-t border-slate-100 py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Targeted Use Cases
              </h2>
              <p className="mt-4 text-slate-500 text-base leading-relaxed">
                Our technology serves professionals across academic, clinical, and corporate contexts.
              </p>
            </div>

            {/* Slider Widget Wrapper */}
            <div className="max-w-3xl mx-auto relative flex flex-col items-center">
              
              {/* Slides dynamic container */}
              <div className="w-full min-h-[290px] relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-sm flex flex-col justify-center">
                
                <AnimatePresence initial={false} mode="wait" custom={slideDirection}>
                  <motion.div
                    key={useCaseIndex}
                    custom={slideDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-lg flex items-center justify-center border border-slate-200/80">
                        <CurrentIcon className="w-6 h-6 stroke-[1.5] text-teal-600" />
                      </div>
                      <span className="text-xs font-semibold text-teal-600 font-mono tracking-wider uppercase bg-teal-50 border border-teal-200/50 rounded px-2.5 py-1">
                        {useCases[useCaseIndex].tag}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 mb-4 hover:text-teal-600 transition-colors duration-200">
                      {useCases[useCaseIndex].title}
                    </h3>
                    <p className="text-slate-500 text-base leading-relaxed">
                      {useCases[useCaseIndex].description}
                    </p>
                  </motion.div>
                </AnimatePresence>

              </div>

              {/* Slider controls (Arrows & Dots inline utilizing Teal-Blue style) */}
              <div className="flex items-center justify-between w-full mt-8 px-2">
                
                {/* Left navigation arrow */}
                <button
                  onClick={handlePrevSlide}
                  aria-label="Previous slide"
                  className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-teal-600 hover:border-teal-200 transition-colors shadow-sm focus:outline-none"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2]" />
                </button>

                {/* Dot page indicators */}
                <div className="flex items-center gap-2">
                  {useCases.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleJumpToSlide(idx)}
                      aria-label={`Jump to slide ${idx + 1}`}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        idx === useCaseIndex 
                          ? "bg-teal-600 w-6" 
                          : "bg-slate-200 hover:bg-teal-100"
                      }`}
                    />
                  ))}
                </div>

                {/* Right navigation arrow */}
                <button
                  onClick={handleNextSlide}
                  aria-label="Next slide"
                  className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-teal-600 hover:border-teal-200 transition-colors shadow-sm focus:outline-none"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2]" />
                </button>

              </div>

            </div>

          </div>
        </section>

      </main>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-600 animate-pulse" />
            <span className="font-bold text-slate-900 uppercase tracking-wider text-sm">
              Trivex
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            &copy; {new Date().getFullYear()} Trivex Systems. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
