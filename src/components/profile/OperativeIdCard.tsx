import React from 'react';
import { ClubMember } from '../../types';
import { QrCode, Sparkles } from 'lucide-react';
import { getRoleTier, getRoleStyles } from '../../utils/roleUtils';

interface OperativeIdCardProps {
  member: Partial<ClubMember>;
}

export const OperativeIdCard: React.FC<OperativeIdCardProps> = ({ member }) => {
  const roleTier = getRoleTier(member);
  const styles = getRoleStyles(roleTier);

  const displayName =
    member.fullName ||
    `${member.firstName || ''} ${member.lastName || ''}`.trim() ||
    'Kasinath R';
  const roleTitle =
    member.role ||
    member.roleTitle ||
    (roleTier === 'SUPER_ADMIN' ? 'CLUB LEAD' : roleTier === 'ADMIN' ? 'ADMIN' : 'CLUB MEMBER');
  const handle = member.username || member.callsign || 'zephyrkz0';

  return (
    <div
      className={`w-full max-w-[320px] p-5 rounded-none relative overflow-hidden font-mono select-none transition-all duration-300 ${styles.cardBgClass} ${styles.cardBorderClass} ${styles.cardGlowClass}`}
    >
      {/* Top Lanyard Cutout Slot */}
      <div className="w-16 h-2 mx-auto bg-amber-500/80 rounded-full mb-4 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />

      {/* Pass Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-[10px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Sparkles size={11} className={styles.textColor} />
          <span className="font-bold text-white tracking-wider">SKILL DEVELOPMENT CLUB</span>
        </div>
        <span className="text-[9px] text-zinc-500 uppercase">OFFICIAL PASS</span>
      </div>

      {/* Role Badge */}
      <div className="mt-3 flex justify-start">
        <span className={styles.badgeClass}>{styles.label}</span>
      </div>

      {/* Avatar & Name Section */}
      <div className="mt-4 flex items-center gap-3.5">
        <div
          className={`w-16 h-16 shrink-0 overflow-hidden flex items-center justify-center bg-black ${styles.avatarBorderClass}`}
        >
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className={`font-syne font-black text-2xl uppercase ${styles.textColor}`}>
              {displayName.charAt(0) || 'K'}
            </span>
          )}
        </div>

        <div className="min-w-0 space-y-0.5">
          <h3 className="font-syne font-black text-base text-white truncate">{displayName}</h3>
          <div className="text-[11px] font-mono font-bold text-amber-400 truncate">
            {roleTitle}
          </div>
        </div>
      </div>

      {/* Academic & Track Meta */}
      <div className="mt-4 p-2.5 bg-black/60 border border-zinc-800 space-y-1.5 text-[9px]">
        <div className="flex justify-between text-zinc-400">
          <span>TRACK:</span>
          <span className="text-white font-bold truncate max-w-[140px]">
            {member.track || 'AI & Machine Learning'}
          </span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>BRANCH • SEM:</span>
          <span className="text-zinc-300 font-bold">
            {member.branch || 'Computer'} {member.semester || 'S1'}
          </span>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-3 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
        <span>
          HOURS: <strong className="text-zinc-300">{member.hoursContributed || 0}h</strong>
        </span>
        <span className="text-emerald-400 flex items-center gap-1 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          STATUS: ACTIVE
        </span>
      </div>

      {/* Barcode & QR Code Footer */}
      <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[8px] text-zinc-500">
        <div className="w-9 h-9 border border-zinc-700 bg-white/5 flex items-center justify-center">
          <QrCode size={22} className="text-white" />
        </div>

        <div className="text-right space-y-0.5">
          <div className="font-mono tracking-widest text-zinc-400 text-[10px]">||| | |||| | |||||</div>
          <div className={`font-bold tracking-widest ${styles.textColor}`}>{styles.label}</div>
        </div>
      </div>
    </div>
  );
};
export default OperativeIdCard;
