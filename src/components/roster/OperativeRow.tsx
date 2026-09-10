import React from 'react';
import { ClubMember } from '../../types';
import { ChromeBadge } from '../common/ChromeBadge';
import { ArrowUpRight, Crown, Shield } from 'lucide-react';
import { playCyberClick, playHoverBeep } from '../common/AudioEffects';
import { getRoleTier, getRoleStyles } from '../../utils/roleUtils';

interface OperativeRowProps {
  member: ClubMember;
  onSelect: (member: ClubMember) => void;
}

export const OperativeRow: React.FC<OperativeRowProps> = ({ member, onSelect }) => {
  const roleTier = getRoleTier(member);
  const styles = getRoleStyles(roleTier);

  const displayName = member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Club Member';

  return (
    <div
      onClick={() => {
        playCyberClick();
        onSelect(member);
      }}
      onMouseEnter={() => playHoverBeep()}
      className={`p-3 sm:p-4 border transition-all cursor-pointer flex items-center justify-between gap-4 group select-none ${styles.cardBgClass} ${styles.cardBorderClass} ${styles.cardGlowClass}`}
    >
      {/* Left: Avatar & Identity */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-10 h-10 shrink-0 overflow-hidden flex items-center justify-center bg-black ${styles.avatarBorderClass}`}
        >
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className={`font-syne font-black text-sm uppercase ${styles.textColor}`}>
              {displayName.charAt(0) || 'M'}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-syne font-bold text-sm text-white group-hover:text-zinc-200 truncate">
              {displayName}
            </span>
            <span className={styles.badgeClass}>{styles.label}</span>
          </div>

          {member.branch && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 truncate">
              <span>{member.branch} {member.semester ? `(${member.semester})` : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Track, Hours & Action Arrow */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden sm:block text-right font-mono text-[10px]">
          <div className="text-zinc-300 font-bold">{member.hoursContributed || 0} HOURS</div>
          <div className="text-zinc-500">{member.track || 'Web Development'}</div>
        </div>

        <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 group-hover:border-zinc-500 group-hover:text-white text-zinc-400 transition-colors">
          <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
export const MemberRow = OperativeRow;
export default OperativeRow;
