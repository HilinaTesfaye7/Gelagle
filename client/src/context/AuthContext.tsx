import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { SafeUser, ProjectMembershipInfo } from '../types/client.types.js';

interface AuthContextType {
  user: SafeUser | null;
  token: string | null;
  memberships: ProjectMembershipInfo[];
  permissions: string[];
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  quickLoginAs: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cmd_token'));
  const [memberships, setMemberships] = useState<ProjectMembershipInfo[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      if (!localStorage.getItem('cmd_token')) {
        setUser(null);
        setMemberships([]);
        setPermissions([]);
        setLoading(false);
        return;
      }
      const data = await api.auth.me();
      setUser(data.user);
      setMemberships(data.memberships);
      setPermissions(data.grantedPermissions);
    } catch {
      localStorage.removeItem('cmd_token');
      setToken(null);
      setUser(null);
      setMemberships([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, pass: string) => {
    const res = await api.auth.login(identifier, pass);
    localStorage.setItem('cmd_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setMemberships(res.memberships);
    // Refresh to get full permissions
    await refreshUser();
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {}
    localStorage.removeItem('cmd_token');
    setToken(null);
    setUser(null);
    setMemberships([]);
    setPermissions([]);
  };

  const quickLoginAs = async (email: string) => {
    await login(email, 'Password123!');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        memberships,
        permissions,
        loading,
        login,
        logout,
        quickLoginAs,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
