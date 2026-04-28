import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store';
import { mockUsers } from '@/lib/mockData';
import { isSupabaseConfigured } from '@/lib/supabase';
import { signInStaffPortal } from '@/lib/supabaseAdminApi';

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
  const isFallbackMode = !isSupabaseConfigured;

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

    if (isSupabaseConfigured) {
      const result = await signInStaffPortal(formData.email.trim(), formData.password);

      if (!result.user) {
        setError(result.error ?? 'Invalid email or password');
        setIsLoading(false);
        return;
      }

      login(result.user);

      if (result.user.role === 'admin') {
        navigate('/admin');
      } else if (result.user.role === 'employee') {
        navigate('/employee');
      } else {
        navigate('/');
      }

      setIsLoading(false);
      return;
    }

    // Local fallback mode when Supabase env vars are not provided.
    await new Promise(resolve => setTimeout(resolve, 600));
    const user = mockUsers.find(u => u.email === formData.email);

    if (user && formData.password === 'password') {
      login(user);

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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #e8e4df 0%, #f5f1ed 100%)',
        backgroundImage: `
          url('/loginimage.png'),
          url('/loginimage.png')
        `,
        backgroundPosition: 'left center, right center',
        backgroundSize: '40% cover, 40% cover',
        backgroundRepeat: 'no-repeat, no-repeat',
        backgroundAttachment: 'fixed, fixed',
      }}
    >
      {/* Left Mirror Effect */}
      <div className="absolute inset-y-0 left-0 w-1/2 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url('/loginimage.png')`,
          backgroundPosition: 'right center',
          backgroundSize: '100% cover',
          backgroundRepeat: 'no-repeat',
          transform: 'scaleX(-1)',
        }}
      />
      
      {/* Right Mirror Effect */}
      <div className="absolute inset-y-0 right-0 w-1/2 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url('/loginimage.png')`,
          backgroundPosition: 'left center',
          backgroundSize: '100% cover',
          backgroundRepeat: 'no-repeat',
          transform: 'scaleX(-1)',
        }}
      />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.1),transparent_40%)]" />
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="mb-4 flex items-center justify-center">
            <div className="inline-flex items-center gap-3">
              <img
                src="/logosolo.png"
                alt="Singh's Dining lion logo"
                className="h-14 w-14 object-contain drop-shadow-[0_4px_12px_rgba(109,70,20,0.25)]"
                loading="eager"
                draggable={false}
              />
              <div className="text-left leading-none">
                <div className="flex items-end gap-2">
                  <span className="font-serif text-[24px] tracking-wide text-amber-900">Singh&apos;s</span>
                  <span className="mb-1 inline-block h-4 w-px bg-amber-700/60" />
                  <span className="text-[12px] font-semibold uppercase tracking-[0.32em] text-amber-800">Dining</span>
                </div>
                <span className="mt-1 block text-[10px] uppercase tracking-[0.28em] text-amber-700/70">
                  By Rangrez
                </span>
              </div>
            </div>
          </div>
          <p className="text-amber-700/60">Staff Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl border border-amber-200/50 p-8 shadow-lg">
          {isFallbackMode && (
            <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="text-amber-700 text-xs leading-relaxed">
                Supabase auth is not active. Add VITE_SUPABASE_URL plus VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY, then restart the dev server.
              </p>
            </div>
          )}
          <h1 className="font-serif text-2xl text-amber-900 mb-2">Welcome back</h1>
          <p className="text-amber-700/60 text-sm mb-6">
            Sign in to access the management portal
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="text-amber-700/60 text-sm mb-2 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/60" size={18} />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50 pl-10"
                  placeholder="admin@luxereserve.co"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-amber-700/60 text-sm mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/60" size={18} />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50 pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-700/60 hover:text-amber-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-rose-100 border border-rose-300 rounded-lg">
                <p className="text-rose-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-amber-200/30">
            <p className="text-amber-700/60 text-xs text-center mb-3">
              {isSupabaseConfigured ? 'Use your Supabase staff/admin credentials' : 'Demo Credentials'}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-amber-50 rounded border border-amber-200/50">
                <span className="text-amber-700/60">Admin:</span>
                <span className="text-amber-900 font-mono">
                  {isSupabaseConfigured ? 'Role must be admin in user_roles' : 'admin@luxereserve.co / password'}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-amber-50 rounded border border-amber-200/50">
                <span className="text-amber-700/60">Staff:</span>
                <span className="text-amber-900 font-mono">
                  {isSupabaseConfigured ? 'Role must be staff in user_roles' : 'staff@luxereserve.co / password'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-[#B2BDCF] text-sm hover:text-[#F4F6FA] transition-colors">
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
};
