import React from 'react';
import { ClubMember } from '../../types';
import { ChromeBadge } from '../common/ChromeBadge';
import { ArrowUpRight, Shield, Award, Terminal } from 'lucide-react';
import { playCyberClick, playHoverBeep } from '../common/AudioEffects';

interface OperativeRowProps {
  member: ClubMember;
  onSelect: (member: ClubMember) => void;
}

export const OperativeRow: React.FC<OperativeRowProps> = ({ member, onSelect }) => {
  const getTrackBadge = (track: string) => {
    switch (track) {
      case 'CORE_CODE':
        return <ChromeBadge label="CODE" variant="dark" size="sm" />;
      case 'GENERATIVE_AI':
        return <ChromeBadge label="AI_NEURAL" variant="holo" size="sm" />;
      case 'CYBER_SECURITY':
        return <ChromeBadge label="CYBER_OPS" variant="alert" size="sm" />;
      case 'CREATIVE_3D':
        return <ChromeBadge label="3D_SHADER" variant="silver" size="sm" />;
      case 'PRODUCT_DESIGN':
        return <ChromeBadge label="ACUBI_UI" variant="silver" size="sm" />;
      default:
        return <ChromeBadge label={track} variant="dark" size="sm" />;
    }
  };

  return (
    <div
      onClick={() => {
        playCyberClick();
        onSelect(member);
      }}
      onMouseEnter={() => playHoverBeep()}
      className="cursor-pointer bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-500 p-4 transition-all duration-200 group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 tech-corner-box hover:bg-zinc-900/40"
    >
      {/* Left: Avatar, Name & Role */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative w-11 h-11 shrink-0 bg-zinc-900 border border-zinc-700 overflow-hidden group-hover:border-white transition-colors">
          <img
            src={member.avatarUrl}
            alt={member.fullName}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-syne font-bold text-sm text-white group-hover:text-zinc-200 transition-colors truncate">
              {member.fullName}
            </span>
            <span className="font-mono text-[9px] text-zinc-500">@{member.callsign}</span>
          </div>
          <p className="font-mono text-[10px] text-zinc-400 truncate mt-0.5">
            {member.roleTitle}
          </p>
        </div>
      </div>

      {/* Center: Track & Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {getTrackBadge(member.track)}
        <span className="font-mono text-[9px] px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400">
          {member.opId}
        </span>
      </div>

      {/* Right: Hours, Projects & Drawer Action */}
      <div className="flex items-center gap-6 font-mono text-xs text-zinc-400 select-none w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-900">
        <div className="text-left sm:text-right">
          <div className="text-[8px] text-zinc-600">HOURS LOGGED</div>
          <div className="font-bold text-white text-xs">{member.hoursContributed} HRS</div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-[8px] text-zinc-600">PROJECTS</div>
          <div className="font-bold text-white text-xs">{member.projectsCount} SHIPPED</div>
        </div>

        <div className="w-8 h-8 rounded-none border border-zinc-800 group-hover:border-white flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors bg-zinc-900">
          <ArrowUpRight size={14} />
        </div>
      </div>
    </div>
  );
};
