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
        avatarUrl: m.avatar_url || '',
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

  // Create or Update a member record
  async createOrUpdateMember(member: Partial<ClubMember> & { userId?: string }): Promise<ClubMember | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      const payload: Record<string, any> = {
        full_name: member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim(),
        username: member.username || member.callsign,
        email: member.email,
        role: member.role || member.roleTitle,
        track: member.track,
        avatar_url: member.avatarUrl,
        bio: member.bio,
        branch: member.branch,
        semester: member.semester,
        skills: member.skills,
        github_url: member.githubUrl || member.github,
        linkedin_url: member.linkedinUrl || member.linkedin,
        status: member.status || 'ACTIVE',
      };

      if (member.id) {
        payload.id = member.id;
      }
      if (member.userId) {
        payload.user_id = member.userId;
      }

      const { data, error } = await supabase
        .from('members')
        .upsert(payload, { onConflict: 'email' })
        .select()
        .single();

      if (error) {
        console.warn('Supabase member upsert notice:', error);
        return null;
      }

      return data as unknown as ClubMember;
    } catch (err) {
      console.error('Failed to create/update member in Supabase:', err);
      return null;
    }
  },

  async createMember(member: Partial<ClubMember>): Promise<ClubMember | null> {
    return this.createOrUpdateMember(member);
  },

  async uploadAvatar(file: File): Promise<string> {
    if (!isSupabaseConfigured()) {
      return URL.createObjectURL(file);
    }
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('club-assets')
        .upload(filePath, file);

      if (uploadError) {
        console.warn('Supabase upload notice:', uploadError);
        return URL.createObjectURL(file);
      }

      const { data } = supabase.storage.from('club-assets').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.warn('Avatar upload fallback:', err);
      return URL.createObjectURL(file);
    }
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
