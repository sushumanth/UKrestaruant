import type { CustomerAccount } from '@/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type AuthUserLike = {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
};

const normalizePhone = (value: string) => value.trim();

const toCustomerAccount = (user: AuthUserLike): CustomerAccount | null => {
  if (!user.email) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.user_metadata?.first_name ?? '',
    lastName: user.user_metadata?.last_name ?? '',
    phone: user.user_metadata?.phone ?? '',
    createdAt: user.created_at ?? new Date().toISOString(),
  };
};

export const signUpCustomer = async (payload: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
}): Promise<{ customer?: CustomerAccount; error?: string }> => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      error: 'Supabase auth is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  const email = payload.email.trim().toLowerCase();
  const phone = normalizePhone(payload.phone);

  const { data, error } = await supabase.auth.signUp({
    email,
    password: payload.password,
    options: {
      data: {
        first_name: payload.firstName.trim(),
        last_name: payload.lastName.trim(),
        phone,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: 'Unable to create account right now. Please try again.' };
  }

  const customer = toCustomerAccount(data.user);

  if (!customer) {
    return { error: 'Unable to resolve account details from Supabase.' };
  }

  return { customer };
};

export const signInCustomer = async (
  emailInput: string,
  password: string
): Promise<{ customer?: CustomerAccount; error?: string }> => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      error: 'Supabase auth is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  const email = emailInput.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: error?.message ?? 'Invalid email or password.' };
  }

  const customer = toCustomerAccount(data.user);

  if (!customer) {
    return { error: 'Unable to resolve account details from Supabase.' };
  }

  return { customer };
};

export const resolveCurrentCustomer = async (): Promise<CustomerAccount | null> => {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.user) {
    return null;
  }

  return toCustomerAccount(data.session.user);
};

export const signOutCustomer = async (): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  await supabase.auth.signOut();
};
