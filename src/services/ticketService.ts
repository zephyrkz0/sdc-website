import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PhysicalTicketPass } from '../types';

const isValidUUID = (str?: string | null): boolean => {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

export const ticketService = {
  // Mint a new RSVP Ticket Pass
  async mintTicket(ticket: PhysicalTicketPass): Promise<PhysicalTicketPass> {
    const fullTicket: PhysicalTicketPass = {
      ...ticket,
      createdAt: ticket.createdAt || new Date().toISOString(),
      issuedAt: ticket.issuedAt || new Date().toISOString(),
      attendeeName: ticket.attendeeName || ticket.userName || 'Member',
      attendeeCallsign: ticket.attendeeCallsign || ticket.username || 'member',
      attendeeEmail: ticket.attendeeEmail || ticket.userEmail || '',
      eventLocation: ticket.eventLocation || ticket.venue || 'CUCEK Campus',
      seatTier: ticket.seatTier || ticket.tier || 'GENERAL_ADMISSION',
    };

    if (!isSupabaseConfigured()) {
      return fullTicket;
    }

    try {
      const isEventUUID = isValidUUID(fullTicket.eventId);
      const dbPayload = {
        ticket_id: fullTicket.ticketId,
        user_id: fullTicket.attendeeEmail,
        username: fullTicket.attendeeCallsign,
        user_name: fullTicket.attendeeName,
        user_email: fullTicket.attendeeEmail,
        event_id: isEventUUID ? fullTicket.eventId : null,
        event_title: fullTicket.eventTitle,
        event_date: fullTicket.eventDate,
        event_time: fullTicket.eventTime,
        venue: fullTicket.eventLocation,
        tier: fullTicket.seatTier,
        qr_payload: fullTicket.qrPayload,
        is_admitted: fullTicket.isAdmitted || false,
      };

      const { data, error } = await supabase
        .from('tickets')
        .insert([dbPayload])
        .select()
        .single();

      if (error) {
        console.warn('Notice minting ticket in Supabase:', error);
        return fullTicket;
      }

      if (isEventUUID) {
        try {
          await supabase.rpc('increment_rsvp', { event_id: fullTicket.eventId });
        } catch {}
      }

      return {
        ...fullTicket,
        ticketId: data.ticket_id,
        isAdmitted: data.is_admitted,
      };
    } catch (err) {
      console.warn('Fallback saving ticket:', err);
      return fullTicket;
    }
  },

  // Fetch tickets for a specific user
  async fetchUserTickets(userEmail: string): Promise<PhysicalTicketPass[]> {
    if (!isSupabaseConfigured() || !userEmail) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_email', userEmail.toLowerCase().trim())
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data.map((t) => ({
        ticketId: t.ticket_id,
        eventId: t.event_id || 'evt-custom',
        eventTitle: t.event_title,
        eventDate: t.event_date,
        eventTime: t.event_time,
        eventLocation: t.venue || 'CUCEK Campus',
        venue: t.venue,
        attendeeName: t.user_name || 'Member',
        userName: t.user_name,
        attendeeCallsign: t.username || 'member',
        username: t.username,
        userCallsign: t.username,
        attendeeEmail: t.user_email,
        userEmail: t.user_email,
        attendeeRole: 'Member',
        qrPayload: t.qr_payload || JSON.stringify({ tkt: t.ticket_id }),
        seatTier: t.tier || 'GENERAL_ADMISSION',
        tier: t.tier,
        barcodeNumber: t.barcode_number || `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
        issuedAt: t.created_at,
        createdAt: t.created_at,
        status: t.is_admitted ? 'CHECKED_IN' : 'CONFIRMED',
        isAdmitted: t.is_admitted,
        admittedAt: t.admitted_at,
        accessSecurityCode: `AUTH-${t.ticket_id.substring(0, 6)}`,
      }));
    } catch (err) {
      console.warn('Error fetching tickets:', err);
      return [];
    }
  },

  // Scan & Admit a ticket
  async checkInTicket(ticketId: string): Promise<{ success: boolean; message: string; ticket?: PhysicalTicketPass }> {
    if (!isSupabaseConfigured()) {
      return { success: true, message: `Pass [${ticketId}] admitted locally.` };
    }

    try {
      const { data, error } = await supabase
        .from('tickets')
        .update({
          is_admitted: true,
          admitted_at: new Date().toISOString(),
        })
        .eq('ticket_id', ticketId)
        .select()
        .single();

      if (error || !data) {
        return { success: false, message: error?.message || 'Ticket pass not found in registry.' };
      }

      return {
        success: true,
        message: `Pass [${ticketId}] validated and admitted successfully.`,
        ticket: {
          ticketId: data.ticket_id,
          eventId: data.event_id,
          eventTitle: data.event_title,
          eventDate: data.event_date,
          eventTime: data.event_time,
          eventLocation: data.venue,
          attendeeName: data.user_name,
          attendeeCallsign: data.username,
          attendeeEmail: data.user_email,
          qrPayload: data.qr_payload,
          status: 'CHECKED_IN',
          isAdmitted: true,
        } as PhysicalTicketPass,
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error processing check-in.' };
    }
  },

  // Delete all tickets for a user identity
  async deleteTicketsByUser(email?: string, username?: string, id?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    try {
      if (email) {
        await supabase.from('tickets').delete().ilike('user_email', email);
      }
      if (username) {
        await supabase.from('tickets').delete().ilike('username', username);
      }
      return true;
    } catch (err) {
      console.warn('Ticket deletion notice:', err);
      return false;
    }
  },

  // Delete a single ticket and decrement event capacity
  async deleteTicket(ticketId: string, eventId?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('ticket_id', ticketId);

      if (error) {
        console.error('Error deleting ticket:', error);
        return false;
      }

      // Decrement RSVP count for the event to free up capacity
      if (isValidUUID(eventId)) {
        try {
          await supabase.rpc('decrement_rsvp', { event_id: eventId });
        } catch (rpcErr) {
          console.warn('decrement_rsvp RPC notice:', rpcErr);
        }
      }

      return true;
    } catch (err) {
      console.error('Failed to delete ticket:', err);
      return false;
    }
  },
};
export default ticketService;
