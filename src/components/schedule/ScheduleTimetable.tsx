import React, { useState } from 'react';
import { ScheduleSession, PhysicalTicketPass } from '../../types';
import { SessionCard } from './SessionCard';
import { AddSessionModal } from './AddSessionModal';
import { Search, Plus, Calendar, Shield, Clock } from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';
import { useAuth } from '../../context/AuthContext';

interface ScheduleTimetableProps {
  sessions?: ScheduleSession[];
  onRSVP?: (session: ScheduleSession) => void;
  onAddSession?: (session: ScheduleSession) => void;
  onUpdateSession?: (session: ScheduleSession) => void;
  onDeleteSession?: (sessionId: string) => void;
  tickets?: PhysicalTicketPass[];
}

export const ScheduleTimetable: React.FC<ScheduleTimetableProps> = ({
  sessions = [],
  onRSVP,
  onAddSession,
  onUpdateSession,
  onDeleteSession,
  tickets = [],
}) => {
  const { isAdmin, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'ARCHIVE'>('UPCOMING');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<ScheduleSession | null>(null);

  const categories = [
    { id: 'ALL', label: 'All Sessions' },
    { id: 'DAILY_LAB', label: 'Daily Lab Sessions' },
    { id: 'WORKSHOPS', label: 'Workshops' },
    { id: 'TALKS', label: 'Talk Sessions' },
    { id: 'HACKATHONS', label: 'Hackathons' },
  ];

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      searchQuery === '' ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.instructorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === 'ALL' ||
      (activeCategory === 'DAILY_LAB' && (s.sessionType === 'DAILY_SESSION' || s.title.toLowerCase().includes('daily') || s.title.toLowerCase().includes('lab'))) ||
      (activeCategory === 'WORKSHOPS' && (s.sessionType === 'WORKSHOP' || s.title.toLowerCase().includes('workshop'))) ||
      (activeCategory === 'TALKS' && (s.sessionType === 'TALK' || s.title.toLowerCase().includes('talk'))) ||
      (activeCategory === 'HACKATHONS' && (s.sessionType === 'HACKATHON' || s.title.toLowerCase().includes('hackathon')));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fade-in font-mono">
      {/* Header (Frame 9) */}
      <div className="space-y-2 border-b border-zinc-800 pb-4">
        <h2 className="text-3xl sm:text-4xl font-syne font-black tracking-tight text-white uppercase">
          SCHEDULE & TIMETABLE
        </h2>
        <p className="text-xs text-zinc-400">
          Explore upcoming learning sessions, hands-on workshops, and past event archives.
        </p>
      </div>

      {/* ADMINISTRATOR EVENT CONTROLS PURPLE BANNER (Frame 9) */}
      {isAdmin && (
        <div className="p-4 sm:p-5 bg-[#0e0a16] border border-purple-600/70 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-purple-400" />
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                ADMINISTRATOR EVENT CONTROLS
              </span>
            </div>
            <p className="text-xs text-zinc-300">
              You can create and publish live sessions, workshops, and hackathons directly to the schedule.
            </p>
          </div>

          <button
            onClick={() => {
              playCyberClick();
              setAddModalOpen(true);
            }}
            className="px-4 py-2 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all flex items-center gap-1.5 whitespace-nowrap self-start md:self-auto"
          >
            <Plus size={14} />
            <span>+ SCHEDULE WORKSHOP / SESSION</span>
          </button>
        </div>
      )}

      {/* Tabs Strip (Upcoming vs Archive) */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playCyberClick();
              setActiveTab('UPCOMING');
            }}
            className={`px-4 py-2 text-xs font-bold uppercase transition-all ${
              activeTab === 'UPCOMING'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            UPCOMING SESSIONS ({filteredSessions.length})
          </button>
          <button
            onClick={() => {
              playCyberClick();
              setActiveTab('ARCHIVE');
            }}
            className={`px-4 py-2 text-xs font-bold uppercase transition-all ${
              activeTab === 'ARCHIVE'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            PAST EVENTS ARCHIVE (0)
          </button>
        </div>

        <span className="hidden sm:inline text-zinc-500 text-[10px]">
          UPCOMING SESSIONS
        </span>
      </div>

      {/* Filter Toolbar & Category Buttons (Frame 9) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d0d12] border border-zinc-800 p-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic, instructor, curriculum keyword..."
            className="w-full pl-9 pr-4 py-2 bg-[#121218] border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                playCyberClick();
                setActiveCategory(c.id);
              }}
              className={`px-3 py-1.5 font-bold uppercase transition-all ${
                activeCategory === c.id
                  ? 'bg-white text-black'
                  : 'bg-[#121218] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Grid or Empty State (Frame 9) */}
      {filteredSessions.length === 0 ? (
        <div className="p-16 bg-[#0a0a0f] border border-zinc-800 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 mx-auto bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400">
            <Calendar size={22} />
          </div>
          <div className="space-y-1">
            <h4 className="font-syne font-black text-lg text-white uppercase">
              NO UPCOMING SESSIONS SCHEDULED YET
            </h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              {isAdmin
                ? 'As an Administrator, click "+ SCHEDULE WORKSHOP / SESSION" above to publish daily 5:30 - 7:30 PM lab sessions, talk sessions, or hackathons.'
                : 'Upcoming daily sessions and workshops will appear here once published by club leads.'}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                playCyberClick();
                setSessionToEdit(null);
                setAddModalOpen(true);
              }}
              className="px-5 py-2.5 bg-white text-black font-bold uppercase text-xs hover:bg-zinc-200 inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>+ CREATE FIRST LIVE SESSION</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => {
            const userHasTicket = Boolean(
              currentUser?.email &&
                tickets?.some((t) => {
                  const matchEmail = (t.attendeeEmail || t.userEmail || '').toLowerCase().trim() === currentUser.email.toLowerCase().trim();
                  const matchEvent = t.eventId === session.id || t.eventTitle === session.title;
                  return matchEmail && matchEvent;
                })
            );

            return (
              <SessionCard
                key={session.id}
                session={session}
                onRSVP={onRSVP}
                onDelete={onDeleteSession}
                onEdit={(s) => {
                  setSessionToEdit(s);
                  setAddModalOpen(true);
                }}
                userHasTicket={userHasTicket}
                isAdmin={isAdmin}
              />
            );
          })}
        </div>
      )}

      {/* Schedule Live Session Modal / Edit Modal */}
      <AddSessionModal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setSessionToEdit(null);
        }}
        onAddSession={(newSession) => {
          if (onAddSession) onAddSession(newSession);
        }}
        onUpdateSession={(updatedSession) => {
          if (onUpdateSession) onUpdateSession(updatedSession);
        }}
        sessionToEdit={sessionToEdit}
      />
    </div>
  );
};
export default ScheduleTimetable;