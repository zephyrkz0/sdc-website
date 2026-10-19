import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, CheckCircle2, AlertTriangle, Camera, CameraOff, Video } from 'lucide-react';
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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Stop camera stream safely
  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError('');
  };

  // Close on Escape & cleanup
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopCamera();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopCamera();
    };
  }, [isOpen, onClose]);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError('');
    setErrorMsg('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access not supported on this device/browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);

      // Start detection loop if BarcodeDetector is available
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['qr_code', 'code_128', 'ean_13', 'data_matrix'],
        });

        scanIntervalRef.current = window.setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const detected = await barcodeDetector.detect(videoRef.current);
            if (detected && detected.length > 0) {
              const rawValue = detected[0].rawValue;
              if (rawValue) {
                checkAndAdmitTicket(rawValue);
                stopCamera();
              }
            }
          } catch {}
        }, 400);
      }
    } catch (err: any) {
      console.warn('Camera stream notice:', err);
      setCameraError(err.message || 'Unable to access camera. Please allow camera permissions.');
      setIsCameraActive(false);
    }
  };

  const checkAndAdmitTicket = (input: string) => {
    const clean = input.trim();
    if (!clean) return;

    const upper = clean.toUpperCase();

    // Strict validation: Require exact match on ticketId, barcode, security code, or parsed QR payload
    const matched = tickets.find((t) => {
      // 1. Exact match on ticketId
      if (t.ticketId.toUpperCase() === upper) return true;

      // 2. Exact match on barcodeNumber
      if (t.barcodeNumber && t.barcodeNumber === clean) return true;

      // 3. Exact match on accessSecurityCode
      if (t.accessSecurityCode && t.accessSecurityCode.toUpperCase() === upper) return true;

      // 4. Exact match or parsed JSON from ticket QR payload
      try {
        if (t.qrPayload) {
          if (t.qrPayload.trim() === clean) return true;
          const parsed = JSON.parse(t.qrPayload);
          if (parsed.tkt && parsed.tkt.toUpperCase() === upper) return true;
          if (parsed.sec && parsed.sec.toUpperCase() === upper) return true;
        }
      } catch {}

      // 5. Scanned input is JSON payload
      try {
        const inputParsed = JSON.parse(clean);
        if (inputParsed.tkt && t.ticketId.toUpperCase() === inputParsed.tkt.toUpperCase()) return true;
        if (inputParsed.sec && t.accessSecurityCode && t.accessSecurityCode.toUpperCase() === inputParsed.sec.toUpperCase()) return true;
      } catch {}

      return false;
    });

    if (matched) {
      setScannedResult(matched);
      onCheckIn(matched.ticketId);
      playSuccessChime();
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      setErrorMsg('');
    } else {
      playCyberClick();
      setErrorMsg(`No valid ticket found matching exact identifier [${clean}].`);
    }
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setScannedResult(null);
    checkAndAdmitTicket(scanInput);
  };

  const handleQuickTestScan = (ticket: PhysicalTicketPass) => {
    setScanInput(ticket.ticketId);
    checkAndAdmitTicket(ticket.ticketId);
  };

  if (!isOpen) return null;

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
            stopCamera();
            onClose();
          }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ticket-scanner-title"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-zinc-950 border border-zinc-700 shadow-2xl p-6 z-10 font-mono max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <QrCode size={16} className="text-purple-400" />
              <span id="ticket-scanner-title" className="font-bold text-white uppercase tracking-wider">
                EVENT TICKET SCANNER & CHECK-IN
              </span>
            </div>
            <button
              onClick={() => {
                playCyberClick();
                stopCamera();
                onClose();
              }}
              className="p-1 text-zinc-500 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scanner Optical Viewfinder & Camera Stream */}
          <div className="mt-5 p-4 bg-zinc-900/60 border border-zinc-800 relative overflow-hidden flex flex-col items-center justify-center">
            {isCameraActive ? (
              <div className="relative w-full max-w-sm aspect-video bg-black flex items-center justify-center overflow-hidden border border-purple-500/50">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Laser Scanning Line */}
                <motion.div
                  animate={{ y: [-70, 70, -70] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_12px_rgba(168,85,247,0.9)]"
                />
              </div>
            ) : (
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
                  READY TO SCAN
                </span>
              </div>
            )}

            {/* Camera Controls */}
            <div className="mt-3 flex items-center gap-2">
              {isCameraActive ? (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1.5 bg-red-950 border border-red-700 text-red-200 hover:bg-red-900 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <CameraOff size={13} />
                  <span>STOP CAMERA</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 bg-purple-950 border border-purple-600 text-purple-200 hover:bg-purple-900 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Camera size={13} />
                  <span>START WEBCAM SCANNER</span>
                </button>
              )}
            </div>

            {cameraError && (
              <p className="text-[10px] text-amber-400 mt-2 text-center max-w-sm">
                {cameraError}
              </p>
            )}
          </div>

          {/* Scan Input Form */}
          <form onSubmit={handleScan} className="mt-5 space-y-3">
            <label className="block text-[11px] text-zinc-400">
              ENTER EXACT TICKET ID OR BARCODE NUMBER FOR CHECK-IN:
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
                CHECK IN
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

          {/* Scanned Success Result Details */}
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
                <span>[CONFIRMED]</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-zinc-300 text-[11px]">
                <div>
                  <span className="text-zinc-500">ATTENDEE: </span>
                  <span className="font-bold text-white">{scannedResult.attendeeName}</span>
                </div>
                <div>
                  <span className="text-zinc-500">USERNAME: </span>
                  <span className="text-purple-400">@{scannedResult.attendeeCallsign}</span>
                </div>
                <div>
                  <span className="text-zinc-500">EVENT: </span>
                  <span className="text-white">{scannedResult.eventTitle}</span>
                </div>
                <div>
                  <span className="text-zinc-500">TICKET TYPE: </span>
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
export default TicketScannerModal;
