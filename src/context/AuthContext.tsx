import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserAccount, UserRole, ClubMember } from '../types';
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
  isSuperAdmin: boolean;
  isMasterAdmin: boolean;
  allUsers: UserAccount[];
  pendingEmailDispatch: EmailDispatch | null;
  setPendingEmailDispatch: (dispatch: EmailDispatch | null) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; isNewUser?: boolean; message?: string }>;
  signUp: (email: string, firstName: string, lastName: string, username: string, password?: string) => Promise<{ success: boolean; message: string; requiresVerification?: boolean }>;
  verifyEmailAndSetPassword: (email: string, password: string, profileData?: Partial<UserAccount>) => Promise<boolean> | boolean;
  sendPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  loginWithGoogle: (options?: {
    onStatusChange?: (status: 'INITIALIZING' | 'CONTACTING_GOOGLE' | 'AWAITING_POPUP' | 'VERIFYING_SESSION' | 'REDIRECTING' | 'SUCCESS' | 'ERROR') => void;
  }) => Promise<{ success: boolean; redirected?: boolean; error?: string }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; message: string }>;
  updateUserProfile: (data: Partial<UserAccount>) => Promise<void>;
  assignAdminRole: (userId: string, targetRole: UserRole) => Promise<{ success: boolean; message: string }>;
  toggleAdminRole: (userId: string) => Promise<{ success: boolean; message: string }>;
  updateUserRoleAndPosition: (userId: string, targetRole: UserRole, customPositionTitle?: string) => Promise<{ success: boolean; message: string }>;
  clearAllCachedData: () => void;
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
            // Strip out dead blob URLs
            if (u.avatarUrl?.startsWith('blob:')) {
              u.avatarUrl = '';
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
        if (parsed.avatarUrl?.startsWith('blob:')) {
          parsed.avatarUrl = '';
        }
        return parsed;
      }
    } catch {}
    return null;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingEmailDispatch, setPendingEmailDispatch] = useState<EmailDispatch | null>(null);

  // Sync state to localStorage cache
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

  // Synchronize and update user profile from Supabase server
  const syncMemberProfileFromSupabase = useCallback(async (authUser: any): Promise<UserAccount | null> => {
    if (!authUser || !isSupabaseConfigured()) return null;

    const email = (authUser.email || '').toLowerCase().trim();
    const userMeta = authUser.user_metadata || {};
    const userId = authUser.id;

    let memberData: any = null;
    try {
      // 1. Fetch user from members table by user_id or email
      const { data } = await supabase
        .from('members')
        .select('*')
        .or(`user_id.eq.${userId},email.ilike.${email}`)
        .maybeSingle();

      memberData = data;
    } catch (err) {
      console.warn('Could not query members table for auth user:', err);
    }

    // 2. If member exists, update last_sign_in_at, status, and link user_id if null
    if (memberData) {
      try {
        await supabase
          .from('members')
          .update({
            user_id: userId,
            status: 'ACTIVE',
            last_sign_in_at: new Date().toISOString(),
          })
          .eq('id', memberData.id);
      } catch {
        // Fallback update without last_sign_in_at if column not yet added
        try {
          await supabase
            .from('members')
            .update({
              user_id: userId,
              status: 'ACTIVE',
            })
            .eq('id', memberData.id);
        } catch {}
      }
    } else {
      // 3. Member does not exist yet (e.g. first Google Sign-In or new sign-up). Insert record in members table!
      const firstName = userMeta.first_name || userMeta.full_name?.split(' ')[0] || '';
      const lastName = userMeta.last_name || userMeta.full_name?.split(' ').slice(1).join(' ') || '';
      const username = userMeta.username || userMeta.preferred_username || userMeta.user_name || email.split('@')[0];
      const avatarUrl = userMeta.avatar_url || userMeta.picture || userMeta.avatar || '';

      try {
        const { data: newMember } = await supabase
          .from('members')
          .insert([{
            user_id: userId,
            username,
            first_name: firstName || 'Member',
            last_name: lastName || '',
            full_name: `${firstName} ${lastName}`.trim() || email.split('@')[0],
            email,
            role: 'MEMBER',
            track: 'Web Development',
            avatar_url: avatarUrl || null,
            status: 'ACTIVE',
            last_sign_in_at: new Date().toISOString(),
          }])
          .select()
          .maybeSingle();

        memberData = newMember;
      } catch (insertErr) {
        console.warn('Auto-create member record error:', insertErr);
      }
    }

    // 4. Resolve user role hierarchy from database
    let role: UserRole = 'MEMBER';
    const roleString = (memberData?.role || '').toUpperCase();
    if (roleString.includes('SUPER_ADMIN') || roleString.includes('SUPER ADMIN') || roleString.includes('MASTER')) {
      role = 'SUPER_ADMIN';
    } else if (roleString.includes('ADMIN') || roleString.includes('LEAD')) {
      role = 'ADMIN';
    } else {
      role = 'MEMBER';
    }

    const firstName = memberData?.first_name || userMeta.first_name || userMeta.full_name?.split(' ')[0] || '';
    const lastName = memberData?.last_name || userMeta.last_name || userMeta.full_name?.split(' ').slice(1).join(' ') || '';
    const username = memberData?.username || userMeta.username || userMeta.preferred_username || email.split('@')[0];
    const avatarUrl = memberData?.avatar_url || memberData?.avatarUrl || userMeta.avatar_url || userMeta.picture || '';

    // Check if user has completed onboarding (has branch, semester, or explicit flag)
    const hasCompletedOnboarding = Boolean(
      memberData?.has_completed_onboarding ||
      (memberData?.branch && memberData?.semester) ||
      (memberData?.skills && memberData.skills.length > 0)
    );

    const userAccount: UserAccount = {
      id: memberData?.id || userId,
      userId: userId,
      username,
      callsign: username,
      firstName,
      lastName,
      fullName: memberData?.full_name || `${firstName} ${lastName}`.trim() || username,
      email,
      role,
      roleTitle: memberData?.role || (role === 'SUPER_ADMIN' ? 'Super Admin' : role === 'ADMIN' ? 'Admin' : 'Member'),
      tier: role,
      track: memberData?.track || 'Web Development',
      branch: memberData?.branch || '',
      semester: memberData?.semester || '',
      avatarUrl: avatarUrl && !avatarUrl.startsWith('blob:') ? avatarUrl : '',
      bio: memberData?.bio || 'Member of CUCEK Skill Development Club.',
      skills: Array.isArray(memberData?.skills) ? memberData.skills : ['Web Development', 'React'],
      projects: Array.isArray(memberData?.projects) ? memberData.projects : [],
      hoursContributed: memberData?.hours_contributed || 0,
      completedModules: memberData?.completed_modules || 0,
      projectsCount: memberData?.projects_count || 0,
      githubUrl: memberData?.github_url || '',
      linkedinUrl: memberData?.linkedin_url || '',
      status: 'ACTIVE',
      createdAt: memberData?.created_at || authUser.created_at || new Date().toISOString(),
      isVerified: true,
      hasCompletedOnboarding,
    };

    setCurrentUser(userAccount);

    // Sync into allUsers list
    setAllUsers((prev) => {
      const idx = prev.findIndex((u) => u.email.toLowerCase() === email || u.id === userAccount.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...userAccount };
        return next;
      }
      return [userAccount, ...prev];
    });

    return userAccount;
  }, []);

  // Listen to Supabase Auth state & initialize on mount
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // 1. Initial check of active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncMemberProfileFromSupabase(session.user);
      }
    });

    // 2. Real-time auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        try {
          localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
        } catch {}
        return;
      }

      if (session?.user) {
        await syncMemberProfileFromSupabase(session.user);
      }
    });

    // 3. Load all registered members from Supabase into allUsers list for admin roster
    memberService.fetchMembers().then((liveMembers) => {
      if (liveMembers && liveMembers.length > 0) {
        setAllUsers((prev) => {
          const merged = [...prev];
          liveMembers.forEach((m) => {
            const idx = merged.findIndex(
              (u) =>
                (m.email && u.email.toLowerCase() === m.email.toLowerCase()) ||
                (m.username && u.username.toLowerCase() === m.username.toLowerCase()) ||
                u.id === m.id
            );
            const userCard: UserAccount = {
              id: m.id,
              userId: m.userId || m.id,
              username: m.username || m.callsign || 'member',
              callsign: m.username || m.callsign || 'member',
              firstName: m.firstName || '',
              lastName: m.lastName || '',
              fullName: m.fullName || `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'SDC Member',
              email: m.email || '',
              role: (m.tier as UserRole) || 'MEMBER',
              roleTitle: m.role || 'Member',
              track: m.track || 'Web Development',
              branch: m.branch || '',
              semester: m.semester || '',
              avatarUrl: m.avatarUrl || '',
              bio: m.bio || '',
              skills: m.skills || [],
              projects: m.projects || [],
              hoursContributed: m.hoursContributed || 0,
              githubUrl: m.githubUrl || '',
              linkedinUrl: m.linkedinUrl || '',
              status: m.status || 'ACTIVE',
              isVerified: true,
            };

            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...userCard };
            } else {
              merged.push(userCard);
            }
          });
          return merged;
        });
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [syncMemberProfileFromSupabase]);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || (currentUser?.role as any) === 'MASTER_ADMIN';
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || (currentUser?.role as any) === 'MASTER_ADMIN';
  const isMasterAdmin = isSuperAdmin;

  // Real Supabase Sign-In
  const signIn = async (email: string, password?: string): Promise<{ success: boolean; isNewUser?: boolean; message?: string }> => {
    const rawInput = email.trim();
    if (!rawInput) {
      return { success: false, message: 'Please enter an email or username.' };
    }

    if (!isSupabaseConfigured()) {
      // Offline fallback
      const cleanEmail = rawInput.toLowerCase();
      const user = allUsers.find((u) => u.email.toLowerCase() === cleanEmail || u.username?.toLowerCase() === cleanEmail);
      if (!user) {
        return { success: false, isNewUser: true, message: 'Account not found. Please click REGISTER above.' };
      }
      setCurrentUser(user);
      return { success: true, message: `Welcome back, @${user.username}!` };
    }

    let resolvedEmail = rawInput.toLowerCase();

    // If user entered a username handle without '@', resolve email from Supabase members table
    if (!resolvedEmail.includes('@')) {
      try {
        const { data: memberRecord } = await supabase
          .from('members')
          .select('email')
          .ilike('username', rawInput)
          .maybeSingle();

        if (memberRecord?.email) {
          resolvedEmail = memberRecord.email.toLowerCase().trim();
        } else {
          return {
            success: false,
            isNewUser: true,
            message: `No account found with username @${rawInput}. Please register above.`,
          };
        }
      } catch (err) {
        console.warn('Username resolution error:', err);
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password: password || '',
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
          return { success: false, isNewUser: false, message: 'Invalid email/username or password credentials.' };
        }
        if (msg.includes('email not confirmed')) {
          return { success: false, isNewUser: false, message: 'Email address not verified yet. Please check your inbox for confirmation.' };
        }
        return { success: false, message: error.message };
      }

      if (data?.user) {
        // Sync complete member profile from Supabase server and record active login
        const syncedUser = await syncMemberProfileFromSupabase(data.user);
        return {
          success: true,
          message: `Welcome back, @${syncedUser?.username || data.user.email?.split('@')[0]}!`,
        };
      }

      return { success: false, message: 'Failed to retrieve authenticated session from Supabase.' };
    } catch (err: any) {
      console.error('Supabase signIn error:', err);
      return { success: false, message: err?.message || 'An unexpected error occurred during sign in.' };
    }
  };

  // Real Supabase Sign-Up
  const signUp = async (
    email: string,
    firstName: string,
    lastName: string,
    username: string,
    password?: string
  ): Promise<{ success: boolean; message: string; requiresVerification?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters (letters, numbers, underscore).' };
    }
    if (!password || password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    if (!isSupabaseConfigured()) {
      // Local fallback
      const role: UserRole = 'MEMBER';
      const newUser: UserAccount = {
        id: `usr-${Date.now()}`,
        username: cleanUsername,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email: cleanEmail,
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
      return { success: true, message: `Account created successfully. Welcome, @${newUser.username}!` };
    }

    try {
      // 1. Check if username handle is already taken in Supabase members table
      const { data: existingUsername } = await supabase
        .from('members')
        .select('id, username')
        .ilike('username', cleanUsername)
        .maybeSingle();

      if (existingUsername) {
        return { success: false, message: `The username @${cleanUsername} is already taken. Please choose another.` };
      }

      // 2. Register account in Supabase Auth (auth.users)
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
            username: cleanUsername,
            preferred_username: cleanUsername,
            user_name: cleanUsername,
          },
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data?.user?.identities && data.user.identities.length === 0) {
        return { success: false, message: 'An account with this email already exists. Please sign in.' };
      }

      // 3. Register / Upsert profile in Supabase members table
      if (data?.user) {
        await memberService.createOrUpdateMember({
          id: data.user.id,
          userId: data.user.id,
          username: cleanUsername,
          email: cleanEmail,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
          role: 'MEMBER',
          track: 'Web Development',
          status: 'ACTIVE',
        });

        // If email confirmation is disabled on Supabase, session is active immediately
        if (data.session) {
          const synced = await syncMemberProfileFromSupabase(data.user);
          return {
            success: true,
            message: `Account created and signed in! Welcome, @${synced?.username || cleanUsername}!`,
          };
        }

        // If email confirmation is enabled on Supabase
        return {
          success: true,
          requiresVerification: true,
          message: 'Account registered successfully! Please check your email inbox to verify your account, then sign in.',
        };
      }

      return { success: false, message: 'Could not create account in Supabase.' };
    } catch (err: any) {
      console.error('Supabase signUp error:', err);
      return { success: false, message: err?.message || 'Failed to complete registration.' };
    }
  };

  // Local verification fallback helper
  const verifyEmailAndSetPassword = async (email: string, password: string, profileData?: Partial<UserAccount>) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      const updated: UserAccount = {
        ...existing,
        isVerified: true,
        ...profileData,
      };
      setAllUsers((prev) => prev.map((u) => (u.id === existing.id ? updated : u)));
      setCurrentUser(updated);
      setPendingEmailDispatch(null);
      return true;
    }

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });
        if (data?.user) {
          await syncMemberProfileFromSupabase(data.user);
          setPendingEmailDispatch(null);
          return true;
        }
      } catch {}
    }

    setPendingEmailDispatch(null);
    return true;
  };

  // Real Supabase Password Reset Dispatch
  const sendPasswordReset = async (email: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return false;

    if (!isSupabaseConfigured()) {
      setPendingEmailDispatch({
        id: `disp-${Date.now()}`,
        type: 'RESET_PASSWORD',
        toEmail: cleanEmail,
        subject: 'SDC Account — Password Reset',
        token: `tok_${Math.random().toString(36).substring(2, 10)}`,
        timestamp: new Date().toISOString(),
      });
      return true;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin,
      });

      if (error) {
        console.warn('Supabase resetPasswordForEmail error:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to send password reset email:', err);
      return false;
    }
  };

  // Real Supabase Password Update
  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    if (!newPassword || newPassword.length < 6) return false;

    if (!isSupabaseConfigured()) {
      const cleanEmail = email.trim().toLowerCase();
      const user = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user) return false;
      setCurrentUser(user);
      setPendingEmailDispatch(null);
      return true;
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.warn('Supabase updateUser password error:', error);
        return false;
      }

      if (data?.user) {
        await syncMemberProfileFromSupabase(data.user);
      }
      setPendingEmailDispatch(null);
      return true;
    } catch (err) {
      console.error('Failed to update password:', err);
      return false;
    }
  };

  // Google OAuth Flow
  const loginWithGoogle = async (options?: {
    onStatusChange?: (status: 'INITIALIZING' | 'CONTACTING_GOOGLE' | 'AWAITING_POPUP' | 'VERIFYING_SESSION' | 'REDIRECTING' | 'SUCCESS' | 'ERROR') => void;
  }): Promise<{ success: boolean; redirected?: boolean; error?: string }> => {
    if (isSupabaseConfigured()) {
      options?.onStatusChange?.('INITIALIZING');

      const width = 520;
      const height = 660;
      const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
      const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));

      let popup: Window | null = null;
      try {
        popup = window.open(
          'about:blank',
          'sdc_oauth_popup',
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,status=no,resizable=yes`
        );
      } catch (e) {
        popup = null;
      }

      if (popup) {
        try {
          popup.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Sign in with Google - SDC</title>
                <style>
                  body {
                    background: #09090b;
                    color: #f4f4f5;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    user-select: none;
                  }
                  .loader {
                    width: 32px;
                    height: 32px;
                    border: 3px solid rgba(255,255,255,0.15);
                    border-top: 3px solid #a855f7;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin-bottom: 16px;
                  }
                  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                  .title { font-size: 14px; font-weight: 600; color: #ffffff; }
                  .sub { font-size: 12px; color: #a1a1aa; margin-top: 6px; }
                </style>
              </head>
              <body>
                <div class="loader"></div>
                <div class="title">Connecting to Google</div>
                <div class="sub">Please wait...</div>
              </body>
            </html>
          `);
        } catch (e) {}
      }

      options?.onStatusChange?.('CONTACTING_GOOGLE');

      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          if (popup && !popup.closed) popup.close();
          console.warn('Supabase Google OAuth error:', error);
          throw error;
        }

        if (data?.url) {
          if (popup && !popup.closed) {
            options?.onStatusChange?.('AWAITING_POPUP');
            popup.location.href = data.url;

            return new Promise((resolve) => {
              let resolved = false;

              const cleanup = () => {
                window.removeEventListener('message', handleMessage);
                if (pollTimer) clearInterval(pollTimer);
              };

              const handleMessage = async (event: MessageEvent) => {
                if (event.origin !== window.location.origin) return;
                if (event.data?.type === 'SDC_OAUTH_SUCCESS') {
                  if (resolved) return;
                  resolved = true;
                  cleanup();

                  options?.onStatusChange?.('VERIFYING_SESSION');

                  const hash = event.data.hash || '';
                  if (hash.includes('access_token')) {
                    try {
                      const params = new URLSearchParams(hash.replace(/^#/, ''));
                      const access_token = params.get('access_token');
                      const refresh_token = params.get('refresh_token');
                      if (access_token && refresh_token) {
                        await supabase.auth.setSession({ access_token, refresh_token });
                      }
                    } catch (e) {}
                  } else if (event.data.search?.includes('code=')) {
                    try {
                      const code = new URLSearchParams(event.data.search).get('code');
                      if (code) {
                        await supabase.auth.exchangeCodeForSession(code);
                      }
                    } catch (e) {}
                  }

                  try {
                    const { data: sessionData } = await supabase.auth.getSession();
                    if (sessionData?.session?.user) {
                      await syncMemberProfileFromSupabase(sessionData.session.user);
                      options?.onStatusChange?.('SUCCESS');
                      resolve({ success: true });
                      return;
                    }
                  } catch (e) {}

                  options?.onStatusChange?.('SUCCESS');
                  resolve({ success: true });
                }
              };

              window.addEventListener('message', handleMessage);

              const pollTimer = setInterval(async () => {
                if (popup?.closed) {
                  clearInterval(pollTimer);
                  setTimeout(async () => {
                    if (resolved) return;
                    try {
                      const { data: s } = await supabase.auth.getSession();
                      if (s?.session?.user) {
                        resolved = true;
                        cleanup();
                        await syncMemberProfileFromSupabase(s.session.user);
                        options?.onStatusChange?.('SUCCESS');
                        resolve({ success: true });
                        return;
                      }
                    } catch (e) {}

                    resolved = true;
                    cleanup();
                    options?.onStatusChange?.('ERROR');
                    resolve({ success: false, error: 'Google sign-in window was closed.' });
                  }, 600);
                }
              }, 500);
            });
          } else {
            // Popup blocked, fallback to redirect
            options?.onStatusChange?.('REDIRECTING');
            sessionStorage.setItem('sdc_oauth_redirecting', 'true');
            await new Promise((r) => setTimeout(r, 400));
            window.location.href = data.url;
            return { success: true, redirected: true };
          }
        }
      } catch (err: any) {
        console.warn('Google Sign-In error:', err);
        options?.onStatusChange?.('ERROR');
        return { success: false, error: err?.message || 'Failed to initialize Google Sign-In.' };
      }
    }

    return { success: false, error: 'Supabase is not configured.' };
  };

  // Sign out
  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out notice:', err);
      }
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    } catch {}
  };

  // Delete account
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
    try {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    } catch {}
    return { success: true, message: 'Account permanently deleted.' };
  };

  // Update profile and sync directly to Supabase server
  const updateUserProfile = async (data: Partial<UserAccount>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));

    if (isSupabaseConfigured()) {
      try {
        await memberService.createOrUpdateMember({
          id: currentUser.id,
          userId: currentUser.userId || currentUser.id,
          username: updated.username,
          email: currentUser.email,
          firstName: updated.firstName,
          lastName: updated.lastName,
          fullName: updated.fullName,
          role: updated.roleTitle || updated.role,
          track: updated.track,
          branch: updated.branch,
          semester: updated.semester,
          bio: updated.bio,
          skills: updated.skills,
          avatarUrl: updated.avatarUrl,
          githubUrl: updated.githubUrl,
          linkedinUrl: updated.linkedinUrl,
          status: updated.status || 'ACTIVE',
        });
      } catch (err) {
        console.warn('Failed to sync updated profile to Supabase server:', err);
      }
    }
  };

  const assignAdminRole = async (userId: string, targetRole: UserRole) => {
    return updateUserRoleAndPosition(userId, targetRole);
  };

  const toggleAdminRole = async (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return { success: false, message: 'User not found.' };

    const nextRole: UserRole = user.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    return updateUserRoleAndPosition(userId, nextRole);
  };

  // Update user role and position & sync to Supabase server
  const updateUserRoleAndPosition = async (
    userId: string,
    targetRole: UserRole,
    customPositionTitle?: string
  ): Promise<{ success: boolean; message: string }> => {
    const user = allUsers.find((u) => u.id === userId || (u as any).userId === userId);
    if (!user) return { success: false, message: 'User not found in registry.' };

    const roleTitle = customPositionTitle || (targetRole === 'SUPER_ADMIN' ? 'Super Admin' : targetRole === 'ADMIN' ? 'Admin' : 'Member');

    const updated: UserAccount = {
      ...user,
      role: targetRole,
      roleTitle,
    };

    setAllUsers((prev) => prev.map((u) => (u.id === userId || (u as any).userId === userId ? updated : u)));
    if (currentUser?.id === userId || (currentUser as any)?.userId === userId) {
      setCurrentUser(updated);
    }

    if (isSupabaseConfigured()) {
      try {
        await memberService.createOrUpdateMember({
          id: user.id,
          userId: user.userId || user.id,
          email: user.email,
          username: user.username,
          role: roleTitle,
        });
      } catch (err) {
        console.warn('Failed to sync role change to Supabase server:', err);
      }
    }

    return { success: true, message: `Role updated for @${user.username} to ${targetRole} [${roleTitle}].` };
  };

  const clearAllCachedData = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_USERS_KEY);
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed to clear cache storage:', e);
    }
    setAllUsers([]);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isSuperAdmin,
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
        clearAllCachedData,
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