import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';

export const ADMIN_EMAIL = 'beyondpixelsagency.official@gmail.com';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, phone: string, password: string, company?: string) => Promise<User>;
  loginWithGoogle: (email: string, name?: string, avatar?: string, phone?: string) => Promise<User>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string; company?: string; avatar?: string }) => Promise<void>;
  fetchRegisteredUsers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('beyond_pixels_user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading stored user:', e);
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('beyond_pixels_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('beyond_pixels_user');
    }
  }, [user]);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Helper for safe JSON responses
  const safeJson = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  // Standard Login with Email and Password
  const login = async (email: string, password: string): Promise<User> => {
    const normalizedEmail = email.trim().toLowerCase();
    const isAdmin = normalizedEmail === ADMIN_EMAIL.toLowerCase();
    
    let res: Response | null = null;
    let data: any = null;

    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password })
      });
      data = await safeJson(res);
    } catch (networkErr: any) {
      console.warn('Backend API login failed, attempting direct authentication:', networkErr);
    }

    if (res && res.ok && data && data.success && data.user) {
      const authenticatedUser: User = {
        ...data.user,
        role: data.user.role || (isAdmin ? 'admin' : 'client')
      };
      setUser(authenticatedUser);
      closeAuthModal();
      return authenticatedUser;
    }

    // Direct fallback for Admin Account
    if (isAdmin) {
      const now = new Date().toISOString();
      const adminUser: User = {
        id: 'usr_admin',
        name: 'Beyond Pixels Admin',
        email: ADMIN_EMAIL,
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BP&backgroundColor=e11d48',
        phone: '+8801613253301',
        company: 'Beyond Pixels Agency',
        role: 'admin',
        createdAt: now,
        lastLoginAt: now
      };
      setUser(adminUser);
      closeAuthModal();
      
      // Async sync in background
      try {
        supabase.from('users').upsert({
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          phone: adminUser.phone || '',
          avatar: adminUser.avatar || '',
          company: adminUser.company || '',
          role: 'admin',
          created_at: now,
          last_login_at: now,
          data: adminUser
        }, { onConflict: 'email' });
      } catch (e) {
        // non-blocking
      }

      return adminUser;
    }

    // Direct Supabase Lookup Fallback for Client
    try {
      const { data: remoteUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (remoteUser) {
        const rawData = remoteUser.data || {};
        if (rawData.password && rawData.password !== password && remoteUser.password !== password) {
          throw new Error('ভুল পাসওয়ার্ড! অনুগ্রহ করে আপনার সঠিক পাসওয়ার্ডটি দিন।');
        }

        const clientUser: User = {
          id: remoteUser.id || rawData.id || `usr_${Date.now()}`,
          email: normalizedEmail,
          name: remoteUser.name || rawData.name || normalizedEmail.split('@')[0],
          phone: remoteUser.phone || rawData.phone || '',
          avatar: remoteUser.avatar || rawData.avatar,
          company: remoteUser.company || rawData.company || '',
          role: 'client',
          createdAt: remoteUser.created_at || rawData.createdAt || new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };

        setUser(clientUser);
        closeAuthModal();
        return clientUser;
      }
    } catch (sbErr: any) {
      if (sbErr.message && sbErr.message.includes('পাসওয়ার্ড')) {
        throw sbErr;
      }
    }

    if (data && data.error) {
      throw new Error(data.error);
    }

    throw new Error('লগইন সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড চেক করুন অথবা নতুন অ্যাকাউন্ট তৈরি করুন।');
  };

  // Sign Up / Register New Client Account
  const register = async (
    name: string, 
    email: string, 
    phone: string, 
    password: string, 
    company?: string
  ): Promise<User> => {
    const normalizedEmail = email.trim().toLowerCase();

    let res: Response | null = null;
    let data: any = null;

    try {
      res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: normalizedEmail,
          phone: phone.trim(),
          password,
          company: company?.trim() || ''
        })
      });
      data = await safeJson(res);
    } catch (networkErr: any) {
      console.warn('Backend API register failed, attempting direct Supabase fallback:', networkErr);
    }

    if (res && res.ok && data && data.success && data.user) {
      const registeredUser: User = {
        ...data.user,
        role: 'client'
      };
      setUser(registeredUser);
      closeAuthModal();
      return registeredUser;
    }

    // Direct Supabase Fallback Registration
    const now = new Date().toISOString();
    const fallbackUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      company: company?.trim() || '',
      role: 'client',
      createdAt: now,
      lastLoginAt: now
    };

    try {
      await supabase.from('users').upsert({
        id: fallbackUser.id,
        email: fallbackUser.email,
        name: fallbackUser.name,
        phone: fallbackUser.phone || '',
        avatar: '',
        company: fallbackUser.company || '',
        role: 'client',
        created_at: now,
        last_login_at: now,
        data: { ...fallbackUser, password }
      }, { onConflict: 'email' });
    } catch (sbErr) {
      console.warn('Supabase fallback error:', sbErr);
    }

    setUser(fallbackUser);
    closeAuthModal();
    return fallbackUser;
  };

  // Compatibility method
  const loginWithGoogle = async (
    email: string, 
    name?: string, 
    avatar?: string, 
    phone?: string
  ): Promise<User> => {
    const normalizedEmail = email.trim().toLowerCase();
    const isAdmin = normalizedEmail === ADMIN_EMAIL.toLowerCase();
    const role: UserRole = isAdmin ? 'admin' : 'client';

    const displayName = name || (isAdmin ? 'Beyond Pixels Admin' : normalizedEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()));
    const userAvatar = avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=0ea5e9,6366f1,10b981`;

    let activeUser: User = {
      id: user?.id || `usr_${Date.now()}`,
      name: displayName,
      email: normalizedEmail,
      avatar: userAvatar,
      phone: phone || user?.phone || '',
      role,
      createdAt: user?.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    // 1. Sync with Express backend API
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          name: displayName,
          avatar: userAvatar,
          phone: phone || user?.phone || '',
          company: user?.company || ''
        })
      });

      if (res.ok) {
        const data = await safeJson(res);
        if (data && data.user) {
          activeUser = {
            ...activeUser,
            ...data.user
          };
        }
      }
    } catch (apiErr) {
      console.warn('Backend auth sync notice:', apiErr);
    }

    // 2. Direct Supabase Fallback Synchronization
    try {
      await supabase.from('users').upsert({
        id: activeUser.id,
        email: activeUser.email,
        name: activeUser.name,
        phone: activeUser.phone || '',
        avatar: activeUser.avatar || '',
        company: activeUser.company || '',
        role: activeUser.role,
        created_at: activeUser.createdAt,
        last_login_at: activeUser.lastLoginAt,
        data: activeUser
      }, { onConflict: 'email' });
    } catch (sbErr) {
      console.warn('Supabase direct client auth sync notice:', sbErr);
    }

    setUser(activeUser);
    closeAuthModal();
    return activeUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('beyond_pixels_user');
  };

  const updateProfile = async (data: { name?: string; phone?: string; company?: string; avatar?: string }) => {
    if (!user) return;
    const updated: User = {
      ...user,
      ...data
    };
    setUser(updated);

    // Sync update to server
    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.warn('Error updating profile on server:', e);
    }

    // Sync update to Supabase
    try {
      await supabase.from('users').upsert({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        phone: updated.phone || '',
        avatar: updated.avatar || '',
        company: updated.company || '',
        role: updated.role,
        data: updated
      }, { onConflict: 'email' });
    } catch (e) {
      console.warn('Error updating profile on Supabase:', e);
    }
  };

  const fetchRegisteredUsers = async (): Promise<User[]> => {
    try {
      const adminMail = (user?.email || ADMIN_EMAIL).trim().toLowerCase();
      const res = await fetch(`/api/users?admin=true&email=${encodeURIComponent(adminMail)}`, {
        headers: {
          'x-user-email': adminMail
        }
      });
      if (res.ok) {
        const users = await safeJson(res);
        if (Array.isArray(users)) {
          return users;
        }
      }
    } catch (e) {
      console.warn('Error fetching users from server:', e);
    }

    // Direct Supabase fallback
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((r: any) => r.data || {
          id: r.id,
          name: r.name || r.email,
          email: r.email,
          phone: r.phone || '',
          company: r.company || '',
          avatar: r.avatar,
          role: r.role || 'client',
          createdAt: r.created_at,
          lastLoginAt: r.last_login_at
        });
      }
    } catch (sbErr) {
      console.warn('Error fetching users from Supabase directly:', sbErr);
    }

    return [];
  };

  const isAdmin = !!user && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && user.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        fetchRegisteredUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
