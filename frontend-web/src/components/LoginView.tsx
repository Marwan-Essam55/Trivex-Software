import { useState } from 'react';
import { Activity, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';

export function LoginView() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;   // prevent double-submit
    setLoading(true);
    setError(null);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email.trim());
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
          localStorage.setItem('user', JSON.stringify({ email: decoded.sub, role: decoded.role }));
          if (decoded.role === 'admin') {
            navigate('/dashboard/admin');
          } else {
            navigate('/dashboard/user');
          }
        } catch (err) {
          navigate('/dashboard/user'); // fallback
        }
      } else {
        const err = await response.json();
        setError(err.detail || 'Authentication failed. Please check your credentials.');
      }
    } catch {
      setError('Network error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google authentication failed. No credential received.');
      return;
    }
    setGoogleLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        try {
          const decoded: any = jwtDecode(data.access_token);
          localStorage.setItem('user', JSON.stringify({ email: decoded.sub, role: decoded.role }));
          if (decoded.role === 'admin') {
            navigate('/dashboard/admin');
          } else {
            navigate('/dashboard/user');
          }
        } catch {
          navigate('/dashboard/user');
        }
      } else {
        const err = await response.json();
        setError(err.detail || 'Google authentication failed.');
      }
    } catch (err: any) {
      if (err?.status === 403) {
        setError(err?.detail || 'Account not registered in any workspace. Please contact your system administrator.');
      } else {
        setError('Network error connecting to the server.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex animate-fade-in bg-white dark:bg-slate-900 font-sans transition-colors duration-200">
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative z-10 max-w-lg px-12 text-left">
          <div className="inline-flex items-center mb-8">
            <Activity className="w-8 h-8 text-white" />
            <span className="ml-3 font-bold text-2xl text-white tracking-wider uppercase">TriVex</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Secure Multi-Modal Analysis Platform</h2>
          <p className="text-slate-300 text-lg leading-relaxed border-l-2 border-slate-700 pl-4">
            Access your secure workspace to process and review behavioral insights with clinical-grade accuracy and strict data compliance.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white dark:bg-slate-900 transition-colors duration-200">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-slate-900 dark:text-white" />
                <span className="ml-2 font-bold text-2xl text-slate-900 dark:text-white tracking-wider uppercase">TriVex</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Access Workspace</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Authenticate to enter the secure environment.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {error.includes('workspace') ? 'Access Denied' : 'Authentication Error'}
                  </h3>
                  <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-teal-400 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-900 dark:focus:ring-teal-500 focus:border-slate-900 dark:focus:border-teal-500 transition-all peer placeholder-transparent shadow-sm"
                  placeholder="tito@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label 
                  htmlFor="email" 
                  className="absolute left-11 -top-2.5 bg-white dark:bg-slate-800 px-1 text-xs font-medium text-slate-500 dark:text-slate-350 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-slate-900 dark:peer-focus:text-white peer-focus:bg-white dark:peer-focus:bg-slate-800 rounded"
                >
                  Corporate Email
                </label>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-teal-400 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  id="password"
                  className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-900 dark:focus:ring-teal-500 focus:border-slate-900 dark:focus:border-teal-500 transition-all peer placeholder-transparent shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label 
                  htmlFor="password" 
                  className="absolute left-11 -top-2.5 bg-white dark:bg-slate-800 px-1 text-xs font-medium text-slate-500 dark:text-slate-350 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-slate-900 dark:peer-focus:text-white peer-focus:bg-white dark:peer-focus:bg-slate-800 rounded"
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
                  className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded cursor-pointer dark:bg-slate-800 dark:border-slate-600"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                  Remember session
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-slate-900 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white transition-colors">
                  Reset credentials
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:bg-teal-600 dark:hover:bg-teal-500 dark:focus:ring-teal-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Authenticating…</>
              ) : (
                <>Authenticate<ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
            
            <div className="mt-6 flex items-center justify-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              <span className="px-4 text-xs font-medium uppercase tracking-wider text-slate-400 bg-white dark:bg-slate-900">Or</span>
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>

            <div className="flex justify-center" id="google-login-btn">
              {googleLoading ? (
                <div className="w-full flex items-center justify-center py-3 px-4 border border-slate-300 rounded-lg text-sm font-semibold text-slate-500 bg-slate-50">
                  <svg className="animate-spin h-5 w-5 mr-2 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating…
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Sign-In was unsuccessful. Please try again.')}
                  theme="outline"
                  size="large"
                  width="400"
                  text="continue_with"
                />
              )}
            </div>
          </form>
          
          <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            For organizational access, contact your{' '}
            <a href="#" className="font-semibold text-slate-900 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white transition-colors">
              system administrator
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
