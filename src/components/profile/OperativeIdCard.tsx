import React from 'react';
import { ClubMember } from '../../types';
import { HolographicCard3D } from '../3d/HolographicCard3D';
import { ChromeBadge } from '../common/ChromeBadge';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Sparkles, Download, Cpu } from 'lucide-react';
import { playCyberClick } from '../common/AudioEffects';

interface OperativeIdCardProps {
  member: ClubMember;
  onDownloadCard?: () => void;
}

export const OperativeIdCard: React.FC<OperativeIdCardProps> = ({
  member,
  onDownloadCard,
}) => {
  const qrVerification = JSON.stringify({
    opId: member.opId,
    callsign: member.callsign,
    tier: member.tier,
    auth: 'SEC_OK_2026',
  });

  return (
    <div className="w-full max-w-sm mx-auto">
      <HolographicCard3D intensity={18}>
        <div
          id="operative-id-card-node"
          className="relative bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-zinc-500 p-6 tech-corner-box shadow-2xl overflow-hidden font-mono select-none"
        >
          {/* Top Lanyard Punch Slot */}
          <div className="flex justify-center pb-4">
            <div className="w-16 h-2.5 bg-zinc-950 border border-zinc-700 rounded-full" />
          </div>

          {/* Top Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-[9px] text-zinc-400">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <span className="text-purple-400">✦</span> SDC // IDENT_SYS
            </div>
            <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold">
              {member.opId}
            </span>
          </div>

          {/* Member Photo & Callsign */}
          <div className="mt-4 flex items-center gap-4">
            <div className="relative w-20 h-20 bg-zinc-900 border-2 border-white/80 shrink-0 overflow-hidden">
              <img
                src={member.avatarUrl}
                alt={member.fullName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-scanline opacity-30 pointer-events-none" />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="text-[9px] text-purple-400 font-bold">
                @{member.callsign}
              </div>
              <h3 className="font-syne font-black text-lg text-white truncate">
                {member.fullName}
              </h3>
              <div className="text-[10px] text-zinc-400 truncate">
                {member.roleTitle}
              </div>
            </div>
          </div>

          {/* Track and Location Spec */}
          <div className="mt-4 grid grid-cols-2 gap-2 p-2 bg-zinc-900/60 border border-zinc-800 text-[9px]">
            <div>
              <div className="text-zinc-500">DOMAIN TRACK:</div>
              <div className="font-bold text-zinc-200 truncate">{member.track}</div>
            </div>
            <div>
              <div className="text-zinc-500">GRID LOC:</div>
              <div className="font-bold text-zinc-200">{member.location}</div>
            </div>
          </div>

          {/* Hours and Modules Status */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[9px]">
            <div className="p-1.5 bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">LOGGED: </span>
              <span className="font-bold text-white">{member.hoursContributed}h</span>
            </div>
            <div className="p-1.5 bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">STATUS: </span>
              <span className="font-bold text-emerald-400">{member.status}</span>
            </div>
          </div>

          {/* Bottom Bar: QR Code and Barcode */}
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
            <div className="p-1 bg-white border border-white">
              <QRCodeSVG value={qrVerification} size={48} level="M" />
            </div>

            <div className="flex-1 space-y-1 text-right">
              <div className="w-full h-4 barcode-strip opacity-70" />
              <div className="text-[8px] text-zinc-500 tracking-tighter">
                CERT_SHA256_VALID_2026
              </div>
            </div>
          </div>

          {/* Holographic Watermark Sheen */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
        </div>
      </HolographicCard3D>
    </div>
  );
};
