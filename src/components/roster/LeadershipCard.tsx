import React from 'react';
import { ClubMember } from '../../types';
import { ChromeBadge } from '../common/ChromeBadge';
import { HolographicCard3D } from '../3d/HolographicCard3D';
import { GithubIcon, TwitterIcon, LinkedinIcon } from '../common/Icons';
import { ExternalLink, Shield, Sparkles } from 'lucide-react';
import { playCyberClick, playHoverBeep } from '../common/AudioEffects';

interface LeadershipCardProps {
  member: ClubMember;
  onSelect: (member: ClubMember) => void;
}

export const LeadershipCard: React.FC<LeadershipCardProps> = ({ member, onSelect }) => {
  return (
    <HolographicCard3D intensity={12}>
      <div
        onClick={() => {
          playCyberClick();
          onSelect(member);
        }}
        onMouseEnter={() => playHoverBeep()}
        className="cursor-pointer bg-zinc-950 border border-zinc-700/80 p-5 relative overflow-hidden group hover:border-white transition-all duration-300 tech-corner-box shadow-lg"
      >
        {/* Top Header with Op ID and Badge */}
        <div className="flex items-center justify-between font-mono text-[9px] text-zinc-400 pb-3 border-b border-zinc-800 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="font-bold text-white tracking-widest">{member.opId}</span>
          </div>
          <ChromeBadge label={member.tier === 'COMMAND_LEADERSHIP' ? 'COMMAND' : 'EX_COM'} variant="silver" size="sm" />
        </div>

        {/* Member Photo & Callsign */}
        <div className="mt-4 flex items-start gap-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-zinc-900 border border-zinc-700 overflow-hidden group-hover:border-white transition-colors">
            <img
              src={member.avatarUrl}
              alt={member.fullName}
              className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
            />
            {/* Scanline overlay */}
            <div className="absolute inset-0 bg-scanline opacity-30 pointer-events-none" />
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <span className="font-mono text-[9px] text-purple-400 tracking-wider">
              @{member.callsign}
            </span>
            <h3 className="font-syne font-black text-lg text-white truncate group-hover:text-zinc-200 transition-colors">
              {member.fullName}
            </h3>
            <p className="font-mono text-[10px] text-zinc-400 leading-tight">
              {member.roleTitle}
            </p>
          </div>
        </div>

        {/* Bio snippet */}
        <p className="mt-3 font-mono text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
          {member.bio}
        </p>

        {/* Stats Strip */}
        <div className="mt-4 grid grid-cols-3 gap-2 py-2 border-y border-zinc-900 font-mono text-center select-none bg-zinc-900/30">
          <div>
            <div className="text-[8px] text-zinc-500">HOURS</div>
            <div className="text-xs font-bold text-white">{member.hoursContributed}h</div>
          </div>
          <div>
            <div className="text-[8px] text-zinc-500">MODULES</div>
            <div className="text-xs font-bold text-white">{member.completedModules}</div>
          </div>
          <div>
            <div className="text-[8px] text-zinc-500">PROJECTS</div>
            <div className="text-xs font-bold text-white">{member.projectsCount}</div>
          </div>
        </div>

        {/* Skills Pills */}
        <div className="mt-3 flex flex-wrap gap-1">
          {member.skills.slice(0, 3).map((sk) => (
            <span
              key={sk}
              className="px-1.5 py-0.5 font-mono text-[9px] bg-zinc-900 text-zinc-300 border border-zinc-800"
            >
              {sk}
            </span>
          ))}
          {member.skills.length > 3 && (
            <span className="px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">
              +{member.skills.length - 3}
            </span>
          )}
        </div>

        {/* Bottom Bar: Action Trigger & Barcode */}
        <div className="mt-4 pt-2 flex items-center justify-between text-[9px] font-mono text-zinc-500">
          <span className="text-zinc-300 font-bold group-hover:text-white flex items-center gap-1">
            VIEW DOSSIER &gt;
          </span>
          <div className="w-12 h-1.5 barcode-strip opacity-30 group-hover:opacity-70 transition-opacity" />
        </div>
      </div>
    </HolographicCard3D>
  );
};
