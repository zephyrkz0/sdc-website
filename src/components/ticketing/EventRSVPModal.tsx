import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Download, Printer, CheckCircle2, Ticket, Shield, Calendar, MapPin, QrCode } from 'lucide-react';
import { ClubEvent, ScheduleSession, PhysicalTicketPass, DomainTrack, ClubMember } from '../../types';
import { PhysicalPass } from './PhysicalPass';
import { exportPassToPDF, exportPassToPNG } from './PassExporter';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';
import confetti from 'canvas-confetti';

interface EventRSVPModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEvent?: ClubEvent | ScheduleSession | null;
  eventsList: ClubEvent[];
  currentUser?: ClubMember | null;
  isAdmin?: boolean;
  onSaveTicket: (pass: PhysicalTicketPass) => void;
  existingTickets?: PhysicalTicketPass[];
}

export const EventRSVPModal: React.FC<EventRSVPModalProps> = ({
  isOpen,
  onClose,
  targetEvent,
  eventsList,
  currentUser,
  isAdmin = false,
  onSaveTicket,
  existingTickets = [],
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    targetEvent?.id || eventsList[0]?.id || ''
  );
  const [attendeeName, setAttendeeName] = useState(currentUser?.fullName || '');
  const [attendeeCallsign, setAttendeeCallsign] = useState(currentUser?.callsign || currentUser?.username || '');
  const [attendeeEmail, setAttendeeEmail] = useState(currentUser?.email || '');
  const [seatTier, setSeatTier] = useState<PhysicalTicketPass['seatTier']>('ATTENDEE');
  const [track, setTrack] = useState<string>(currentUser?.track || 'Web Development');
  const [generatedPass, setGeneratedPass] = useState<PhysicalTicketPass | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setAttendeeName(currentUser?.fullName || '');
      setAttendeeCallsign(currentUser?.callsign || currentUser?.username || '');
      setAttendeeEmail(currentUser?.email || '');
      if (currentUser?.track) setTrack(currentUser.track);
      if (targetEvent?.id) setSelectedEventId(targetEvent.id);
      setErrorMsg('');
    }
  }, [isOpen, currentUser, targetEvent]);

  if (!isOpen) return null;

  const hasNoEvents = eventsList.length === 0 && !targetEvent;

  const currentEvent =
    eventsList.find((e) => e.id === selectedEventId) ||
    (targetEvent && 'venueCoords' in targetEvent ? targetEvent : null) ||
    eventsList[0];

  const userExistingPass = React.useMemo(() => {
    const userMail = (attendeeEmail || currentUser?.email || '').toLowerCase().trim();
    if (!userMail) return null;
    return (
      existingTickets.find((t) => {
        const matchEmail = (t.attendeeEmail || t.userEmail || '').toLowerCase().trim() === userMail;
        const matchEvent =
          (t.eventId && (t.eventId === selectedEventId || (targetEvent && t.eventId === targetEvent.id))) ||
          (t.eventTitle && (t.eventTitle === currentEvent?.title || (targetEvent && t.eventTitle === targetEvent.title)));
        return matchEmail && matchEvent;
      }) || null
    );
  }, [existingTickets, attendeeEmail, currentUser, selectedEventId, currentEvent, targetEvent]);

  const eventMaxCap = currentEvent ? Number((currentEvent as any).maxCapacity || (currentEvent as any).capacity || 0) : 0;
  const eventRsvpCount = currentEvent ? Number(currentEvent.rsvpCount || 0) : 0;
  const isAtCapacity = Boolean(eventMaxCap > 0 && eventRsvpCount >= eventMaxCap);

  // Seat tier options filtered by role — non-admins only see MEMBER & ATTENDEE
  const seatTierOptions = isAdmin
    ? [
        { id: 'MEMBER', label: 'MEMBER' },
        { id: 'CORE_TEAM', label: 'CORE TEAM' },
        { id: 'SPEAKER', label: 'SPEAKER' },
        { id: 'ATTENDEE', label: 'ATTENDEE' },
      ]
    : [
        { id: 'MEMBER', label: 'MEMBER' },
        { id: 'ATTENDEE', label: 'ATTENDEE' },
      ];

  const handleGenerateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    playCyberClick();
    setErrorMsg('');

    if (userExistingPass) {
      setErrorMsg('You already have a confirmed pass for this session. Limit: 1 pass per member.');
      return;
    }

    if (isAtCapacity) {
      setErrorMsg('This session has reached maximum capacity.');
      return;
    }

    const ticketSerial = `SDC-PASS-${Math.floor(1000 + Math.random() * 9000)}-X${Math.floor(1 + Math.random() * 9)}`;
    const barcode = `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`;
    const secCode = `AUTH-${Math.random().toString(36).substring(2, 7).toUpperCase()}-SEC`;

    const newPass: PhysicalTicketPass = {
      ticketId: ticketSerial,
      eventId: currentEvent?.id || 'evt-01',
      eventTitle: currentEvent?.title || (targetEvent ? targetEvent.title : 'SDC Session'),
      eventDate: currentEvent?.date || (targetEvent ? targetEvent.date : '2026-09-18'),
      eventTime: 'time' in (currentEvent || {}) ? (currentEvent as any).time : '17:30 - 19:30',
      eventLocation: currentEvent?.location || (targetEvent ? (targetEvent as any).location || (targetEvent as any).venue : 'CUCEK Computer Lab') || 'CUCEK Computer Lab',
      attendeeName: attendeeName || currentUser?.fullName || 'Member',
      attendeeCallsign: attendeeCallsign || currentUser?.callsign || currentUser?.username || 'member',
      attendeeEmail,
      attendeeRole: currentUser?.roleTitle || currentUser?.role || 'Member',
      attendeeTrack: track,
      seatTier,
      qrPayload: JSON.stringify({
        tkt: ticketSerial,
        user: attendeeName || currentUser?.fullName || 'Member',
        role: currentUser?.roleTitle || currentUser?.role || 'Member',
        event: currentEvent?.title,
        sec: secCode,
      }),
      barcodeNumber: barcode,
      issuedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'CONFIRMED',
      accessSecurityCode: secCode,
    };

    setGeneratedPass(newPass);
    onSaveTicket(newPass);
    playSuccessChime();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  };

  const handleDownloadPDF = async () => {
    if (!generatedPass) return;
    setIsExporting(true);
    playCyberClick();
    try {
      await exportPassToPDF('generated-physical-pass-view', generatedPass);
      playSuccessChime();
    } catch (err) {
      console.error('PDF export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!generatedPass) return;
    setIsExporting(true);
    playCyberClick();
    try {
      await exportPassToPNG('generated-physical-pass-view', generatedPass);
      playSuccessChime();
    } catch (err) {
      console.error('PNG export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            playCyberClick();
            onClose();
          }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-700 shadow-2xl p-6 sm:p-8 z-10 my-8 font-mono max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Ticket size={16} className="text-purple-400" />
              <span className="font-bold text-white uppercase tracking-wider">EVENT RSVP & PASS REGISTRATION</span>
            </div>
            <button
              onClick={() => {
                playCyberClick();
                onClose();
              }}
              className="p-1 text-zinc-500 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {hasNoEvents ? (
            /* NO EVENTS EMPTY STATE */
            <div className="mt-6 py-12 text-center space-y-4">
              <div className="w-14 h-14 mx-auto bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-500">
                <Calendar size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="font-syne font-black text-lg text-white uppercase">
                  NO UPCOMING EVENTS
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  There are currently no events or sessions available to RSVP for. Check back when new events are announced.
                </p>
              </div>
              <button
                onClick={() => { playCyberClick(); onClose(); }}
                className="px-5 py-2.5 border border-zinc-700 text-zinc-300 hover:text-white hover:border-white text-xs font-bold uppercase tracking-wider transition-all"
              >
                CLOSE
              </button>
            </div>
          ) : !generatedPass ? (
            /* RSVP REGISTRATION FORM */
            <form onSubmit={handleGenerateTicket} className="mt-6 space-y-5 text-xs">
              {/* Event Selector */}
              <div>
                <label className="block text-zinc-400 mb-1.5 font-bold">SELECT EVENT / WORKSHOP</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 p-2.5 text-white focus:outline-none focus:border-zinc-500"
                >
                  {eventsList.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({evt.date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Seat Tier Selection */}
              <div>
                <label className="block text-zinc-400 mb-1.5 font-bold">SELECT ACCESS PASS TYPE</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {seatTierOptions.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSeatTier(tier.id as PhysicalTicketPass['seatTier'])}
                      className={`p-2 border text-center text-[10px] uppercase font-bold transition-all ${
                        seatTier === tier.id
                          ? 'bg-zinc-200 text-black border-white'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Attendee Info Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">ATTENDEE FULL NAME</label>
                  <input
                    type="text"
                    required
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">USERNAME / HANDLE (@)</label>
                  <input
                    type="text"
                    required
                    value={attendeeCallsign}
                    onChange={(e) => setAttendeeCallsign(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white focus:outline-none focus:border-zinc-500 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">CONFIRMATION EMAIL</label>
                  <input
                    type="email"
                    required
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">PRIMARY DOMAIN TRACK</label>
                  <input
                    type="text"
                    value={track}
                    onChange={(e) => setTrack(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              {/* Existing Pass Alert Banner */}
              {userExistingPass && (
                <div className="p-4 bg-emerald-950/60 border border-emerald-500/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                    <CheckCircle2 size={16} />
                    <span>Active Pass Already Confirmed</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    Each attendee (including administrators) is limited to 1 pass per session. You are already registered with pass #{userExistingPass.ticketId}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      playCyberClick();
                      setGeneratedPass(userExistingPass);
                    }}
                    className="mt-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase text-[11px] flex items-center gap-1.5 transition-colors"
                  >
                    <Ticket size={13} />
                    <span>View & Download My Pass</span>
                  </button>
                </div>
              )}

              {/* At Capacity Alert */}
              {!userExistingPass && isAtCapacity && (
                <div className="p-3 bg-red-950/60 border border-red-500/80 text-red-200 text-xs flex items-center gap-2">
                  <X size={15} className="text-red-400 shrink-0" />
                  <span>This session has reached full attendee capacity ({currentEvent?.rsvpCount} / {(currentEvent as any)?.maxCapacity}). RSVPs are currently closed.</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-2.5 bg-red-950/80 border border-red-800 text-[11px] text-red-200">
                  {errorMsg}
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={Boolean(userExistingPass) || isAtCapacity}
                  className={`px-6 py-2.5 font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    userExistingPass || isAtCapacity
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                      : 'bg-white text-black hover:bg-zinc-200 shadow-md'
                  }`}
                >
                  <Sparkles size={14} />
                  <span>
                    {userExistingPass
                      ? 'PASS ALREADY RESERVED'
                      : isAtCapacity
                      ? 'SESSION FULL'
                      : 'GENERATE PASS'}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            /* GENERATED PASS DISPLAY & DOWNLOAD ACTIONS */
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between text-emerald-400 font-bold text-xs pb-2 border-b border-zinc-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> PASS ISSUED & VERIFIED
                </span>
                <span className="text-zinc-400">ID: {generatedPass.ticketId}</span>
              </div>

              {/* 3D Holographic Pass Visual View */}
              <div className="py-2">
                <PhysicalPass pass={generatedPass} id="generated-physical-pass-view" enable3D={true} />
              </div>

              {/* Action Buttons: PDF & PNG Download */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-zinc-800">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isExporting}
                  className="w-full py-3 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Download size={14} />
                  <span>{isExporting ? 'GENERATING PDF...' : 'DOWNLOAD PDF'}</span>
                </button>

                <button
                  onClick={handleDownloadPNG}
                  disabled={isExporting}
                  className="w-full py-3 bg-zinc-900 border border-zinc-700 hover:border-white text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  <span>DOWNLOAD PNG</span>
                </button>

                <button
                  onClick={() => {
                    playCyberClick();
                    window.print();
                  }}
                  className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <Printer size={14} />
                  <span>PRINT PASS</span>
                </button>
              </div>

              <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-2 font-mono">
                <span>SCANNABLE AT VENUE ENTRANCE</span>
                <button
                  onClick={() => setGeneratedPass(null)}
                  className="text-purple-400 hover:underline"
                >
                  &larr; REGISTER ANOTHER PASS
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
