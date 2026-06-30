'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import type {
  GoogleLoginInput,
  LoginInput,
  LoginResponse,
  SetPasswordInput,
  UpdateUserSettingsInput,
  UserResponse,
} from '@writer-mentor-ai/shared/auth';
import { apiFetch, ApiClientError } from '@/lib/api/client';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/auth/token';
import { useUiStore } from '@/lib/stores/ui-store';

type AuthContextValue = {
  user: UserResponse | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  googleLogin: (input: GoogleLoginInput) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateSettings: (input: UpdateUserSettingsInput) => Promise<UserResponse>;
  setPassword: (input: SetPasswordInput) => Promise<UserResponse>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function applyUserPreferences(user: UserResponse) {
  if (user.defaultMentorTypeId) {
    useUiStore.getState().setDefaultMentorTypeId(user.defaultMentorTypeId);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthSuccess = useCallback(
    (response: LoginResponse) => {
      setAccessToken(response.accessToken);
      setUser(response.user);
      applyUserPreferences(response.user);
    },
    [],
  );

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const profile = await apiFetch<UserResponse>('/auth/me');
      setUser(profile);
      applyUserPreferences(profile);
    } catch (error) {
      if (error instanceof ApiClientError && error.statusCode === 401) {
        clearAccessToken();
        setUser(null);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    refreshUser()
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(
    async (input: LoginInput) => {
      const response = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      handleAuthSuccess(response);
    },
    [handleAuthSuccess],
  );

  const googleLogin = useCallback(
    async (input: GoogleLoginInput) => {
      const response = await apiFetch<LoginResponse>('/auth/google', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      handleAuthSuccess(response);
    },
    [handleAuthSuccess],
  );

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
    router.push('/login' as Route);
  }, [router]);

  const updateSettings = useCallback(async (input: UpdateUserSettingsInput) => {
    const updated = await apiFetch<UserResponse>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    setUser(updated);
    applyUserPreferences(updated);
    return updated;
  }, []);

  const setPassword = useCallback(async (input: SetPasswordInput) => {
    const updated = await apiFetch<UserResponse>('/auth/password', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      googleLogin,
      logout,
      refreshUser,
      updateSettings,
      setPassword,
    }),
    [user, isLoading, login, googleLogin, logout, refreshUser, updateSettings, setPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
