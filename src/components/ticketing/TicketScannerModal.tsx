import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, CheckCircle2, AlertTriangle, Search, Shield, User, Sparkles } from 'lucide-react';
import { PhysicalTicketPass } from '../../types';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';
import confetti from 'canvas-confetti';

interface TicketScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: PhysicalTicketPass[];
  onCheckIn: (ticketId: string) => void;
}

export const TicketScannerModal: React.FC<TicketScannerModalProps> = ({
  isOpen,
  onClose,
  tickets,
  onCheckIn,
}) => {
  const [scanInput, setScanInput] = useState('');
  const [scannedResult, setScannedResult] = useState<PhysicalTicketPass | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setScannedResult(null);

    const cleanInput = scanInput.trim().toUpperCase();
    if (!cleanInput) return;

    // Search by ticketId or QR payload substring
    const matched = tickets.find(
      (t) =>
        t.ticketId.toUpperCase() === cleanInput ||
        t.qrPayload.includes(cleanInput) ||
        t.attendeeCallsign.toUpperCase().includes(cleanInput) ||
        t.barcodeNumber.includes(cleanInput)
    );

    if (matched) {
      setScannedResult(matched);
      onCheckIn(matched.ticketId);
      playSuccessChime();
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } else {
      playCyberClick();
      setErrorMsg(`NO VALID PASS FOUND FOR [${cleanInput}]. CHECK-IN REJECTED.`);
    }
  };

  const handleQuickTestScan = (ticket: PhysicalTicketPass) => {
    setScanInput(ticket.ticketId);
    setScannedResult(ticket);
    onCheckIn(ticket.ticketId);
    playSuccessChime();
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-zinc-950 border border-zinc-700 shadow-2xl p-6 z-10 font-mono"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <QrCode size={16} className="text-purple-400" />
              <span className="font-bold text-white uppercase tracking-wider">EVENT TICKET SCANNER & CHECK-IN</span>
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

          {/* Scanner Optical Viewfinder Mock */}
          <div className="mt-5 p-6 bg-zinc-900/60 border border-zinc-800 relative overflow-hidden flex flex-col items-center justify-center">
            {/* Viewfinder crosshairs */}
            <div className="w-48 h-48 border-2 border-dashed border-purple-400/60 relative flex items-center justify-center">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white" />
              
              {/* Laser Scanning Line Animation */}
              <motion.div
                animate={{ y: [-80, 80, -80] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_12px_rgba(168,85,247,0.8)]"
              />

              <span className="font-mono text-[9px] text-purple-300/80 uppercase">
                OPTICAL_SCAN_ACTIVE
              </span>
            </div>
          </div>

          {/* Scan Input Form */}
          <form onSubmit={handleScan} className="mt-5 space-y-3">
            <label className="block text-[11px] text-zinc-400">
              ENTER TICKET ID OR BARCODE DATA FOR IMMEDIATE AUTHENTICATION:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="e.g. SDC-PASS-8842-X9"
                className="flex-1 bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono uppercase"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-white text-black font-bold text-xs uppercase hover:bg-zinc-200"
              >
                AUTHENTICATE
              </button>
            </div>
          </form>

          {/* Error Notice */}
          {errorMsg && (
            <div className="mt-4 p-3 bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Scanned Success Result Dossier */}
          {scannedResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-emerald-950/30 border border-emerald-500/50 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between text-emerald-400 font-bold pb-2 border-b border-emerald-500/30">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> PASS VERIFIED & CHECKED IN
                </span>
                <span>[ACCESS_GRANTED]</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-zinc-300 text-[11px]">
                <div>
                  <span className="text-zinc-500">ATTENDEE: </span>
                  <span className="font-bold text-white">{scannedResult.attendeeName}</span>
                </div>
                <div>
                  <span className="text-zinc-500">CALLSIGN: </span>
                  <span className="text-purple-400">@{scannedResult.attendeeCallsign}</span>
                </div>
                <div>
                  <span className="text-zinc-500">EVENT: </span>
                  <span className="text-white">{scannedResult.eventTitle}</span>
                </div>
                <div>
                  <span className="text-zinc-500">SEAT TIER: </span>
                  <span className="text-zinc-200 font-bold">{scannedResult.seatTier}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Test Passes Available */}
          <div className="mt-5 pt-3 border-t border-zinc-900">
            <div className="text-[10px] text-zinc-500 mb-2">QUICK TEST REGISTERED PASSES:</div>
            <div className="flex flex-wrap gap-2">
              {tickets.map((t) => (
                <button
                  key={t.ticketId}
                  onClick={() => handleQuickTestScan(t)}
                  className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 hover:text-white"
                >
                  TEST: {t.ticketId} ({t.attendeeCallsign})
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
