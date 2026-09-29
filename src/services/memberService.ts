import { ClubMember } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CLUB_MEMBERS } from '../data/mockData';

export const memberService = {
  // Fetch all members from Supabase (or fallback to local mock data)
  async fetchMembers(): Promise<ClubMember[]> {
    if (!isSupabaseConfigured()) {
      return CLUB_MEMBERS;
    }

    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('hours_contributed', { ascending: false });

      if (error || !data || data.length === 0) {
        return CLUB_MEMBERS;
      }

      return data.map((m) => ({
        id: m.id,
        callsign: m.username || m.callsign || 'member',
        username: m.username || m.callsign || 'member',
        fullName: m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'SDC Member',
        firstName: m.first_name || '',
        lastName: m.last_name || '',
        email: m.email || '',
        role: m.role || 'Member',
        roleTitle: m.role || 'Member',
        tier: m.role?.toLowerCase().includes('super admin') || m.role?.toLowerCase().includes('master')
          ? 'SUPER_ADMIN'
          : m.role?.toLowerCase().includes('admin') || m.role?.toLowerCase().includes('lead')
          ? 'ADMIN'
          : 'MEMBER',
        track: m.track || 'Web Development',
        opId: m.op_id || `SDC-${m.id.substring(0, 6)}`,
        avatarUrl: m.avatar_url || m.avatarUrl || m.avatarurl || '',
        bio: m.bio || '',
        branch: m.branch || '',
        semester: m.semester || '',
        hoursContributed: m.hours_contributed || 0,
        completedModules: m.completed_modules || 0,
        projectsCount: m.projects_count || 0,
        skills: Array.isArray(m.skills) ? m.skills : [],
        badges: Array.isArray(m.badges) ? m.badges : [],
        projects: Array.isArray(m.projects) ? m.projects : [],
        githubUrl: m.github_url || m.github || '',
        github: m.github || m.github_url || '',
        linkedinUrl: m.linkedin_url || m.linkedin || '',
        linkedin: m.linkedin || m.linkedin_url || '',
        location: m.location || 'CUCEK Campus',
        joinedDate: m.joined_date || m.created_at || new Date().toISOString(),
        status: m.status || 'ACTIVE',
      }));
    } catch (err) {
      console.warn('Failed to fetch live members from Supabase, using mock data:', err);
      return CLUB_MEMBERS;
    }
  },

  // Helper to validate UUID format
  isValidUUID(str?: string | null): boolean {
    if (!str || typeof str !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
  },

  // Create or Update a member record
  async createOrUpdateMember(member: Partial<ClubMember> & { userId?: string; lastSignInAt?: string; hasCompletedOnboarding?: boolean }): Promise<ClubMember | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      const cleanEmail = member.email ? member.email.trim().toLowerCase() : `member_${Date.now()}@sdc.internal`;
      const cleanUsername = member.username || member.callsign || `member_${Date.now().toString().slice(-4)}`;

      const payload: Record<string, any> = {
        first_name: member.firstName || member.fullName?.split(' ')[0] || 'Member',
        last_name: member.lastName || member.fullName?.split(' ').slice(1).join(' ') || '',
        full_name: member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'SDC Member',
        username: cleanUsername,
        email: cleanEmail,
        role: member.role || member.roleTitle || 'MEMBER',
        track: member.track || 'Web Development',
        branch: member.branch || '',
        semester: member.semester || '',
        avatar_url: member.avatarUrl || null,
        bio: member.bio || '',
        skills: member.skills || [],
        github_url: member.githubUrl || member.github || null,
        linkedin_url: member.linkedinUrl || member.linkedin || null,
        status: member.status || 'ACTIVE',
      };

      // Only pass UUIDs to PostgreSQL UUID columns
      if (this.isValidUUID(member.id)) {
        payload.id = member.id;
      }
      if (this.isValidUUID(member.userId)) {
        payload.user_id = member.userId;
      }

      // Check if member already exists by user_id, id, email, or username
      let existingId: string | null = null;
      if (payload.id) {
        const { data } = await supabase.from('members').select('id').eq('id', payload.id).maybeSingle();
        if (data?.id) existingId = data.id;
      }
      if (!existingId && payload.user_id) {
        const { data } = await supabase.from('members').select('id').eq('user_id', payload.user_id).maybeSingle();
        if (data?.id) existingId = data.id;
      }
      if (!existingId && payload.email) {
        const { data } = await supabase.from('members').select('id').ilike('email', payload.email).maybeSingle();
        if (data?.id) existingId = data.id;
      }
      if (!existingId && payload.username) {
        const { data } = await supabase.from('members').select('id').ilike('username', payload.username).maybeSingle();
        if (data?.id) existingId = data.id;
      }

      let res;
      if (existingId) {
        res = await supabase.from('members').update(payload).eq('id', existingId).select().single();
      } else {
        res = await supabase.from('members').insert([payload]).select().single();
      }

      if (res.error) {
        console.warn('Supabase member save notice:', res.error);
        return null;
      }

      return res.data as unknown as ClubMember;
    } catch (err) {
      console.error('Failed to create/update member in Supabase:', err);
      return null;
    }
  },

  // Fetch single member by user_id, email, or username
  async fetchMemberByIdentifier(identifier: string): Promise<ClubMember | null> {
    if (!isSupabaseConfigured() || !identifier) return null;
    try {
      let query = supabase.from('members').select('*');
      if (this.isValidUUID(identifier)) {
        query = query.or(`id.eq.${identifier},user_id.eq.${identifier}`);
      } else if (identifier.includes('@')) {
        query = query.ilike('email', identifier.toLowerCase().trim());
      } else {
        query = query.ilike('username', identifier.trim());
      }

      const { data, error } = await query.maybeSingle();
      if (error || !data) return null;

      return {
        id: data.id,
        userId: data.user_id || data.id,
        callsign: data.username || data.callsign || 'member',
        username: data.username || data.callsign || 'member',
        fullName: data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'SDC Member',
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: data.email || '',
        role: data.role || 'Member',
        roleTitle: data.role || 'Member',
        tier: data.role?.toLowerCase().includes('super admin') || data.role?.toLowerCase().includes('master')
          ? 'SUPER_ADMIN'
          : data.role?.toLowerCase().includes('admin') || data.role?.toLowerCase().includes('lead')
          ? 'ADMIN'
          : 'MEMBER',
        track: data.track || 'Web Development',
        opId: data.op_id || `SDC-${(data.id || '').substring(0, 6)}`,
        avatarUrl: data.avatar_url || data.avatarUrl || '',
        bio: data.bio || '',
        branch: data.branch || '',
        semester: data.semester || '',
        hoursContributed: data.hours_contributed || 0,
        completedModules: data.completed_modules || 0,
        projectsCount: data.projects_count || 0,
        skills: Array.isArray(data.skills) ? data.skills : [],
        badges: Array.isArray(data.badges) ? data.badges : [],
        projects: Array.isArray(data.projects) ? data.projects : [],
        githubUrl: data.github_url || data.github || '',
        github: data.github || data.github_url || '',
        linkedinUrl: data.linkedin_url || data.linkedin || '',
        linkedin: data.linkedin || data.linkedin_url || '',
        location: data.location || 'CUCEK Campus',
        joinedDate: data.joined_date || data.created_at || new Date().toISOString(),
        status: data.status || 'ACTIVE',
      };
    } catch {
      return null;
    }
  },

  async createMember(member: Partial<ClubMember>): Promise<ClubMember | null> {
    return this.createOrUpdateMember(member);
  },

  async uploadAvatar(file: File): Promise<string> {
    // 1. If Supabase is configured, attempt upload to Supabase Storage
    if (isSupabaseConfigured()) {
      try {
        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        // Attempt upload to 'avatars' bucket first (standard in schema.sql)
        let bucketName = 'avatars';
        let uploadFilePath = fileName;

        let { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(uploadFilePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        // If 'avatars' bucket fails (e.g. not created yet), attempt 'club-assets'
        if (uploadError) {
          bucketName = 'club-assets';
          uploadFilePath = `avatars/${fileName}`;
          const res = await supabase.storage
            .from(bucketName)
            .upload(uploadFilePath, file, {
              cacheControl: '3600',
              upsert: true,
            });
          uploadError = res.error;
        }

        if (!uploadError) {
          const { data } = supabase.storage.from(bucketName).getPublicUrl(uploadFilePath);
          if (data?.publicUrl) {
            return data.publicUrl;
          }
        } else {
          console.warn('Supabase storage upload notice:', uploadError);
        }
      } catch (err) {
        console.warn('Supabase avatar upload exception:', err);
      }
    }

    // 2. Safe local fallback: Convert to permanent Base64 Data URL (persists across reloads, never breaks)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve((reader.result as string) || '');
      };
      reader.onerror = () => {
        resolve('');
      };
      reader.readAsDataURL(file);
    });
  },

  // Delete member from DB
  async deleteMemberByIdentity(email?: string, username?: string, id?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    try {
      if (id) {
        await supabase.from('members').delete().eq('id', id);
        await supabase.from('members').delete().eq('user_id', id);
      }
      if (email) {
        await supabase.from('members').delete().ilike('email', email);
      }
      if (username) {
        await supabase.from('members').delete().ilike('username', username);
      }
      return true;
    } catch (err) {
      console.warn('Member deletion cleanup notice:', err);
      return false;
    }
  },
};
export default memberService;
