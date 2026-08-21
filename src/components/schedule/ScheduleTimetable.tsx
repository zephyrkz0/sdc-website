import React, { useState, useMemo } from 'react';
import { ScheduleSession, SessionType, ClubEvent } from '../../types';
import { SessionCard } from './SessionCard';
import { BlueprintHeader } from '../common/BlueprintHeader';
import { Search, Calendar, Filter, Sparkles, Clock, MapPin } from 'lucide-react';
import { playCyberClick } from '../common/AudioEffects';

interface ScheduleTimetableProps {
  sessions: ScheduleSession[];
  onRSVP: (session: ScheduleSession | ClubEvent) => void;
}

export const ScheduleTimetable: React.FC<ScheduleTimetableProps> = ({
  sessions,
  onRSVP,
}) => {
  const [selectedType, setSelectedType] = useState<SessionType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const sessionTypes: { id: SessionType | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'ALL SESSIONS' },
    { id: 'CODE', label: 'CODE SPRINTS' },
    { id: 'AI', label: 'AI & NEURAL' },
    { id: 'CYBER', label: 'CYBER WAR-GAMES' },
    { id: 'DESIGN', label: '3D & SHADERS' },
    { id: 'WORKSHOP', label: 'EDITORIAL ZINE' },
    { id: 'HACKATHON', label: '48H HACKATHON' },
  ];

  const filteredSessions = useMemo(() => {
    return sessions.filter((sess) => {
      const matchesSearch =
        sess.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sess.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sess.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sess.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sess.curriculum.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = selectedType === 'ALL' || sess.sessionType === selectedType;

      return matchesSearch && matchesType;
    });
  }, [sessions, searchQuery, selectedType]);

  return (
    <div className="space-y-12">
      {/* SECTION HEADER */}
      <BlueprintHeader
        stepNumber="03"
        tag="ITINERARY"
        title="SCHEDULE & ITINERARY"
        subtitle="Upcoming technical workshops, coding sprints, and hackathons."
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-zinc-950 p-4 border border-zinc-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic, instructor, curriculum keyword (e.g. PyTorch, WASM)..."
            className="w-full bg-zinc-900 border border-zinc-800 pl-9 pr-4 py-2 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>

        {/* Type Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {sessionTypes.map((t) => {
            const isSelected = selectedType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  playCyberClick();
                  setSelectedType(t.id);
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
      </div>

      {/* Session Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onRSVP={(s) => onRSVP(s)}
            />
          ))
        ) : (
          <div className="lg:col-span-2 text-center py-16 bg-zinc-950 border border-dashed border-zinc-800 font-mono text-zinc-500">
            [!] NO SCHEDULED SESSIONS MATCH CURRENT FILTERS.
          </div>
        )}
      </div>
    </div>
  );
};
