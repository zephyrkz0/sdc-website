import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ScheduleSession, PastEventRecord } from '../types';

export const eventService = {
  // Fetch all active/upcoming events
  async fetchEvents(): Promise<ScheduleSession[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching events from Supabase:', error);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        code: row.code,
        date: row.date,
        day: row.day,
        timeStart: row.time_start,
        timeEnd: row.time_end,
        sessionType: row.session_type,
        track: row.track,
        location: row.location,
        roomNumber: row.room_number || '',
        virtualStreamUrl: row.virtual_stream_url,
        instructor: {
          name: row.instructor_name,
          username: row.instructor_username || row.instructor_name,
          avatar: row.instructor_avatar || '',
          role: 'Session Instructor',
          callsign: row.instructor_username || row.instructor_name,
          opId: `SDC-INST-${(row.id || '').slice(-4) || '001'}`,
        },
        curriculum: row.curriculum || [],
        prerequisites: row.prerequisites || [],
        hardwareRequirements: row.hardware_reqs || '',
        maxCapacity: row.max_capacity,
        rsvpCount: row.rsvp_count,
        description: row.description || '',
        bannerUrl: row.banner_url,
        featured: row.featured,
      }));
    } catch (err) {
      console.error('Failed to fetch events:', err);
      return [];
    }
  },

  // Create a new event/session
  async createEvent(event: Omit<ScheduleSession, 'id'>): Promise<ScheduleSession | null> {
    if (!isSupabaseConfigured()) {
      const localEvent: ScheduleSession = {
        ...event,
        id: `local-ev-${Date.now()}`,
      };
      return localEvent;
    }

    try {
      const dbPayload = {
        title: event.title,
        code: event.code,
        date: event.date,
        day: event.day,
        time_start: event.timeStart,
        time_end: event.timeEnd,
        session_type: event.sessionType,
        track: event.track,
        location: event.location,
        room_number: event.roomNumber,
        virtual_stream_url: event.virtualStreamUrl,
        instructor_name: typeof event.instructor === 'object' ? event.instructor.name : (event.instructor || ''),
        instructor_username: typeof event.instructor === 'object' ? event.instructor.username || '' : '',
        instructor_avatar: typeof event.instructor === 'object' ? event.instructor.avatar || '' : '',
        curriculum: event.curriculum,
        prerequisites: event.prerequisites,
        hardware_reqs: event.hardwareRequirements,
        max_capacity: event.maxCapacity,
        rsvp_count: event.rsvpCount || 0,
        description: event.description,
        banner_url: event.bannerUrl,
        featured: event.featured || false,
      };

      const { data, error } = await supabase
        .from('events')
        .insert([dbPayload])
        .select()
        .single();

      if (error) {
        console.error('Error creating event in Supabase:', error);
        throw error;
      }

      return {
        id: data.id,
        title: data.title,
        code: data.code,
        date: data.date,
        day: data.day,
        timeStart: data.time_start,
        timeEnd: data.time_end,
        sessionType: data.session_type,
        track: data.track,
        location: data.location,
        roomNumber: data.room_number,
        virtualStreamUrl: data.virtual_stream_url,
        instructor: {
          name: data.instructor_name,
          username: data.instructor_username,
          avatar: data.instructor_avatar,
          callsign: data.instructor_username,
          opId: `SDC-INST-${(data.id || '').slice(-4) || '001'}`,
          role: 'Instructor',
        },
        curriculum: data.curriculum,
        prerequisites: data.prerequisites,
        hardwareRequirements: data.hardware_reqs,
        maxCapacity: data.max_capacity,
        rsvpCount: data.rsvp_count,
        description: data.description,
        bannerUrl: data.banner_url,
        featured: data.featured,
      };
    } catch (err) {
      console.error('Failed to create event:', err);
      return null;
    }
  },

  // Fetch past events archive
  async fetchPastEvents(): Promise<PastEventRecord[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('past_events')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching past events:', error);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        code: row.code,
        date: row.date,
        location: row.location,
        type: row.session_type,
        track: row.track,
        attendeesCount: row.attendees_count,
        instructorName: row.instructor_name || 'SDC Lead',
        highlightSummary: row.highlight_summary || '',
        bannerUrl: row.banner_url,
        resourcesLink: row.resources_link,
      }));
    } catch (err) {
      console.error('Failed to fetch past events:', err);
      return [];
    }
  },

  // Delete an event
  async deleteEvent(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.error('Failed to delete event:', err);
      return false;
    }
  }
};
