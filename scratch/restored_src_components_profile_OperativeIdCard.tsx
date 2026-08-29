import React from 'react';
import { ClubMember } from '../../types';
import { HolographicCard3D } from '../3d/HolographicCard3D';
import { QRCodeSVG } from 'qrcode.react';
import { Crown, Shield, Sparkles } from 'lucide-react';
import { getRoleTier, getRoleStyles } from '../../utils/roleUtils';

interface OperativeIdCardProps {
  member: ClubMember;
  onDownloadCard?: () => void;
}

export const OperativeIdCard: React.FC<OperativeIdCardProps> = ({
  member,
}) => {
  const name = member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Member';
  const handle = member.username || member.callsign || 'member';
  const opId = member.opId || `SDC-OP-${member.id.substring(0, 5).toUpperCase()}`;
  const role = member.role || member.roleTitle || 'Club Member';

  const tier = getRoleTier(member);
  const styles = getRoleStyles(tier);

  const qrVerification = JSON.stringify({
    opId,
    username: handle,
    name,
    role,
    tier,
    status: 'ACTIVE_MEMBER',
  });

  const cardBackground =
    tier === 'SUPER_ADMIN'
      ? 'bg-gradient-to-b from-[#181308] via-[#0d0a06] to-[#060402] border-2 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.35),inset_0_0_20px_rgba(251,191,36,0.08)]'
      : tier === 'ADMIN'
      ? 'bg-gradient-to-b from-[#140f06] via-[#0a0804] to-[#050402] border-2 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
      : 'bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-zinc-700 shadow-2xl';

  return (
    <div className="w-full max-w-sm mx-auto">
      <HolographicCard3D intensity={tier === 'SUPER_ADMIN' ? 22 : tier === 'ADMIN' ? 16 : 10}>
        <div
          id="operative-id-card-node"
          className={`relative p-6 tech-corner-box overflow-hidden font-mono select-none ${cardBackground}`}
        >
          {/* Top Lanyard Punch Slot */}
          <div className="flex justify-center pb-4">
            <div
              className={`w-16 h-2.5 rounded-full ${
                tier === 'SUPER_ADMIN'
                  ? 'bg-amber-950 border border-amber-400'
                  : tier === 'ADMIN'
                  ? 'bg-amber-950 border border-amber-600'
                  : 'bg-zinc-950 border border-zinc-700'
              }`}
            />
          </div>

                  : 'bg-zinc-950 border border-zinc-700'
              }`}
            />
          </div>

          {/* Top Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-[9px] text-zinc-400 relative z-10">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <span className={tier === 'SUPER_ADMIN' ? 'text-amber-400 animate-pulse' : 'text-purple-400'}>✦</span>
              <span>SKILL DEVELOPMENT CLUB</span>
            </div>
            <span
              className={`px-1.5 py-0.2 font-bold ${
                tier === 'SUPER_ADMIN'
                  ? 'bg-amber-950 text-amber-300 border border-amber-400'
                  : tier === 'ADMIN'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-600'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}
            >
              {opId}
            </span>
          </div>

          {/* Role Status Tier Banner */}
          {tier !== 'MEMBER' && (
              <Sparkles size={11} className="text-amber-400" />
            </div>
          )}

          {/* Member Photo & Callsign */}
              <div className="font-bold text-zinc-200 truncate">
                {member.branch ? `${member.branch.split(' ')[0]} ${member.semester || ''}` : member.semester || 'CUCEK'}
              </div>
            </div>
          </div>

          {/* Hours and Status */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[9px]">
            <div className="p-1.5 bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">HOURS: </span>
              <span className="font-bold text-white">{member.hoursContributed || 0}h</span>
            </div>
            <div className="p-1.5 bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">STATUS: </span>
              <span className="font-bold text-emerald-400">{member.status || 'ACTIVE'}</span>
            </div>
          </div>

          {/* Bottom Bar: QR Code and Barcode */}
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
            <div className="p-1 bg-white border border-white">
              <QRCodeSVG value={qrVerification} size={48} level="M" />
            </div>

            <div className="flex-1 space-y-1 text-right">
              <div className="w-full h-4 barcode-strip opacity-70" />
              <div className="text-[8px] text-zinc-400 tracking-wider font-bold">
                VERIFIED SDC MEMBER
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

export default OperativeIdCard;
