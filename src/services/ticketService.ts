import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PhysicalTicketPass } from '../types';

const isValidUUID = (str?: string | null): boolean => {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

export const ticketService = {
  // Mint a new RSVP Ticket Pass (Requires strict server verification)
  async mintTicket(ticket: PhysicalTicketPass): Promise<PhysicalTicketPass> {
    if (!isSupabaseConfigured()) {
      throw new Error('Server Connection Error: Active Supabase connection required to mint and verify ticket passes.');
    }

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

    const isEventUUID = isValidUUID(fullTicket.eventId);
    let authUserId = fullTicket.userId || '';
    if (!authUserId) {
      try {
        const { data: authSession } = await supabase.auth.getSession();
        authUserId = authSession?.session?.user?.id || '';
      } catch {}
    }

    const dbPayload = {
      ticket_id: fullTicket.ticketId,
      user_id: authUserId || fullTicket.attendeeEmail,
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
      console.error('Database rejected ticket minting:', error);
      throw new Error(error.message || 'Server rejected ticket creation.');
    }

    if (!data) {
      throw new Error('Server returned empty response when confirming pass.');
    }

    if (isEventUUID) {
      try {
        await supabase.rpc('increment_rsvp', { event_id: fullTicket.eventId });
      } catch (rpcErr) {
        console.warn('RPC increment_rsvp notice:', rpcErr);
      }
    }

    return {
      ...fullTicket,
      ticketId: data.ticket_id,
      isAdmitted: data.is_admitted,
    };
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

  // Fetch all tickets across all events (Admin Gate Check-in verification)
  async fetchAllTickets(): Promise<PhysicalTicketPass[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
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
      console.warn('Error fetching all tickets:', err);
      return [];
    }
  },

  // Scan & Admit a ticket (Strict server verification: blocks offline bypass & duplicate reuse)
  async checkInTicket(ticketId: string): Promise<{ success: boolean; message: string; ticket?: PhysicalTicketPass }> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Server Connection Error: Active Supabase connection required to verify and admit ticket passes. Offline admission is blocked for security.',
      };
    }

    try {
      // 1. Fetch current ticket to verify authenticity and duplicate admission
      const { data: existing, error: fetchErr } = await supabase
        .from('tickets')
        .select('*')
        .eq('ticket_id', ticketId)
        .maybeSingle();

      if (fetchErr || !existing) {
        return {
          success: false,
          message: fetchErr?.message || `Pass [${ticketId}] not found in database registry.`,
        };
      }

      if (existing.is_admitted) {
        const admittedTime = existing.admitted_at ? new Date(existing.admitted_at).toLocaleTimeString() : 'earlier';
        return {
          success: false,
          message: `DUPLICATE ENTRY ALERT: Pass [${ticketId}] was ALREADY admitted at ${admittedTime}! Entry denied.`,
          ticket: {
            ticketId: existing.ticket_id,
            eventId: existing.event_id,
            eventTitle: existing.event_title,
            eventDate: existing.event_date,
            eventTime: existing.event_time,
            eventLocation: existing.venue,
            attendeeName: existing.user_name,
            attendeeCallsign: existing.username,
            attendeeEmail: existing.user_email,
            qrPayload: existing.qr_payload,
            status: 'CHECKED_IN',
            isAdmitted: true,
          } as PhysicalTicketPass,
        };
      }

      // 2. Atomically update admission state in database
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
        return {
          success: false,
          message: error?.message || 'Access Denied: Only authenticated administrators can admit ticket passes.',
        };
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
      return { success: false, message: err?.message || 'Error processing check-in.' };
    }
  },

  // Verify and admit pass by any identifier (ticketId, barcode, access code, or QR payload)
  async verifyAndAdmitPass(identifier: string): Promise<{ success: boolean; message: string; ticket?: PhysicalTicketPass }> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Server Connection Error: Active Supabase connection required to verify passes. Offline check-in is disabled.',
      };
    }

    const clean = identifier.trim();
    if (!clean) {
      return { success: false, message: 'Invalid ticket pass identifier provided.' };
    }

    let targetTicketId = clean;
    try {
      const parsed = JSON.parse(clean);
      if (parsed.tkt) targetTicketId = String(parsed.tkt);
    } catch {}

    // Sanitize reserved PostgREST delimiters to prevent .or() filter injection
    const safeTicketId = targetTicketId.replace(/[,().%*'"]/g, '').trim();
    if (!safeTicketId) {
      return { success: false, message: 'Invalid ticket pass identifier format.' };
    }

    try {
      const { data: matched, error: findErr } = await supabase
        .from('tickets')
        .select('*')
        .or(`ticket_id.eq.${safeTicketId},qr_payload.ilike.%${safeTicketId}%`)
        .maybeSingle();

      if (findErr || !matched) {
        return {
          success: false,
          message: `Security Verification Failed: No ticket found matching identifier [${clean}].`,
        };
      }

      return this.checkInTicket(matched.ticket_id);
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to verify pass identifier.' };
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
