import { useState } from 'react';
import { Activity, Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export function LoginView() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        setError(null);
        
        try {
          const decoded: any = jwtDecode(data.access_token);
          if (decoded.role === 'admin') {
            navigate('/dashboard/admin');
          } else {
            navigate('/dashboard/user');
          }
        } catch (e) {
          navigate('/dashboard/user'); // fallback
        }
      } else {
        const err = await response.json();
        setError(err.detail || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error connecting to the server.');
    }
  };

  return (
    <div className="min-h-screen flex animate-fade-in bg-white font-sans">
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative z-10 max-w-lg px-12 text-left">
          <div className="inline-flex items-center mb-8">
            <Activity className="w-8 h-8 text-white" />
            <span className="ml-3 font-bold text-2xl text-white tracking-wider uppercase">Trivex</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Secure Multi-Modal Analysis Platform</h2>
          <p className="text-slate-300 text-lg leading-relaxed border-l-2 border-slate-700 pl-4">
            Access your secure workspace to process and review behavioral insights with clinical-grade accuracy and strict data compliance.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-slate-900" />
                <span className="ml-2 font-bold text-2xl text-slate-900 tracking-wider uppercase">Trivex</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Access Workspace</h1>
            <p className="mt-2 text-slate-500">Authenticate to enter the secure environment.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
                  <div className="mt-1 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all peer placeholder-transparent shadow-sm"
                  placeholder="tito@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label 
                  htmlFor="email" 
                  className="absolute left-11 -top-2.5 bg-white px-1 text-xs font-medium text-slate-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-slate-900 peer-focus:bg-white rounded"
                >
                  Corporate Email
                </label>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  id="password"
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all peer placeholder-transparent shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label 
                  htmlFor="password" 
                  className="absolute left-11 -top-2.5 bg-white px-1 text-xs font-medium text-slate-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-slate-900 peer-focus:bg-white rounded"
                >
                  Password
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                  Remember session
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-slate-900 hover:text-slate-700 transition-colors">
                  Reset credentials
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="group w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all duration-200"
            >
              Authenticate
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="mt-6 flex items-center justify-center">
              <div className="w-full border-t border-slate-200"></div>
              <span className="px-4 text-xs font-medium uppercase tracking-wider text-slate-400 bg-white">Or</span>
              <div className="w-full border-t border-slate-200"></div>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2 text-slate-700" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866.549 3.921 1.453l2.814-2.814C17.503 2.988 15.139 2 12.545 2 7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.761h-9.426z" />
              </svg>
              SSO Login
            </button>
          </form>
          
          <p className="mt-8 text-center text-xs text-slate-500">
            For organizational access, contact your <a href="#" className="font-semibold text-slate-900 hover:text-slate-700 transition-colors">system administrator</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
