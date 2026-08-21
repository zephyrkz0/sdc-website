import React, { useState, useMemo } from 'react';
import { ClubMember, DomainTrack } from '../../types';
import { LeadershipCard } from './LeadershipCard';
import { OperativeRow } from './OperativeRow';
import { MemberModal } from './MemberModal';
import { BlueprintHeader } from '../common/BlueprintHeader';
import { Search, Filter, Shield, Users, Sparkles, LayoutGrid, List } from 'lucide-react';
import { playCyberClick } from '../common/AudioEffects';

interface MemberDirectoryProps {
  members: ClubMember[];
}

export const MemberDirectory: React.FC<MemberDirectoryProps> = ({ members }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<DomainTrack | 'ALL'>('ALL');
  const [selectedMember, setSelectedMember] = useState<ClubMember | null>(null);
  const [sortBy, setSortBy] = useState<'HOURS' | 'PROJECTS' | 'NAME'>('HOURS');

  // Segregate Leadership vs Operatives
  const leadershipMembers = useMemo(() => {
    return members.filter(
      (m) => m.tier === 'COMMAND_LEADERSHIP' || m.tier === 'CORE_EXCOM'
    );
  }, [members]);

  const filteredOperatives = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.opId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTrack = selectedTrack === 'ALL' || m.track === selectedTrack;

      return matchesSearch && matchesTrack;
    }).sort((a, b) => {
      if (sortBy === 'HOURS') return b.hoursContributed - a.hoursContributed;
      if (sortBy === 'PROJECTS') return b.projectsCount - a.projectsCount;
      return a.fullName.localeCompare(b.fullName);
    });
  }, [members, searchQuery, selectedTrack, sortBy]);

  const tracks: { id: DomainTrack | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'ALL TRACKS' },
    { id: 'CORE_CODE', label: 'FULLSTACK & CODE' },
    { id: 'GENERATIVE_AI', label: 'AI & NEURAL' },
    { id: 'CYBER_SECURITY', label: 'CYBER OPS' },
    { id: 'CREATIVE_3D', label: '3D & SHADERS' },
    { id: 'PRODUCT_DESIGN', label: 'ACUBI EDITORIAL' },
  ];

  return (
    <div className="space-y-16">
      {/* SECTION 2.1: LEADERSHIP COMMAND TIER */}
      <section>
        <BlueprintHeader
          stepNumber="02"
          tag="PERSONNEL_ROSTER"
          title="COMMAND TIER // CORE COUNCIL"
          subtitle="Founders, Executive Committee leads, and lead domain architects orchestrating club curricula and technical operations."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {leadershipMembers.map((member) => (
            <LeadershipCard
              key={member.id}
              member={member}
              onSelect={(m) => setSelectedMember(m)}
            />
          ))}
        </div>
      </section>

      {/* SECTION 2.2: ACTIVE OPERATIVES DATABASE */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="font-mono text-[10px] text-zinc-500">// DATABASE_VIEW</div>
            <h3 className="text-2xl sm:text-3xl font-black font-syne text-white uppercase tracking-tight">
              ACTIVE OPERATIVES MATRIX
            </h3>
          </div>
          <div className="font-mono text-xs text-zinc-400">
            TOTAL ACTIVE: <span className="text-white font-bold">{filteredOperatives.length}</span> OPERATIVES
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-zinc-950 p-4 border border-zinc-800">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, callsign (@...), skill (e.g. GLSL), or ID..."
              className="w-full bg-zinc-900 border border-zinc-800 pl-9 pr-4 py-2 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* Track Filter Buttons (Scrollable) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {tracks.map((t) => {
              const isSelected = selectedTrack === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    playCyberClick();
                    setSelectedTrack(t.id);
                  }}
                  className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider whitespace-nowrap border transition-all ${
                    isSelected
                      ? 'bg-zinc-200 text-black border-white font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 font-mono text-xs shrink-0">
            <span className="text-zinc-500 text-[10px]">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'HOURS' | 'PROJECTS' | 'NAME')}
              className="bg-zinc-900 border border-zinc-800 px-2 py-1.5 font-mono text-xs text-zinc-300 focus:outline-none"
            >
              <option value="HOURS">HOURS LOGGED</option>
              <option value="PROJECTS">PROJECTS SHIPPED</option>
              <option value="NAME">NAME (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Database List */}
        <div className="space-y-3">
          {filteredOperatives.length > 0 ? (
            filteredOperatives.map((member) => (
              <OperativeRow
                key={member.id}
                member={member}
                onSelect={(m) => setSelectedMember(m)}
              />
            ))
          ) : (
            <div className="text-center py-16 bg-zinc-950 border border-dashed border-zinc-800 font-mono text-zinc-500">
              [!] NO OPERATIVES MATCH CURRENT SEARCH QUERY OR FILTER.
            </div>
          )}
        </div>
      </section>

      {/* Member Details Modal / Drawer */}
      <MemberModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
};
