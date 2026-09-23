import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, MapPin, CheckCircle, BarChart3, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/auth';
import { PublicLayout } from '../../layouts/PublicLayout';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('wc_saved_email');
    const savedPass = localStorage.getItem('wc_saved_pass');
    if (savedEmail) {
      setFormData({
        email: savedEmail,
        password: savedPass || '',
      });
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = formData.email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address');
      return;
    }
    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const response = await authApi.login({
        email: cleanEmail,
        password: formData.password,
      });

      if (response.data.success && response.data.data) {
        // Save or clear credentials based on Remember Me
        if (rememberMe) {
          localStorage.setItem('wc_saved_email', cleanEmail);
          localStorage.setItem('wc_saved_pass', formData.password);
        } else {
          localStorage.removeItem('wc_saved_email');
          localStorage.removeItem('wc_saved_pass');
        }

        login(response.data.data.user, response.data.data.token);
        navigate('/app');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to backend server (port 5000 is offline). Please ensure the backend is running.');
      } else {
        setError(err.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 sm:p-6 bg-[#f8faf9]">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Brand Showcase */}
          <div className="w-full md:w-5/12 bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#1b4332] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Leaf className="w-5 h-5 text-emerald-300" />
                </div>
                <span className="text-xl font-bold tracking-tight">WasteConnect</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mb-3">
                Civic Waste Intelligence & Municipal Operations
              </h2>
              <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed mb-8">
                Connecting citizens, certified waste collectors, and municipal authorities across Delhi & Ghaziabad.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                    <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Live Ward Dispatch</h4>
                    <p className="text-[11px] text-emerald-100/70">GPS-enabled collection and Delhi-NCR hotspot mapping.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Verified Civic Action</h4>
                    <p className="text-[11px] text-emerald-100/70">Photo-audited pickup requests and issue tracking.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Transparent Municipal Analytics</h4>
                    <p className="text-[11px] text-emerald-100/70">Real-time status updates and collection metrics.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 relative z-10 border-t border-white/10 mt-8 flex items-center gap-2 text-[11px] text-emerald-100/70">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Simple, secure login with automatic credential saving</span>
            </div>
          </div>

          {/* Right Form Panel (Clean, Simple & Direct) */}
          <div className="w-full md:w-7/12 p-8 sm:p-10 flex flex-col justify-center bg-white">
            <div className="max-w-md w-full mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">Sign In</h2>
              <p className="text-xs text-gray-500 mb-6">
                Sign in with your email and password. New accounts are created automatically.
              </p>

              {error && (
                <div className="mb-5 p-3.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-200/80 flex items-center justify-between">
                  <span>{error}</span>
                  <button type="button" onClick={() => setError('')} className="text-red-500 hover:text-red-700 text-xs font-bold">×</button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="username email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-10 px-3.5 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                    placeholder="Enter email (e.g. you@example.com)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full h-10 px-3.5 pr-10 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me / Save Credentials */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-emerald-700 focus:ring-emerald-600 h-3.5 w-3.5"
                    />
                    <span>Save credentials on this device</span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition disabled:opacity-60 flex items-center justify-center cursor-pointer"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center text-xs text-gray-500">
                Want to register as a Collector?{' '}
                <Link to="/register" className="text-emerald-700 font-semibold hover:underline">
                  Create Collector Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
export default LoginPage;
