import { clearStoredAuthSession, getStoredAuthSession, setStoredAuthSession } from './backendApi';

type ChannelLike = {
  on: (
    _eventName: string,
    _filter: Record<string, unknown>,
    _callback: (payload: { eventType: string }) => void
  ) => ChannelLike;
  subscribe: () => ChannelLike;
};

const createChannel = (): ChannelLike => ({
  on: (_eventName, _filter, _callback) => createChannel(),
  subscribe: () => createChannel(),
});

export const isBackendConfigured = true;

export const backendClient = {
  auth: {
    getSession: async () => {
      const session = getStoredAuthSession();
      return {
        data: {
          session: session ? { access_token: session.token, user: session.user } : null,
        },
        error: null,
      };
    },
    signOut: async () => {
      clearStoredAuthSession();
      return { error: null };
    },
    signInWithPassword: async () => ({
      data: { user: null },
      error: new Error('Use backend helpers for authentication.'),
    }),
    signUp: async () => ({
      data: { user: null },
      error: new Error('Use backend helpers for authentication.'),
    }),
  },
  channel: (_name?: string) => createChannel(),
  removeChannel: async (_channel?: ChannelLike) => undefined,
};

export const setBackendAuthSession = setStoredAuthSession;
