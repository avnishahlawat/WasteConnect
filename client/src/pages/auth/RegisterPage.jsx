import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, MapPin, CheckCircle, BarChart3, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/auth';
import { PublicLayout } from '../../layouts/PublicLayout';

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CITIZEN',
    phone: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.register({
        ...formData,
        email: formData.email.trim(),
      });
      if (response.data.success && response.data.data) {
        localStorage.setItem('wasteconnect_last_email', formData.email.trim());
        login(response.data.data.user, response.data.data.token);
        navigate('/app');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach API backend (port 5000 offline). Please ensure backend server is running.');
      } else {
        setError(err.response?.data?.message || 'An error occurred during registration');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 sm:p-6 bg-[#f8faf9] py-10">
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
                Join the Civic Cleanliness Network
              </h2>
              <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed mb-8">
                Create an account to request household waste pickups, report civic dumps, and track municipal actions in real time.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Guaranteed Collection</h4>
                    <p className="text-[11px] text-emerald-100/70">Doorstep recyclable and general pickup scheduling.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                    <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Civic Issue Tracker</h4>
                    <p className="text-[11px] text-emerald-100/70">Direct escalations to municipal zonal officers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Community Impact</h4>
                    <p className="text-[11px] text-emerald-100/70">Verified logs of diverted waste and civic cleanliness.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 relative z-10 border-t border-white/10 mt-8 flex items-center gap-2 text-[11px] text-emerald-100/70">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Free for all citizens and registered municipal contractors</span>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="w-full md:w-7/12 p-8 sm:p-10 flex flex-col justify-center bg-white">
            <div className="max-w-md w-full mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">Create Account</h2>
              <p className="text-xs text-gray-500 mb-6">
                Register with your personal email and start using WasteConnect immediately.
              </p>

              {error && (
                <div className="mb-5 p-3.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-200/80 flex items-center justify-between">
                  <span>{error}</span>
                  <button type="button" onClick={() => setError('')} className="text-red-500 hover:text-red-700 text-xs font-bold">×</button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full h-10 px-3.5 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Patel"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full h-10 px-3.5 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Personal Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="priya.patel@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-10 px-3.5 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-10 px-3.5 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min 6 chars"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full h-10 px-3.5 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Repeat password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full h-10 px-3.5 pr-10 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
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
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Registering As:</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-medium">
                      <input
                        type="radio"
                        name="role"
                        value="CITIZEN"
                        checked={formData.role === 'CITIZEN'}
                        onChange={() => setFormData({ ...formData, role: 'CITIZEN' })}
                        className="text-emerald-700 focus:ring-emerald-600"
                      />
                      <span>Citizen</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-medium">
                      <input
                        type="radio"
                        name="role"
                        value="COLLECTOR"
                        checked={formData.role === 'COLLECTOR'}
                        onChange={() => setFormData({ ...formData, role: 'COLLECTOR' })}
                        className="text-emerald-700 focus:ring-emerald-600"
                      />
                      <span>Waste Collector</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition disabled:opacity-60 flex items-center justify-center cursor-pointer"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </form>

              <div className="mt-5 text-center text-xs text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-700 font-semibold hover:underline">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
export default RegisterPage;
