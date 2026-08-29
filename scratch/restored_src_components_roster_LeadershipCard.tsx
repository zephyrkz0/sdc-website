import React from 'react';
import { ClubMember } from '../../types';
import { HolographicCard3D } from '../3d/HolographicCard3D';
import { playCyberClick, playHoverBeep } from '../common/AudioEffects';
import { ArrowUpRight } from 'lucide-react';
import { getRoleTier, getRoleStyles, getDisplayRoleTitle } from '../../utils/roleUtils';

interface LeadershipCardProps {
  member: ClubMember;
  onSelect: (member: ClubMember) => void;
}

export const LeadershipCard: React.FC<LeadershipCardProps> = ({ member, onSelect }) => {
  const name = member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Member';
  const opId = member.opId || `SDC-${(member.id || '0000').substring(0, 4).toUpperCase()}`;

  const tier = getRoleTier(member);
  const styles = getRoleStyles(tier);
  const displayRoleTitle = getDisplayRoleTitle(member);

  return (
    <HolographicCard3D intensity={tier === 'SUPER_ADMIN' ? 18 : tier === 'ADMIN' ? 12 : 8}>
      <div
        onClick={() => {
          playCyberClick();
          onSelect(member);
        }}
        onMouseEnter={() => playHoverBeep()}
        className={`cursor-pointer p-5 sm:p-6 relative overflow-hidden transition-all duration-300 tech-corner-box flex flex-col justify-between h-full min-h-[360px] ${styles.cardBorderClass}`}
      >
        {/* Radiant Ambient Glow for Super Admin */}
        {tier === 'SUPER_ADMIN' && (
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        )}

        {/* Top Header with Op ID and Role Clearance Badge */}
        <div className="flex items-center justify-between font-mono text-[10px] pb-3 border-b border-zinc-800/80 select-none relative z-10">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${styles.statusDotClass}`} />
            <span className="font-bold text-white tracking-widest">{opId}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={styles.badgeClass}>
              {styles.label}
            </span>
          </div>
        </div>

        {/* Member Photo, Name & Designated Position Title */}
        <div className="mt-4 flex items-start gap-4 relative z-10">
          <div
            className={`relative w-18 h-18 sm:w-20 sm:h-20 shrink-0 overflow-hidden transition-all shadow-inner flex items-center justify-center ${styles.avatarBorderClass}`}
          >
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className={`font-syne font-black text-2xl uppercase select-none ${styles.textColor}`}>
                {name.charAt(0) || 'M'}
              </span>
            )}
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            <h3 className="font-syne font-black text-xl sm:text-2xl text-white truncate group-hover:text-amber-300 transition-colors tracking-tight leading-snug">
              {name}
            </h3>
            <div className={`inline-block px-2.5 py-1 text-[11px] font-mono uppercase tracking-wide truncate max-w-full ${styles.roleTagClass}`}>
              {displayRoleTitle}
            </div>
          </div>
        </div>

        {/* Bio snippet */}
        <p className="mt-3.5 font-mono text-[11px] text-zinc-400 line-clamp-2 leading-relaxed min-h-[32px] relative z-10">
          {member.bio || 'Active verified operative contributing to the Skill Development Club.'}
        </p>

        {/* Stats Strip */}
        <div className="mt-4 grid grid-cols-2 gap-2 py-2.5 border-y border-zinc-900 font-mono text-center select-none bg-black/40 relative z-10">
          <div>
            <div className="text-[8px] text-zinc-500 uppercase tracking-wider font-bold">HOURS LOGGED</div>
            <div className="text-xs font-bold text-white">{member.hoursContributed || 0} hrs</div>
          </div>
          <div>
            <div className="text-[8px] text-zinc-500 uppercase tracking-wider font-bold">PROJECTS</div>
            <div className="text-xs font-bold text-white">{(member.projects || []).length} built</div>
          </div>
        </div>

        {/* Track & Skills */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 min-h-[26px] relative z-10">
          {member.track && (
            <span className="px-2 py-0.5 font-mono text-[9px] font-bold bg-[#14141d] text-zinc-300 border border-zinc-800">
              {member.track}
            </span>
          )}
          {(member.skills || []).slice(0, 2).map((sk) => (
            <span
              key={sk}
              className="px-1.5 py-0.5 font-mono text-[9px] bg-[#14141d] text-zinc-400 border border-zinc-800"
            >
              {sk}
            </span>
          ))}
          {(member.skills || []).length > 2 && (
            <span className="px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">
              +{member.skills.length - 2} more
            </span>
          )}
        </div>

        {/* Bottom Bar: Action Trigger & Meta */}
        <div className="mt-4 pt-3 flex items-center justify-between text-[10px] font-mono text-zinc-400 border-t border-zinc-900 relative z-10">
          <span className="text-zinc-300 font-bold group-hover:text-amber-300 flex items-center gap-1 transition-colors">
            <span>VIEW DOSSIER</span>
            <ArrowUpRight size={13} />
          </span>
          <span className="text-[9px] text-zinc-500 font-mono">
            {member.branch || member.semester
              ? `${member.branch || ''} ${member.semester || ''}`.trim()
              : 'VERIFIED'}
          </span>
        </div>
      </div>
    </HolographicCard3D>
  );
};

export default LeadershipCard;

            <span>VIEW DOSSIER</span>
            <ArrowUpRight size={13} />
          </span>
          <span className="text-[9px] text-zinc-600 font-mono">
            {member.branch || member.semester
              ? `${member.branch || ''} ${member.semester || ''}`.trim()
              : 'VERIFIED'}
          </span>
        </div>
      </div>
    </HolographicCard3D>
  );
};

export default LeadershipCard;

