import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store';
import { mockUsers } from '@/lib/mockData';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock authentication
    const user = mockUsers.find(u => u.email === formData.email);
    
    if (user && formData.password === 'password') {
      login(user);
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'employee') {
        navigate('/employee');
      } else {
        navigate('/');
      }
    } else {
      setError('Invalid email or password');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0C0F] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#A9B1BE]">
              LUXE
            </span>
            <span className="font-serif text-2xl text-[#F4F6FA]">RESERVE</span>
          </div>
          <p className="text-[#A9B1BE]">Staff Portal</p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-8">
          <h1 className="font-serif text-2xl text-[#F4F6FA] mb-2">Welcome back</h1>
          <p className="text-[#A9B1BE] text-sm mb-6">
            Sign in to access the management portal
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="text-[#A9B1BE] text-sm mb-2 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A9B1BE]" size={18} />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-luxury pl-10"
                  placeholder="admin@luxereserve.co"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-[#A9B1BE] text-sm mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A9B1BE]" size={18} />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-luxury pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A9B1BE] hover:text-[#F4F6FA] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                <p className="text-rose-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-gold disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#0B0C0F] border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-[rgba(244,246,250,0.08)]">
            <p className="text-[#A9B1BE] text-xs text-center mb-3">Demo Credentials</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-[rgba(244,246,250,0.03)] rounded">
                <span className="text-[#A9B1BE]">Admin:</span>
                <span className="text-[#F4F6FA] font-mono">admin@luxereserve.co / password</span>
              </div>
              <div className="flex justify-between p-2 bg-[rgba(244,246,250,0.03)] rounded">
                <span className="text-[#A9B1BE]">Staff:</span>
                <span className="text-[#F4F6FA] font-mono">staff@luxereserve.co / password</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <a href="/" className="text-[#A9B1BE] text-sm hover:text-[#F4F6FA] transition-colors">
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  );
};
