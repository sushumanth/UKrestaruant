import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCustomerAuthStore } from '@/store';
import { signInCustomer, signUpCustomer } from '@/lib/supabaseCustomerApi';

type AuthMode = 'sign-in' | 'sign-up';

export const CustomerAuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customer, isCustomerAuthenticated, loginCustomer } = useCustomerAuthStore();

  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
  });

  const redirectTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    return redirect && redirect.startsWith('/') ? redirect : '/booking';
  }, [location.search]);

  useEffect(() => {
    if (isCustomerAuthenticated && customer) {
      navigate(redirectTo, { replace: true });
    }
  }, [customer, isCustomerAuthenticated, navigate, redirectTo]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    if (mode === 'sign-up') {
      const result = await signUpCustomer({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      });

      if (!result.customer) {
        setError(result.error ?? 'Unable to create account. Please try again.');
        setIsLoading(false);
        return;
      }

      loginCustomer(result.customer);
      navigate(redirectTo, { replace: true });
      setIsLoading(false);
      return;
    }

    const result = await signInCustomer(formData.email, formData.password);

    if (!result.customer) {
      setError(result.error ?? 'Invalid email or password.');
      setIsLoading(false);
      return;
    }

    loginCustomer(result.customer);
    navigate(redirectTo, { replace: true });
    setIsLoading(false);
  };

  const isSignUpValid = Boolean(
    formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.phone.trim() &&
      formData.email.trim() &&
      formData.password.trim()
  );

  const isSignInValid = Boolean(formData.email.trim() && formData.password.trim());

  return (
    <div className="min-h-screen pt-28 pb-16" style={{ background: 'linear-gradient(135deg, #efe6d8 0%, #f9f3e8 100%)' }}>
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="grid overflow-hidden rounded-3xl border border-amber-200/60 bg-white shadow-[0_28px_56px_rgba(86,52,21,0.16)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-[linear-gradient(140deg,#3c180d_0%,#5b2813_55%,#2f150d_100%)] px-8 py-10 text-[#fbe7c2] sm:px-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/80">Customer Access</p>
            <h1 className="mt-3 font-serif text-[clamp(34px,5vw,56px)] leading-[0.92]">Reserve with your account</h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-amber-100/80 sm:text-base">
              Create an account once, then book faster and track all your reservations from your dashboard.
            </p>

            <div className="mt-8 space-y-3 text-sm text-amber-100/80">
              <p>1. Create your account with name, email and phone.</p>
              <p>2. Sign in before booking a table.</p>
              <p>3. View your booking history anytime.</p>
            </div>

            <Link to="/" className="mt-10 inline-flex text-sm font-semibold text-amber-200 transition-colors hover:text-amber-100">
              Back to home
            </Link>
          </div>

          <div className="px-7 py-8 sm:px-10 sm:py-10">
            <div className="mb-6 inline-flex rounded-full border border-amber-200 bg-amber-50 p-1">
              <button
                type="button"
                onClick={() => setMode('sign-in')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${mode === 'sign-in' ? 'bg-amber-700 text-white' : 'text-amber-800 hover:text-amber-900'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('sign-up')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${mode === 'sign-up' ? 'bg-amber-700 text-white' : 'text-amber-800 hover:text-amber-900'}`}
              >
                Create Account
              </button>
            </div>

            <h2 className="font-serif text-3xl leading-none text-amber-950">
              {mode === 'sign-up' ? 'Create your customer account' : 'Sign in to continue'}
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === 'sign-up' && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-amber-900" htmlFor="firstName">First Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/70" />
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="h-11 rounded-xl border-amber-200 bg-white pl-9 text-amber-950"
                          placeholder="John"
                          autoComplete="given-name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-amber-900" htmlFor="lastName">Last Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/70" />
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="h-11 rounded-xl border-amber-200 bg-white pl-9 text-amber-950"
                          placeholder="Doe"
                          autoComplete="family-name"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-amber-900" htmlFor="phone">Phone Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/70" />
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="h-11 rounded-xl border-amber-200 bg-white pl-9 text-amber-950"
                        placeholder="+44 7123 456789"
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-amber-900" htmlFor="email">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/70" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-11 rounded-xl border-amber-200 bg-white pl-9 text-amber-950"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-amber-900" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/70" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-11 rounded-xl border-amber-200 bg-white pl-9 pr-10 text-amber-950"
                    placeholder="••••••••"
                    autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-700/70"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && <p className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}

              <Button
                type="submit"
                disabled={isLoading || (mode === 'sign-up' ? !isSignUpValid : !isSignInValid)}
                className="h-11 w-full rounded-xl bg-amber-700 text-white hover:bg-amber-800 disabled:opacity-60"
              >
                {isLoading ? 'Please wait...' : mode === 'sign-up' ? 'Create Account and Continue' : 'Sign In and Continue'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
