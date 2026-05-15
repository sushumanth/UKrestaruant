import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useAuthStore } from '@/store';
import { signInStaffPortal } from '@/frontendapis';

export const LoginPage = () => {
  const navigate = useNavigate();

  const { login } = useAuthStore();

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError('');
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setIsLoading(true);
    setError('');

    const result = await signInStaffPortal(
      formData.email.trim(),
      formData.password
    );

    if (!result.user) {
      setError(
        result.error ??
          'Invalid email or password'
      );

      setIsLoading(false);
      return;
    }

    login(result.user);

    if (result.user.role === 'admin') {
      navigate('/admin');
    } else if (
      result.user.role === 'employee'
    ) {
      navigate('/employee');
    } else {
      navigate('/');
    }

    setIsLoading(false);
  };

  return (
    <div
      className="
        min-h-screen
        relative
        flex
        items-center
        justify-center
        overflow-hidden
        px-4
        py-10
        sm:px-6
        lg:px-8
      "
    >
      {/* ================= BACKGROUND IMAGE ================= */}

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url('/loginimage.png')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* ================= LIGHT OVERLAY ================= */}

      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

      {/* ================= LUXURY GRADIENT ================= */}

      <div
        className="
          absolute inset-0
          bg-gradient-to-br
          from-amber-100/20
          via-transparent
          to-cyan-100/10
        "
      />

      {/* ================= AMBIENT GLOW ================= */}

      <div
        className="
          absolute top-0 left-1/2
          -translate-x-1/2
          h-[320px] w-[320px]
          rounded-full
          bg-amber-200/20
          blur-3xl
        "
      />

      {/* ================= CONTENT ================= */}

      <div className="relative z-10 w-full max-w-md">
        {/* ================= LOGO ================= */}

        <div className="text-center mb-8 sm:mb-10">
          <div className="mb-5 flex items-center justify-center">
            <div className="inline-flex items-center gap-3">
              <img
                src="/logo1.png"
                alt="Singh's Dining lion logo"
                className="
                  h-14 w-14
                  object-contain
                  drop-shadow-[0_4px_12px_rgba(109,70,20,0.25)]
                "
                loading="eager"
                draggable={false}
              />

              <div className="text-left leading-none">
                <div className="flex items-end gap-2">
                  <span className="font-serif text-[24px] tracking-wide text-amber-900">
                    Singh&apos;s
                  </span>

                  <span className="mb-1 inline-block h-4 w-px bg-amber-700/60" />

                  <span className="text-[12px] font-semibold uppercase tracking-[0.32em] text-amber-800">
                    Dining
                  </span>
                </div>

                <span className="mt-1 block text-[10px] uppercase tracking-[0.28em] text-amber-700/70">
                  By Rangrez
                </span>
              </div>
            </div>
          </div>

          <p className="text-amber-800/70 font-medium">
            Staff Portal
          </p>
        </div>

        {/* ================= LOGIN CARD ================= */}

        <div
          className="
            bg-white/92
            backdrop-blur-md
            rounded-[28px]
            border border-white/60
            shadow-[0_20px_80px_rgba(0,0,0,0.12)]
            p-6
            sm:p-8
          "
        >
          {/* Header */}
          <div className="mb-7">
            <h1 className="font-serif text-3xl text-amber-900 mb-2">
              Welcome back
            </h1>

            <p className="text-amber-700/60 text-sm">
              Sign in to access the
              management portal
            </p>
          </div>

          {/* ================= FORM ================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="text-sm text-amber-700/70 mb-2 block"
              >
                Email
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/60"
                  size={18}
                />

                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={
                    handleInputChange
                  }
                  placeholder="mail@gmail.com"
                  required
                  className="
                    h-12
                    rounded-2xl
                    border border-amber-200
                    bg-[#F8FAFC]
                    text-amber-900
                    placeholder:text-amber-700/40
                    pl-11
                    focus:border-amber-300
                    focus:ring-amber-200
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="text-sm text-amber-700/70 mb-2 block"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/60"
                  size={18}
                />

                <Input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={formData.password}
                  onChange={
                    handleInputChange
                  }
                  placeholder="••••••••"
                  required
                  className="
                    h-12
                    rounded-2xl
                    border border-amber-200
                    bg-[#F8FAFC]
                    text-amber-900
                    placeholder:text-amber-700/40
                    pl-11
                    pr-11
                    focus:border-amber-300
                    focus:ring-amber-200
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="
                    absolute right-3 top-1/2
                    -translate-y-1/2
                    text-amber-700/60
                    hover:text-amber-800
                    transition
                  "
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-sm text-rose-700">
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="
                h-12 w-full
                rounded-2xl
                bg-amber-700
                text-white
                hover:bg-amber-800
                disabled:opacity-50
                text-base
                font-medium
                shadow-lg
                shadow-amber-700/20
                transition-all
              "
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* ================= DEMO INFO ================= */}

          {/* <div className="mt-7 pt-6 border-t border-amber-200/40">
            <p className="text-center text-xs text-amber-700/60 mb-4">
              Use your backend staff/admin
              credentials
            </p>

            <div className="space-y-3">
              <div
                className="
                  flex flex-col
                  sm:flex-row
                  gap-1
                  sm:items-center
                  sm:justify-between
                  rounded-xl
                  border border-amber-200/60
                  bg-amber-50/70
                  p-3
                "
              >
                <span className="text-xs text-amber-700/70">
                  Admin:
                </span>

                <span className="font-mono text-xs text-amber-900">
                  Role must be admin on the
                  backend
                </span>
              </div>

              <div
                className="
                  flex flex-col
                  sm:flex-row
                  gap-1
                  sm:items-center
                  sm:justify-between
                  rounded-xl
                  border border-amber-200/60
                  bg-amber-50/70
                  p-3
                "
              >
                <span className="text-xs text-amber-700/70">
                  Staff:
                </span>

                <span className="font-mono text-xs text-amber-900">
                  Role must be employee on
                  the backend
                </span>
              </div>
            </div>
          </div> */}
        </div>

        {/* ================= BACK LINK ================= */}

        <div className="text-center mt-5">
          <Link
            to="/"
            className="
              text-sm
              text-amber-900/70
              hover:text-amber-900
              transition
            "
          >
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
};