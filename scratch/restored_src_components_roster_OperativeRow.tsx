import React from 'react';
import { ClubMember } from '../../types';
import { ChromeBadge } from '../common/ChromeBadge';
import { ArrowUpRight } from 'lucide-react';
import { playCyberClick, playHoverBeep } from '../common/AudioEffects';

interface OperativeRowProps {
  member: ClubMember;
  onSelect: (member: ClubMember) => void;
}

export const OperativeRow: React.FC<OperativeRowProps> = ({ member, onSelect }) => {
  const name = member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Member';
  const handle = member.username || member.callsign || 'member';
  const projectsCount = member.projects ? member.projects.length : 0;

  return (
    <div
      onClick={() => {
        playCyberClick();
        onSelect(member);
      }}
      onMouseEnter={() => playHoverBeep()}
      style={{ backgroundColor: '#09090d' }}
      className="cursor-pointer bg-[#09090d] border border-zinc-800 hover:border-zinc-500 p-4 transition-all duration-200 group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 tech-corner-box hover:bg-[#13131a]"
    >
      {/* Left: Avatar, Name & Role */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative w-11 h-11 shrink-0 bg-[#14101e] border border-zinc-700 overflow-hidden group-hover:border-purple-400 transition-colors flex items-center justify-center">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="font-syne font-bold text-sm text-purple-300 uppercase select-none">
              {name.charAt(0) || handle.charAt(0) || 'M'}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-syne font-bold text-sm text-white group-hover:text-zinc-200 transition-colors truncate">
              {name}
            </span>
            <span className="font-mono text-[9px] text-zinc-500">@{handle}</span>
          </div>
          <p className="font-mono text-[10px] text-zinc-400 truncate mt-0.5">
            {member.role}
          </p>
        </div>
      </div>

      {/* Center: Track */}
      <div className="flex flex-wrap items-center gap-2">
        <ChromeBadge label={member.track || 'Full-Stack'} variant="dark" size="sm" />
        <span className="font-mono text-[9px] px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400">
          {member.status || 'ACTIVE'}
        </span>
      </div>

      {/* Right: Hours, Projects & Action */}
      <div className="flex items-center gap-6 font-mono text-xs text-zinc-400 select-none w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-900">
        <div className="text-left sm:text-right">
          <div className="text-[8px] text-zinc-600 uppercase">HOURS</div>
          <div className="font-bold text-white text-xs">{member.hoursContributed || 0} hrs</div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-[8px] text-zinc-600 uppercase">PROJECTS</div>
          <div className="font-bold text-white text-xs">{projectsCount} built</div>
        </div>

        <div className="w-8 h-8 rounded-none border border-zinc-800 group-hover:border-white flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors bg-zinc-900">
          <ArrowUpRight size={14} />
        </div>
      </div>
    </div>
  );
};
