import type { CustomerAccount } from '@/types';
import { backendRequest, getStoredAuthSession, mapBackendUser, setStoredAuthSession, clearStoredAuthSession } from './backendApi';

type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'admin' | 'employee' | 'customer';
    firstName: string;
    lastName: string;
    phone?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
};

const toCustomerAccount = (user: AuthResponse['user']): CustomerAccount => {
  const mapped = mapBackendUser(user);

  return {
    id: mapped.id,
    email: mapped.email,
    firstName: mapped.firstName,
    lastName: mapped.lastName,
    phone: mapped.phone ?? '',
    createdAt: mapped.createdAt,
  };
};

export const signUpCustomer = async (payload: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
}): Promise<{ customer?: CustomerAccount; error?: string }> => {
  try {
    const response = await backendRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      auth: false,
      body: {
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        phone: payload.phone.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      },
    });

    setStoredAuthSession({ token: response.token, user: response.user });
    return { customer: toCustomerAccount(response.user) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to create account right now. Please try again.' };
  }
};

export const signInCustomer = async (
  emailInput: string,
  password: string
): Promise<{ customer?: CustomerAccount; error?: string }> => {
  try {
    const response = await backendRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: {
        email: emailInput.trim().toLowerCase(),
        password,
      },
    });

    if (response.user.role !== 'customer') {
      return { error: 'This account is not a customer account.' };
    }

    setStoredAuthSession({ token: response.token, user: response.user });
    return { customer: toCustomerAccount(response.user) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Invalid email or password.' };
  }
};

export const resolveCurrentCustomer = async (): Promise<CustomerAccount | null> => {
  const session = getStoredAuthSession();

  if (!session) {
    return null;
  }

  try {
    const response = await backendRequest<AuthResponse>('/auth/me');

    if (response.user.role !== 'customer') {
      return null;
    }

    return toCustomerAccount(response.user);
  } catch {
    return session.user.role === 'customer' ? toCustomerAccount(session.user as AuthResponse['user']) : null;
  }
};

export const signOutCustomer = async (): Promise<void> => {
  clearStoredAuthSession();
};