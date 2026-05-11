import { useState } from 'react';
import { UserPlus, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createStaffMember } from '@/adminApi';
import type { User } from '@/types';

interface AddStaffFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export const AdminStaff = () => {
  const [formData, setFormData] = useState<AddStaffFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdStaff, setCreatedStaff] = useState<User | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const newStaff = await createStaffMember({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      });

      setCreatedStaff(newStaff);
      setSuccess(`Staff member ${newStaff.firstName} ${newStaff.lastName} created successfully!`);
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create staff member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <UserPlus size={32} className="text-amber-700" />
          <h1 className="font-serif text-3xl text-amber-900">Add Staff Member</h1>
        </div>
        <p className="text-amber-700/60">Create a new staff account for employee access.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-amber-200/50 p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-amber-700/60 text-sm mb-2 block">
                  Email Address <span className="text-rose-600">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50"
                  placeholder="staff@example.com"
                  required
                />
                <p className="text-xs text-amber-700/60 mt-1">Must be a unique email address</p>
              </div>

              {/* First Name */}
              <div>
                <Label htmlFor="firstName" className="text-amber-700/60 text-sm mb-2 block">
                  First Name <span className="text-rose-600">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50"
                  placeholder="John"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <Label htmlFor="lastName" className="text-amber-700/60 text-sm mb-2 block">
                  Last Name <span className="text-rose-600">*</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50"
                  placeholder="Doe"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-amber-700/60 text-sm mb-2 block">
                  Phone Number <span className="text-amber-700/40">(Optional)</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50"
                  placeholder="+44 7000 000000"
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="text-amber-700/60 text-sm mb-2 block">
                  Password <span className="text-rose-600">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50 pr-10"
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
                <p className="text-xs text-amber-700/60 mt-1">Minimum 8 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword" className="text-amber-700/60 text-sm mb-2 block">
                  Confirm Password <span className="text-rose-600">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-700/60 hover:text-amber-700 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-4 bg-rose-100 border border-rose-300 rounded-lg flex items-start gap-3">
                  <AlertCircle size={20} className="text-rose-700 flex-shrink-0 mt-0.5" />
                  <p className="text-rose-700 text-sm">{error}</p>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-lg flex items-start gap-3">
                  <CheckCircle size={20} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                  <p className="text-emerald-700 text-sm">{success}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Staff Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus size={18} />
                    Create Staff Account
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 space-y-4 h-fit">
            <h3 className="font-serif text-lg text-amber-900">Required Fields</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-amber-900 font-medium">Email</p>
                <p className="text-amber-700/60">Unique staff email for login</p>
              </div>
              <div>
                <p className="text-amber-900 font-medium">First & Last Name</p>
                <p className="text-amber-700/60">Staff member's full name</p>
              </div>
              <div>
                <p className="text-amber-900 font-medium">Password</p>
                <p className="text-amber-700/60">Minimum 8 characters, must match confirmation</p>
              </div>
            </div>

            <div className="pt-4 border-t border-amber-200">
              <h3 className="font-serif text-lg text-amber-900 mb-3">Access Level</h3>
              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <p className="text-amber-900 font-medium text-sm">Employee Role</p>
                <p className="text-amber-700/60 text-xs mt-1">
                  Staff members will have access to bookings, menu management, and floor plan features.
                </p>
              </div>
            </div>

            {createdStaff && (
              <div className="pt-4 border-t border-amber-200">
                <h3 className="font-serif text-lg text-amber-900 mb-3">Last Created</h3>
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <p className="text-amber-900 font-medium text-sm">{createdStaff.firstName} {createdStaff.lastName}</p>
                  <p className="text-amber-700/60 text-xs mt-1">{createdStaff.email}</p>
                  <p className="text-emerald-700 text-xs mt-2 flex items-center gap-1">
                    <CheckCircle size={14} />
                    Successfully created
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
