import React from 'react';
import { ClubMember } from '../../types';
import { ChromeBadge } from '../common/ChromeBadge';
import { Sparkles, ArrowUpRight, Shield, Crown } from 'lucide-react';
import { playCyberClick, playHoverBeep } from '../common/AudioEffects';
import { getRoleTier, getRoleStyles } from '../../utils/roleUtils';

interface LeadershipCardProps {
  member: ClubMember;
  onSelect: (member: ClubMember) => void;
}

export const LeadershipCard: React.FC<LeadershipCardProps> = ({ member, onSelect }) => {
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
      className={`relative p-6 cursor-pointer transition-all duration-300 group flex flex-col justify-between select-none ${styles.cardBgClass} ${styles.cardBorderClass} ${styles.cardGlowClass} ${
        roleTier === 'SUPER_ADMIN' ? 'hover:scale-[1.02]' : 'hover:scale-[1.01]'
      }`}
    >
      <div>
        {/* Top Header: Badge, Role Tier & Arrow */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className={styles.badgeClass}>
              {styles.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ChromeBadge label={member.track || 'Web Development'} variant="dark" size="sm" />
            <ArrowUpRight
              size={15}
              className="text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </div>

        {/* Avatar & Main Info */}
        <div className="mt-4 flex items-center gap-4">
          <div
            className={`w-16 h-16 shrink-0 overflow-hidden flex items-center justify-center bg-black ${styles.avatarBorderClass}`}
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
              <span className={`font-syne font-black text-2xl uppercase ${styles.textColor}`}>
                {displayName.charAt(0) || 'M'}
              </span>
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="font-syne font-bold text-lg text-white group-hover:text-zinc-200 transition-colors truncate">
              {displayName}
            </h3>

            {member.branch && (
              <div className="text-[10px] font-mono text-zinc-500 truncate">
                {member.branch} {member.semester ? `• ${member.semester}` : ''}
              </div>
            )}
          </div>
        </div>

        {/* Biography Snippet */}
        <p className="mt-3 font-mono text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {member.bio || 'Active verified member of the Skill Development Club.'}
        </p>

        {/* Skills Tags */}
        {member.skills && member.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {member.skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[9px] font-mono bg-zinc-900/80 border border-zinc-800 text-zinc-400"
              >
                {skill}
              </span>
            ))}
            {member.skills.length > 3 && (
              <span className="px-1.5 py-0.5 text-[9px] font-mono text-zinc-500">
                +{member.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="mt-5 pt-3 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-500">
        <span className="text-zinc-400">
          LOGGED: <strong className="text-white">{member.hoursContributed || 0}h</strong>
        </span>
        <span className="text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ACTIVE
        </span>
      </div>
    </div>
  );
};
