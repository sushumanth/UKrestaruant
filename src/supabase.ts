import { clearStoredAuthSession, getStoredAuthSession, setStoredAuthSession } from './backendApi';

type ChannelLike = {
  on: (
    eventName: string,
    filter: Record<string, unknown>,
    callback: (payload: { eventType: string }) => void
  ) => ChannelLike;
  subscribe: () => ChannelLike;
};

const createChannel = (): ChannelLike => ({
  on: (eventName, filter, callback) => {
    void eventName;
    void filter;
    void callback;
    return createChannel();
  },
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
  channel: (name?: string) => {
    void name;
    return createChannel();
  },
  removeChannel: async (channel?: ChannelLike) => {
    void channel;
    return undefined;
  },
};

export const setBackendAuthSession = setStoredAuthSession;
