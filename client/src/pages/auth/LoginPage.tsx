import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi, LoginCredentials } from '../../api/auth';
import { PublicLayout } from '../../layouts/PublicLayout';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Basic implementation without react-hook-form to simplify, as requested to be standard React/TypeScript
  const [formData, setFormData] = useState<LoginCredentials>({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await authApi.login(formData);
      if (response.data.success && response.data.data) {
        login(response.data.data.user, response.data.data.token);
        // App.tsx handles redirection automatically based on auth context changes
        navigate('/app');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-4xl bg-surface rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col md:flex-row">
          
          <div className="w-full md:w-1/2 bg-primary p-12 text-white flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-6">
              <Leaf className="w-8 h-8" />
              <span className="text-2xl font-bold">WasteConnect</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Welcome Back</h2>
            <p className="text-primary-muted text-lg">
              Sign in to manage your waste collection, report public issues, and help keep your community clean.
            </p>
          </div>

          <div className="w-full md:w-1/2 p-12">
            <h2 className="text-2xl font-bold text-text mb-6">Sign In</h2>
            
            {error && (
              <div className="mb-6 p-4 bg-status-errorBg text-status-error text-sm font-medium rounded-md border border-status-error/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-11 px-4 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-11 px-4 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors disabled:opacity-70 flex items-center justify-center"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
