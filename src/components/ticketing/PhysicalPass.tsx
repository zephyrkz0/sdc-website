import React from 'react';
import { PhysicalTicketPass } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { HolographicCard3D } from '../3d/HolographicCard3D';
import { Sparkles, Shield, Cpu, Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';

interface PhysicalPassProps {
  pass: PhysicalTicketPass;
  id?: string;
  enable3D?: boolean;
}

export const PhysicalPass: React.FC<PhysicalPassProps> = ({
  pass,
  id = 'physical-pass-node',
  enable3D = true,
}) => {
  const content = (
    <div
      id={id}
      className="w-full max-w-xl mx-auto bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-2 border-zinc-500 p-6 sm:p-8 relative overflow-hidden font-mono select-none shadow-2xl text-zinc-200"
    >
      {/* Top Spec Bar */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-dashed border-zinc-700 text-[10px] text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            SDC // EVENT PASS
          </span>
          <span>//</span>
          <span className="text-zinc-400">{pass.seatTier}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-600 text-white font-bold tracking-wider">
            {pass.ticketId}
          </span>
        </div>
      </div>

      {/* Main Pass Body */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left 8 Cols: Event & Attendee Info */}
        <div className="md:col-span-8 space-y-4">
          <div className="space-y-1">
            <div className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">
              OFFICIAL SDC EVENT ADMISSION
            </div>
            <h3 className="font-syne font-black text-2xl sm:text-3xl text-white uppercase tracking-tight leading-tight">
              {pass.eventTitle}
            </h3>
          </div>

          {/* Date, Time, Location Strip */}
          <div className="space-y-1 text-xs text-zinc-300 bg-zinc-900/80 p-3 border border-zinc-800">
            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-purple-400" />
              <span>{pass.eventDate}</span>
              <span className="text-zinc-500">//</span>
              <Clock size={12} className="text-purple-400" />
              <span>{pass.eventTime}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-1 border-t border-zinc-800">
              <MapPin size={12} className="text-emerald-400 shrink-0" />
              <span className="truncate">{pass.eventLocation}</span>
            </div>
          </div>

          {/* Attendee Spec */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <div className="text-zinc-500">ATTENDEE:</div>
              <div className="font-bold text-white truncate text-xs">{pass.attendeeName}</div>
              <div className="text-zinc-400 text-[9px]">@{pass.attendeeCallsign}</div>
            </div>
            <div>
              <div className="text-zinc-500">TRACK / TIER:</div>
              <div className="font-bold text-zinc-200 truncate">{pass.attendeeTrack}</div>
              <div className="text-emerald-400 text-[9px] font-bold">[VERIFIED]</div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Dynamic Scannable QR & Perforation Line */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white text-black border-2 border-white space-y-2">
          <div className="p-1 bg-white">
            <QRCodeSVG value={pass.qrPayload} size={110} level="H" includeMargin={false} />
          </div>
          <div className="text-[8px] font-mono text-center tracking-wider uppercase font-bold text-zinc-800">
            CHECK-IN PASS
          </div>
          <div className="text-[7px] font-mono text-zinc-600">
            {pass.accessSecurityCode}
          </div>
        </div>
      </div>

      {/* Perforation Tear-Off Line */}
      <div className="mt-6 pt-4 border-t-2 border-dashed border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-[9px] text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="w-28 h-5 barcode-strip opacity-80" />
          <span>{pass.barcodeNumber}</span>
        </div>

        <div className="flex items-center gap-3 text-zinc-400">
          <span>ISSUED: {pass.issuedAt}</span>
          <span>//</span>
          <span className="text-white font-bold">VERIFIED</span>
        </div>
      </div>
    </div>
  );

  if (enable3D) {
    return <HolographicCard3D intensity={14}>{content}</HolographicCard3D>;
  }

  return content;
};
