import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PhysicalTicketPass } from '../types';

export const ticketService = {
  // Mint a new RSVP Ticket Pass
  async mintTicket(ticket: Omit<PhysicalTicketPass, 'createdAt'>): Promise<PhysicalTicketPass | null> {
    const fullTicket: PhysicalTicketPass = {
      ...ticket,
      createdAt: new Date().toISOString(),
      userCallsign: ticket.username,
    };

    if (!isSupabaseConfigured()) {
      return fullTicket;
    }

    try {
      const dbPayload = {
        ticket_id: ticket.ticketId,
        user_id: ticket.userEmail,
        username: ticket.username,
        user_name: ticket.userName,
        user_email: ticket.userEmail,
        event_id: ticket.eventId.includes('local') ? null : ticket.eventId,
        event_title: ticket.eventTitle,
        event_date: ticket.eventDate,
        event_time: ticket.eventTime,
        venue: ticket.venue,
        tier: ticket.tier,
        qr_payload: ticket.qrPayload,
        is_admitted: ticket.isAdmitted,
      };

      const { data, error } = await supabase
        .from('tickets')
        .insert([dbPayload])
        .select()
        .single();

      if (error) {
        console.error('Error minting ticket in Supabase:', error);
        return fullTicket;
      }

      // Also increment rsvp_count on event
      if (ticket.eventId && !ticket.eventId.includes('local')) {
        try {
          await supabase.rpc('increment_rsvp', { event_id: ticket.eventId });
        } catch {}
      }

      return {
        ticketId: data.ticket_id,
        eventId: data.event_id || ticket.eventId,
        eventTitle: data.event_title,
        eventDate: data.event_date,
        eventTime: data.event_time,
        venue: data.venue,
        userName: data.user_name,
        username: data.username,
        userEmail: data.user_email,
        qrPayload: data.qr_payload,
        tier: data.tier,
        isAdmitted: data.is_admitted,
        admittedAt: data.admitted_at,
        createdAt: data.created_at,
        userCallsign: data.username,
      };
    } catch (err) {
      console.error('Failed to mint ticket:', err);
      return fullTicket;
    }
  },

  // Fetch tickets for a specific user
  async fetchUserTickets(userEmail: string): Promise<PhysicalTicketPass[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user tickets:', error);
        return [];
      }

      return (data || []).map((row: any) => ({
        ticketId: row.ticket_id,
        eventId: row.event_id,
        eventTitle: row.event_title,
        eventDate: row.event_date,
        eventTime: row.event_time,
        venue: row.venue,
        userName: row.user_name,
        username: row.username,
        userEmail: row.user_email,
        qrPayload: row.qr_payload,
        tier: row.tier,
        isAdmitted: row.is_admitted,
        admittedAt: row.admitted_at,
        createdAt: row.created_at,
        userCallsign: row.username,
      }));
    } catch (err) {
      console.error('Failed to fetch user tickets:', err);
      return [];
    }
  },

  // Validate and Admit Ticket at the Door Gate (QR Scanner)
  async verifyAndAdmitTicket(payload: string): Promise<{ success: boolean; message: string; ticket?: PhysicalTicketPass }> {
    if (!isSupabaseConfigured()) {
      return {
        success: true,
        message: 'PASS VERIFIED // ACCESS GRANTED (OFFLINE MODE)',
      };
    }

    try {
      // Find ticket by qr_payload or ticket_id
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .or(`qr_payload.eq.${payload},ticket_id.eq.${payload}`)
        .maybeSingle();

      if (error || !data) {
        return { success: false, message: 'INVALID OR UNRECOGNIZED PASS' };
      }

      if (data.is_admitted) {
        return {
          success: false,
          message: `ALREADY ADMITTED AT ${new Date(data.admitted_at).toLocaleTimeString()}`,
          ticket: {
            ticketId: data.ticket_id,
            eventId: data.event_id,
            eventTitle: data.event_title,
            eventDate: data.event_date,
            eventTime: data.event_time,
            venue: data.venue,
            userName: data.user_name,
            username: data.username,
            userEmail: data.user_email,
            qrPayload: data.qr_payload,
            tier: data.tier,
            isAdmitted: data.is_admitted,
            admittedAt: data.admitted_at,
            createdAt: data.created_at,
          },
        };
      }

      // Mark admitted
      const now = new Date().toISOString();
      await supabase
        .from('tickets')
        .update({ is_admitted: true, admitted_at: now })
        .eq('id', data.id);

      return {
        success: true,
        message: 'AUTHENTIC PASS CONFIRMED // ACCESS GRANTED',
        ticket: {
          ticketId: data.ticket_id,
          eventId: data.event_id,
          eventTitle: data.event_title,
          eventDate: data.event_date,
          eventTime: data.event_time,
          venue: data.venue,
          userName: data.user_name,
          username: data.username,
          userEmail: data.user_email,
          qrPayload: data.qr_payload,
          tier: data.tier,
          isAdmitted: true,
          admittedAt: now,
          createdAt: data.created_at,
        },
      };
    } catch (err) {
      console.error('Gate check-in error:', err);
      return { success: false, message: 'DATABASE CONNECTION ERROR' };
    }
  }
};
