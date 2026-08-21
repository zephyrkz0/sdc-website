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
  currentUser: ClubMember;
  onSaveTicket: (pass: PhysicalTicketPass) => void;
}

export const EventRSVPModal: React.FC<EventRSVPModalProps> = ({
  isOpen,
  onClose,
  targetEvent,
  eventsList,
  currentUser,
  onSaveTicket,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    targetEvent?.id || eventsList[0]?.id || ''
  );
  const [attendeeName, setAttendeeName] = useState(currentUser.fullName);
  const [attendeeCallsign, setAttendeeCallsign] = useState(currentUser.callsign);
  const [attendeeEmail, setAttendeeEmail] = useState('operative@sdc.internal');
  const [seatTier, setSeatTier] = useState<PhysicalTicketPass['seatTier']>('GENERAL_OPERATIVE');
  const [track, setTrack] = useState<DomainTrack>(currentUser.track);
  const [generatedPass, setGeneratedPass] = useState<PhysicalTicketPass | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const currentEvent =
    eventsList.find((e) => e.id === selectedEventId) ||
    (targetEvent && 'venueCoords' in targetEvent ? targetEvent : null) ||
    eventsList[0];

  const handleGenerateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    playCyberClick();

    const ticketSerial = `SDC-PASS-${Math.floor(1000 + Math.random() * 9000)}-X${Math.floor(1 + Math.random() * 9)}`;
    const barcode = `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`;
    const secCode = `AUTH-${Math.random().toString(36).substring(2, 7).toUpperCase()}-SEC`;

    const newPass: PhysicalTicketPass = {
      ticketId: ticketSerial,
      eventId: currentEvent?.id || 'evt-01',
      eventTitle: currentEvent?.title || (targetEvent ? targetEvent.title : 'SDC_EVENT'),
      eventDate: currentEvent?.date || (targetEvent ? targetEvent.date : '2026-09-18'),
      eventTime: 'time' in (currentEvent || {}) ? (currentEvent as ClubEvent).time : '18:00 EST',
      eventLocation: currentEvent?.location || (targetEvent ? targetEvent.location : 'Sector 01 Complex'),
      attendeeName: attendeeName || currentUser.fullName,
      attendeeCallsign: attendeeCallsign || currentUser.callsign,
      attendeeEmail,
      attendeeRole: currentUser.roleTitle,
      attendeeTrack: track,
      seatTier,
      qrPayload: JSON.stringify({
        tkt: ticketSerial,
        user: attendeeName || currentUser.fullName,
        role: currentUser.roleTitle,
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
          className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-700 shadow-2xl p-6 sm:p-8 z-10 my-8 tech-corner-box font-mono max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Ticket size={16} className="text-purple-400" />
              <span className="font-bold text-white">[EVENT_RSVP_&_PASS_MINTING]</span>
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

          {!generatedPass ? (
            /* RSVP REGISTRATION FORM */
            <form onSubmit={handleGenerateTicket} className="mt-6 space-y-5 text-xs">
              {/* Event Selector */}
              <div>
                <label className="block text-zinc-400 mb-1.5 font-bold">SELECT EVENT / GATHERING</label>
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
                <label className="block text-zinc-400 mb-1.5 font-bold">SELECT SEAT / ACCESS TIER</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'GENERAL_OPERATIVE', label: 'OPERATIVE' },
                    { id: 'HACKER_ACCESS', label: 'HACKER VIP' },
                    { id: 'VIP_SPEAKER', label: 'SPEAKER' },
                    { id: 'PRESS_EDITORIAL', label: 'PRESS ZINE' },
                  ].map((tier) => (
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
                  <label className="block text-zinc-400 mb-1">OPERATIVE CALLSIGN (@)</label>
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
                  <select
                    value={track}
                    onChange={(e) => setTrack(e.target.value as DomainTrack)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white focus:outline-none"
                  >
                    <option value="CORE_CODE">CORE_CODE</option>
                    <option value="GENERATIVE_AI">GENERATIVE_AI</option>
                    <option value="CYBER_SECURITY">CYBER_SECURITY</option>
                    <option value="CREATIVE_3D">CREATIVE_3D</option>
                    <option value="PRODUCT_DESIGN">PRODUCT_DESIGN</option>
                  </select>
                </div>
              </div>

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
                  className="px-6 py-2.5 bg-gradient-to-r from-white via-zinc-200 to-white text-black font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] flex items-center gap-2"
                >
                  <Sparkles size={14} />
                  <span>MINT HOLOGRAPHIC PASS</span>
                </button>
              </div>
            </form>
          ) : (
            /* GENERATED PASS DISPLAY & DOWNLOAD ACTIONS */
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between text-emerald-400 font-bold text-xs pb-2 border-b border-zinc-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> PASS ISSUED & VERIFIED ON CHAIN
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
                <span>SCANNABLE AT VENUE TERMINALS</span>
                <button
                  onClick={() => setGeneratedPass(null)}
                  className="text-purple-400 hover:underline"
                >
                  &larr; MINT ANOTHER PASS
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
