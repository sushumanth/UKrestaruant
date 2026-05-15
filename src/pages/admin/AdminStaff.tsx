import { useEffect, useMemo, useState } from 'react';
import {
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Search,
  PencilLine,
  Trash2,
  MoreVertical,
  X,
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  createStaffMember,
  deleteStaffMember,
  fetchStaffMembers,
  updateStaffMember,
} from '@/frontendapis';

import { useAuthStore } from '@/store';

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
  const currentUser = useAuthStore((state) => state.user);

  const [formData, setFormData] =
    useState<AddStaffFormData>({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
    });

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isListLoading, setIsListLoading] =
    useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState('');

  const [staffMembers, setStaffMembers] =
    useState<User[]>([]);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [editingStaffId, setEditingStaffId] =
    useState<string | null>(null);

  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 5;

  const editingStaff = useMemo(
    () =>
      staffMembers.find(
        (staff) => staff.id === editingStaffId
      ) ?? null,
    [editingStaffId, staffMembers]
  );

  const filteredStaff = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return staffMembers;
    }

    return staffMembers.filter((staff) => {
      const searchable = [
        staff.firstName,
        staff.lastName,
        staff.email,
        staff.role,
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [searchQuery, staffMembers]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStaff.length / itemsPerPage)
  );

  const paginatedStaff = useMemo(
    () =>
      filteredStaff.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [currentPage, filteredStaff]
  );

  const stats = useMemo(
    () => ({
      total: staffMembers.length,
      blocked: staffMembers.filter(
        (staff) => staff.isBlocked
      ).length,
      admins: staffMembers.filter(
        (staff) => staff.role === 'admin'
      ).length,
    }),
    [staffMembers]
  );

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        setIsListLoading(true);

        const items =
          await fetchStaffMembers();

        if (isMounted) {
          setStaffMembers(items);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load staff members'
          );
        }
      } finally {
        if (isMounted) {
          setIsListLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!editingStaff) return;

    setFormData({
      email: editingStaff.email,
      password: '',
      confirmPassword: '',
      firstName: editingStaff.firstName,
      lastName: editingStaff.lastName,
      phone: editingStaff.phone ?? '',
    });

    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [editingStaff]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, staffMembers]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      setError(
        'Please enter a valid email address'
      );
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

    if (!editingStaff) {
      if (!formData.password) {
        setError('Password is required');
        return false;
      }

      if (formData.password.length < 8) {
        setError(
          'Password must be at least 8 characters'
        );
        return false;
      }

      if (
        formData.password !==
        formData.confirmPassword
      ) {
        setError('Passwords do not match');
        return false;
      }
    }

    if (
      formData.password &&
      formData.password.length < 8
    ) {
      setError(
        'Password must be at least 8 characters'
      );
      return false;
    }

    if (
      formData.password &&
      formData.password !==
        formData.confirmPassword
    ) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const refreshStaff = async () => {
    const items = await fetchStaffMembers();

    setStaffMembers(items);
  };

  const clearForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
    });

    setEditingStaffId(null);

    setShowPassword(false);

    setShowConfirmPassword(false);
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    setError('');

    setSuccess('');

    try {
      const nextStaff = editingStaff
        ? await updateStaffMember({
            id: editingStaff.id,
            email: formData.email,
            password:
              formData.password || undefined,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone:
              formData.phone || undefined,
          })
        : await createStaffMember({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone:
              formData.phone || undefined,
          });

      setSuccess(
        editingStaff
          ? `Staff member ${nextStaff.firstName} ${nextStaff.lastName} updated successfully!`
          : `Staff member ${nextStaff.firstName} ${nextStaff.lastName} created successfully!`
      );

      await refreshStaff();

      clearForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save staff member'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (staff: User) => {
    setEditingStaffId(staff.id);

    setOpenMenuId(null);

    setError('');

    setSuccess('');
  };

  const handleDelete = async (
    staff: User
  ) => {
    if (staff.id === currentUser?.id) {
      setError(
        'You cannot delete your own account.'
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete ${staff.firstName} ${staff.lastName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsLoading(true);

      await deleteStaffMember(staff.id);

      await refreshStaff();

      if (editingStaffId === staff.id) {
        clearForm();
      }

      setSuccess(
        `${staff.firstName} ${staff.lastName} deleted successfully.`
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete staff member'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full rounded-[2rem] bg-[linear-gradient(135deg,#f8f4ef_0%,#fdfbf8_45%,#f3ede6_100%)] p-5 text-[#2b1b12]">

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">

        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-[2rem] border border-[#eee1d0] bg-white/80 p-5 shadow-[0_12px_40px_rgba(90,57,31,0.08)] backdrop-blur-xl"
        >

          {/* HEADER */}
          <div className="flex items-start justify-between gap-4">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#efcf96] bg-[#fff5e6] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-[#a5662a]">
                <UserPlus size={13} />
                Staff Management
              </div>

              <h1 className="mt-4 font-serif text-[2.3rem] leading-none text-[#2b1b12]">
                Staff Directory
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#7c5a45]">
                Create, manage, block,
                and edit employee access.
              </p>
            </div>

            {/* STATS */}
            <div className="hidden md:grid grid-cols-3 gap-3 min-w-[290px]">

              <StatCard
                label="Total"
                value={stats.total}
              />

              <StatCard
                label="Admins"
                value={stats.admins}
              />

              <StatCard
                label="Blocked"
                value={stats.blocked}
              />
            </div>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-[1.8rem] border border-[#efe1d0] bg-[#fffdfa] p-5"
          >

            <div className="flex items-center justify-between gap-3">

              <div>

                <h2 className="font-serif text-[1.8rem] leading-none text-[#2b1b12]">
                  {editingStaff
                    ? 'Modify Staff'
                    : 'Create Staff'}
                </h2>

                <p className="mt-1 text-sm text-[#8a6a55]">
                  {editingStaff
                    ? 'Update employee account.'
                    : 'Create secure employee login.'}
                </p>
              </div>

              {editingStaff && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="h-10 w-10 rounded-full border border-[#e5d2b5] bg-white flex items-center justify-center text-[#8b5c34]"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* INPUTS */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">

              <FormInput
                label="Email Address"
                id="email"
                className="md:col-span-2"
              >
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-12 rounded-2xl border-[#e9dac6]"
                  placeholder="staff@example.com"
                  required
                />
              </FormInput>

              <FormInput
                label="First Name"
                id="firstName"
              >
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="h-12 rounded-2xl border-[#e9dac6]"
                  placeholder="John"
                  required
                />
              </FormInput>

              <FormInput
                label="Last Name"
                id="lastName"
              >
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="h-12 rounded-2xl border-[#e9dac6]"
                  placeholder="Doe"
                  required
                />
              </FormInput>

              <FormInput
                label="Phone Number"
                id="phone"
                className="md:col-span-2"
              >
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="h-12 rounded-2xl border-[#e9dac6]"
                  placeholder="+44 7000 000000"
                />
              </FormInput>

              {/* PASSWORD */}
              <div>
                <Label className="mb-2 block text-sm font-medium text-[#6f5442]">
                  Password
                </Label>

                <div className="relative">

                  <Input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-12 rounded-2xl border-[#e9dac6] pr-11"
                    placeholder="••••••••"
                    required={!editingStaff}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b18c72]"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* CONFIRM */}
              <div>
                <Label className="mb-2 block text-sm font-medium text-[#6f5442]">
                  Confirm Password
                </Label>

                <div className="relative">

                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    value={
                      formData.confirmPassword
                    }
                    onChange={handleInputChange}
                    className="h-12 rounded-2xl border-[#e9dac6] pr-11"
                    placeholder="••••••••"
                    required={!editingStaff}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b18c72]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ALERTS */}
            {error && (
              <AlertBox
                type="error"
                message={error}
              />
            )}

            {success && (
              <AlertBox
                type="success"
                message={success}
              />
            )}

            {/* BUTTONS */}
            <div className="mt-6 flex gap-3">

              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 flex-1 rounded-2xl bg-[#b45d12] text-white hover:bg-[#9d4e0f]"
              >
                {isLoading
                  ? editingStaff
                    ? 'Saving...'
                    : 'Creating...'
                  : editingStaff
                  ? 'Save Changes'
                  : 'Create Staff'}
              </Button>

              {editingStaff && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearForm}
                  className="h-12 rounded-2xl border-[#dcc7ab]"
                >
                  Reset
                </Button>
              )}
            </div>
          </form>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-[1.5rem] border border-[#f0e2cf] bg-transparent p-1 shadow-none backdrop-blur-0"
        >

          {/* TOP */}
          <div className="flex items-center justify-between gap-3 px-2">

            <div>

              <h2 className="font-serif text-[1.9rem] leading-none text-[#2b1b12]">
                Staff Members
              </h2>

              <p className="mt-1 text-sm text-[#8a6a55]">
                Manage registered staff.
              </p>
            </div>

            <div className="rounded-full border border-[#ead7be] bg-[#fff9f0] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#a5662a]">
              {filteredStaff.length}
            </div>
          </div>

          {/* SEARCH */}
          <div className="mt-4 relative px-2">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b18c72]"
            />

            <Input
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search staff..."
              className="h-12 rounded-2xl border-[#e4d2b6] pl-11"
            />
          </div>

          {/* LIST */}
          <div className="mt-4 space-y-3 px-2">

            {paginatedStaff.map((staff) => {
              const isCurrentUser =
                currentUser?.id === staff.id;

              return (
                <div
                  key={staff.id}
                  className="relative rounded-2xl border border-[#eee1d0] bg-[#fffdfa] px-4 py-4"
                >

                  <div className="flex items-center justify-between gap-3">

                    {/* USER */}
                    <div className="min-w-0">

                      <p className="truncate font-medium text-[#2b1b12]">
                        {staff.firstName}{' '}
                        {staff.lastName}
                      </p>

                      <div className="mt-1 flex items-center gap-2 flex-wrap">

                        <span className="text-xs text-[#8b6b57]">
                          {staff.email}
                        </span>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            staff.isBlocked
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {staff.isBlocked
                            ? 'Blocked'
                            : 'Active'}
                        </span>
                      </div>
                    </div>

                    {/* MENU */}
                    <div className="relative">

                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId ===
                              staff.id
                              ? null
                              : staff.id
                          )
                        }
                        className="h-10 w-10 rounded-full border border-[#e9dac6] bg-white flex items-center justify-center text-[#7a4c22]"
                      >
                        <MoreVertical
                          size={18}
                        />
                      </button>

                      <AnimatePresence>
                        {openMenuId ===
                          staff.id && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              y: 10,
                              scale: 0.96,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              scale: 1,
                            }}
                            exit={{
                              opacity: 0,
                              y: 10,
                              scale: 0.96,
                            }}
                            transition={{
                              duration: 0.16,
                            }}
                            className="absolute right-0 top-12 z-30 w-48 overflow-hidden rounded-2xl border border-[#ead7be] bg-white shadow-[0_15px_35px_rgba(0,0,0,0.08)]"
                          >

                            <MenuButton
                              onClick={() => {
                                handleEdit(
                                  staff
                                );
                              }}
                              icon={
                                <PencilLine
                                  size={16}
                                />
                              }
                              label="Modify"
                            />

                            <MenuButton
                              danger
                              disabled={
                                isCurrentUser
                              }
                              onClick={() => {
                                handleDelete(
                                  staff
                                );
                              }}
                              icon={
                                <Trash2
                                  size={16}
                                />
                              }
                              label="Delete"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              );
            })}

            {!isListLoading &&
              filteredStaff.length === 0 && (
                <div className="rounded-2xl border border-[#eee1d0] bg-[#fffdfa] px-6 py-16 text-center">

                  <p className="font-medium text-[#7c5a45]">
                    No staff members found.
                  </p>

                  <p className="mt-1 text-sm text-[#a08269]">
                    Try another search.
                  </p>
                </div>
              )}

            {isListLoading && (
              <div className="rounded-2xl border border-[#eee1d0] bg-[#fffdfa] px-6 py-16 text-center text-[#8a6a55]">
                Loading staff members...
              </div>
            )}

            {!isListLoading && filteredStaff.length > 0 && (
              <div className="mt-5 flex items-center justify-between gap-3 rounded-[1.25rem] border border-[#ead7be] bg-[#fff9f0] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a5662a]">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="h-10 rounded-full border-[#dcc7ab] bg-white px-4 text-[#7a4c22] hover:bg-[#fff4e6]"
                  >
                    Previous
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="h-10 rounded-full border-[#dcc7ab] bg-white px-4 text-[#7a4c22] hover:bg-[#fff4e6]"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => (
  <div className="rounded-2xl border border-[#ead7be] bg-[#fffaf3] p-3 text-center">

    <p className="text-[10px] uppercase tracking-[0.18em] text-[#ab7b48]">
      {label}
    </p>

    <p className="mt-1 font-serif text-2xl text-[#2b1b12]">
      {value}
    </p>
  </div>
);

const FormInput = ({
  label,
  id,
  children,
  className = '',
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <Label
      htmlFor={id}
      className="mb-2 block text-sm font-medium text-[#6f5442]"
    >
      {label}
    </Label>

    {children}
  </div>
);

const AlertBox = ({
  type,
  message,
}: {
  type: 'error' | 'success';
  message: string;
}) => (
  <div
    className={`mt-5 flex items-start gap-3 rounded-2xl px-4 py-3 ${
      type === 'error'
        ? 'border border-rose-200 bg-rose-50 text-rose-700'
        : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
    }`}
  >
    {type === 'error' ? (
      <AlertCircle
        size={18}
        className="mt-0.5 shrink-0"
      />
    ) : (
      <CheckCircle
        size={18}
        className="mt-0.5 shrink-0"
      />
    )}

    <p className="text-sm">{message}</p>
  </div>
);

const MenuButton = ({
  onClick,
  icon,
  label,
  danger,
  disabled,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  disabled?: boolean;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`flex w-full items-center gap-3 px-4 py-3 text-sm ${
      disabled
        ? 'cursor-not-allowed opacity-40'
        : danger
        ? 'text-rose-700 hover:bg-rose-50'
        : 'text-[#5d3a1f] hover:bg-[#fff5ea]'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default AdminStaff;