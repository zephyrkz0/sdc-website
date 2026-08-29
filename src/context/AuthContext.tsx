import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { memberService } from '../services/memberService';
import { ticketService } from '../services/ticketService';

export interface EmailDispatch {
  id: string;
  type: 'VERIFY_ACCOUNT' | 'RESET_PASSWORD';
  toEmail: string;
  subject: string;
  token: string;
  timestamp: string;
  username?: string;
  name?: string;
  callsign?: string;
}

interface AuthContextType {
  currentUser: UserAccount | null;
  isAdmin: boolean;
  isMasterAdmin: boolean;
  allUsers: UserAccount[];
  pendingEmailDispatch: EmailDispatch | null;
  setPendingEmailDispatch: (dispatch: EmailDispatch | null) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  signIn: (email: string, password?: string) => { success: boolean; isNewUser?: boolean; message?: string };
  signUp: (email: string, firstName: string, lastName: string, username: string, password?: string) => { success: boolean; message: string };
  verifyEmailAndSetPassword: (email: string, password: string, profileData?: Partial<UserAccount>) => boolean;
  sendPasswordReset: (email: string) => boolean;
  resetPassword: (email: string, newPassword: string) => boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<{ success: boolean; message: string }>;
  updateUserProfile: (data: Partial<UserAccount>) => void;
  assignAdminRole: (userId: string, targetRole: UserRole) => { success: boolean; message: string };
  toggleAdminRole: (userId: string) => { success: boolean; message: string };
  updateUserRoleAndPosition: (userId: string, targetRole: UserRole, customPositionTitle?: string) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USERS_KEY = 'sdc_users_accounts_v2';
const LOCAL_STORAGE_SESSION_KEY = 'sdc_active_session_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      if (saved) {
        const parsed: UserAccount[] = JSON.parse(saved);
        return parsed
          .filter((u) => u.id !== 'usr-master-admin-01' && u.email !== 'admin@sdc.internal' && u.username !== 'admin')
          .map((u) => {
            if (u.email?.toLowerCase().includes('kashinath') || u.username?.toLowerCase().includes('kashinath')) {
              return { ...u, role: 'MASTER_ADMIN' as const };
            }
            return u;
          });
      }
    } catch {}
    return [];
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (saved) {
        const parsed: UserAccount = JSON.parse(saved);
        if (parsed.email?.toLowerCase().includes('kashinath') || parsed.username?.toLowerCase().includes('kashinath')) {
          parsed.role = 'MASTER_ADMIN';
        }
        return parsed;
      }
    } catch {}
    return null;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingEmailDispatch, setPendingEmailDispatch] = useState<EmailDispatch | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(allUsers));
    } catch {}
  }, [allUsers]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
      }
    } catch {}
  }, [currentUser]);

  // Listen to Supabase Auth state if configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const email = session.user.email || '';
        const userMeta = session.user.user_metadata || {};
        const firstName = userMeta.full_name?.split(' ')[0] || userMeta.first_name || '';
        const lastName = userMeta.full_name?.split(' ').slice(1).join(' ') || userMeta.last_name || '';
        const username = userMeta.user_name || userMeta.preferred_username || '';
        const avatarUrl = userMeta.avatar_url || userMeta.picture || userMeta.avatar || '';
        
        const isSuperAdminEmail = email.toLowerCase().includes('kashinath') || email.toLowerCase() === 'kashinath.r2017@gmail.com' || username.toLowerCase().includes('kashinath');
        const role: UserRole = isSuperAdminEmail ? 'MASTER_ADMIN' : 'MEMBER';

        const existing = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          const updatedUser: UserAccount = {
            ...existing,
            avatarUrl: existing.avatarUrl || avatarUrl,
            role: isSuperAdminEmail ? 'MASTER_ADMIN' : existing.role,
          };
          setCurrentUser(updatedUser);
        } else {
          const newUser: UserAccount = {
            id: session.user.id,
            username: username || email.split('@')[0],
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`.trim() || email.split('@')[0],
            email,
            role,
            track: 'CORE_CODE',
            avatarUrl,
            bio: 'Member of CUCEK Skill Development Club.',
            skills: ['Web Development', 'React'],
            projects: [],
            hoursContributed: 0,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            isVerified: true,
          };
          setAllUsers((prev) => [...prev, newUser]);
          setCurrentUser(newUser);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [allUsers]);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'MASTER_ADMIN';
  const isMasterAdmin = currentUser?.role === 'MASTER_ADMIN';

  const signIn = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = allUsers.find((u) => u.email.toLowerCase() === cleanEmail || u.username?.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, message: 'Account not found. Please register first.' };
    }

    if (password && user.passwordHash && user.passwordHash !== password) {
      return { success: false, message: 'Invalid password. Please try again or reset password.' };
    }

    setCurrentUser(user);
    return { success: true, message: `Welcome back, @${user.username}!` };
  };

  const signUp = (email: string, firstName: string, lastName: string, username: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    if (allUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email already exists. Please sign in.' };
    }

    if (allUsers.some((u) => u.username?.toLowerCase() === cleanUsername)) {
      return { success: false, message: 'This username is already taken. Please choose another.' };
    }

    const isSuperAdminEmail = cleanEmail.includes('kashinath') || cleanUsername.includes('kashinath');
    const role: UserRole = isSuperAdminEmail ? 'MASTER_ADMIN' : 'MEMBER';

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      username: cleanUsername,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      email: cleanEmail,
      passwordHash: password,
      role,
      track: 'CORE_CODE',
      avatarUrl: '',
      bio: 'Member of CUCEK Skill Development Club.',
      skills: ['Web Development', 'React'],
      projects: [],
      hoursContributed: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      isVerified: true,
    };

    setAllUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);

    memberService.createOrUpdateMember({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role === 'MASTER_ADMIN' ? 'Super Admin' : 'Member',
      track: 'Web Development',
    });

    return { success: true, message: `Account created successfully. Welcome, @${newUser.username}!` };
  };

  const verifyEmailAndSetPassword = (email: string, password: string, profileData?: Partial<UserAccount>) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      const updated: UserAccount = {
        ...existing,
        passwordHash: password,
        isVerified: true,
        ...profileData,
      };
      setAllUsers((prev) => prev.map((u) => (u.id === existing.id ? updated : u)));
      setCurrentUser(updated);
      setPendingEmailDispatch(null);
      return true;
    }

    const isSuperAdminEmail = cleanEmail.includes('kashinath');
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      username: profileData?.username || cleanEmail.split('@')[0],
      firstName: profileData?.firstName || profileData?.fullName?.split(' ')[0] || '',
      lastName: profileData?.lastName || profileData?.fullName?.split(' ').slice(1).join(' ') || '',
      fullName: profileData?.fullName || cleanEmail.split('@')[0],
      email: cleanEmail,
      passwordHash: password,
      role: isSuperAdminEmail ? 'MASTER_ADMIN' : 'MEMBER',
      track: 'CORE_CODE',
      avatarUrl: '',
      bio: 'Member of CUCEK Skill Development Club.',
      skills: ['Web Development', 'React'],
      projects: [],
      hoursContributed: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      isVerified: true,
    };

    setAllUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setPendingEmailDispatch(null);
    return true;
  };

  const sendPasswordReset = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    setPendingEmailDispatch({
      id: `disp-${Date.now()}`,
      type: 'RESET_PASSWORD',
      toEmail: cleanEmail,
      subject: 'SDC Account — Password Reset',
      token: `tok_${Math.random().toString(36).substring(2, 10)}`,
      timestamp: new Date().toISOString(),
    });
    return true;
  };

  const resetPassword = (email: string, newPassword: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) return false;

    const updated = { ...user, passwordHash: newPassword };
    setAllUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    setCurrentUser(updated);
    setPendingEmailDispatch(null);
    return true;
  };

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
    } else {
      const demoUser: UserAccount = {
        id: 'usr-google-demo',
        username: 'google_user',
        firstName: 'Google',
        lastName: 'User',
        fullName: 'Google User',
        email: 'user@gmail.com',
        role: 'MEMBER',
        track: 'CORE_CODE',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        bio: 'CUCEK Member (Signed in with Google)',
        skills: ['Web Development', 'React'],
        projects: [],
        hoursContributed: 10,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        isVerified: true,
      };
      setAllUsers((prev) => (prev.some((u) => u.id === demoUser.id) ? prev : [demoUser, ...prev]));
      setCurrentUser(demoUser);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setCurrentUser(null);
  };

  const deleteAccount = async () => {
    if (!currentUser) {
      return { success: false, message: 'No authenticated user session.' };
    }

    const { id, email, username } = currentUser;

    try {
      await memberService.deleteMemberByIdentity(email, username, id);
      await ticketService.deleteTicketsByUser(email, username, id);
      if (isSupabaseConfigured()) {
        try {
          await supabase.auth.signOut();
        } catch {}
      }
    } catch (err) {
      console.warn('Backend cleanup note:', err);
    }

    setAllUsers((prev) => prev.filter((u) => u.id !== id && u.email !== email));
    setCurrentUser(null);
    return { success: true, message: 'Account permanently deleted.' };
  };

  const updateUserProfile = (data: Partial<UserAccount>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
  };

  const assignAdminRole = (userId: string, targetRole: UserRole) => {
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return { success: false, message: 'User not found.' };

    const updated = { ...user, role: targetRole };
    setAllUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    if (currentUser?.id === userId) {
      setCurrentUser(updated);
    }
    return { success: true, message: `Role updated for @${user.username} to ${targetRole}.` };
  };

  const toggleAdminRole = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return { success: false, message: 'User not found.' };

    const nextRole: UserRole = user.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    return assignAdminRole(userId, nextRole);
  };

  const updateUserRoleAndPosition = (userId: string, targetRole: UserRole, customPositionTitle?: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return { success: false, message: 'User not found.' };

    const updated: UserAccount = {
      ...user,
      role: targetRole,
      roleTitle: customPositionTitle || (targetRole === 'MASTER_ADMIN' ? 'Super Admin' : targetRole === 'ADMIN' ? 'Admin' : 'Member'),
    };

    setAllUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    if (currentUser?.id === userId) {
      setCurrentUser(updated);
    }
    return { success: true, message: `Role updated for @${user.username} to ${targetRole} [${updated.roleTitle}].` };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isMasterAdmin,
        allUsers,
        pendingEmailDispatch,
        setPendingEmailDispatch,
        authModalOpen,
        setAuthModalOpen,
        signIn,
        signUp,
        verifyEmailAndSetPassword,
        sendPasswordReset,
        resetPassword,
        loginWithGoogle,
        logout,
        deleteAccount,
        updateUserProfile,
        assignAdminRole,
        toggleAdminRole,
        updateUserRoleAndPosition,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;