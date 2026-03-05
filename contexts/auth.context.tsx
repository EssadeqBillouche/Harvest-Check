import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Farmer, AuthState } from '@/types';
import {
  registerFarmer,
  signIn,
  signOut,
  getFarmerProfile,
  updateFarmerProfile,
  onAuthChange,
} from '@/services/auth.service';
import { FarmerFormData } from '@/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<FarmerFormData>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const farmer = await getFarmerProfile(firebaseUser.uid);
          setState({
            user: farmer,
            isLoading: false,
            isAuthenticated: !!farmer,
          });
        } catch {
          setState({ user: null, isLoading: false, isAuthenticated: false });
        }
      } else {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const farmer = await signIn(email, password);
      setState({ user: farmer, isLoading: false, isAuthenticated: true });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const farmer = await registerFarmer(email, password, displayName);
        setState({ user: farmer, isLoading: false, isAuthenticated: true });
      } catch (error) {
        setState((prev) => ({ ...prev, isLoading: false }));
        throw error;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await signOut();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const updateProfileFn = useCallback(
    async (data: Partial<FarmerFormData>) => {
      if (!state.user) return;
      await updateFarmerProfile(state.user.uid, data);
      setState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...data } : null,
      }));
    },
    [state.user],
  );

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const farmer = await getFarmerProfile(state.user.uid);
    if (farmer) {
      setState((prev) => ({ ...prev, user: farmer }));
    }
  }, [state.user]);

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      updateProfile: updateProfileFn,
      refreshProfile,
    }),
    [state, login, register, logout, updateProfileFn, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
