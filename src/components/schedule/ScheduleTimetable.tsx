import React, { useState } from 'react';
import { ScheduleSession } from '../../types';
import { SessionCard } from './SessionCard';
import { Search, Plus, Calendar, Shield, Clock } from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';
import { useAuth } from '../../context/AuthContext';

interface ScheduleTimetableProps {
  sessions?: ScheduleSession[];
  onRSVP?: (session: ScheduleSession) => void;
  onAddSession?: (session: ScheduleSession) => void;
  onDeleteSession?: (sessionId: string) => void;
}

export const ScheduleTimetable: React.FC<ScheduleTimetableProps> = ({
  sessions = [],
  onRSVP,
  onAddSession,
  onDeleteSession,
}) => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'ARCHIVE'>('UPCOMING');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New session form states
  const [newTitle, setNewTitle] = useState('');
  const [newTrack, setNewTrack] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTimeStart, setNewTimeStart] = useState('');
  const [newTimeEnd, setNewTimeEnd] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newInstructor, setNewInstructor] = useState('');
  const [newDescription, setNewDescription] = useState('');

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

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;

    const newSession: ScheduleSession = {
      id: `ses-${Date.now()}`,
      title: newTitle,
      track: newTrack || 'General',
      date: newDate,
      timeStart: newTimeStart,
      timeEnd: newTimeEnd,
      venue: newVenue,
      instructorName: newInstructor || 'SDC Lead',
      description: newDescription,
      status: 'UPCOMING',
      sessionType: 'DAILY_SESSION',
    };

    if (onAddSession) {
      onAddSession(newSession);
    }
    playSuccessChime();
    setAddModalOpen(false);
    setNewTitle('');
    setNewTrack('');
    setNewDate('');
    setNewTimeStart('');
    setNewTimeEnd('');
    setNewVenue('');
    setNewInstructor('');
    setNewDescription('');
  };

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
          {filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session} onRSVP={onRSVP} onDelete={onDeleteSession} isAdmin={isAdmin} />
          ))}
        </div>
      )}

      {/* Schedule Live Session Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#0d0d14] border border-zinc-700 p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="font-bold text-white uppercase">SCHEDULE WORKSHOP / SESSION</span>
              <button onClick={() => setAddModalOpen(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1 text-[10px]">SESSION TITLE</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 text-[10px]">DATE</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 text-[10px]">TRACK</label>
                  <input
                    type="text"
                    value={newTrack}
                    onChange={(e) => setNewTrack(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 text-[10px]">START TIME</label>
                  <input
                    type="time"
                    value={newTimeStart}
                    onChange={(e) => setNewTimeStart(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 text-[10px]">END TIME</label>
                  <input
                    type="time"
                    value={newTimeEnd}
                    onChange={(e) => setNewTimeEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 text-[10px]">VENUE</label>
                <input
                  type="text"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 text-[10px]">INSTRUCTOR / LEAD</label>
                <input
                  type="text"
                  value={newInstructor}
                  onChange={(e) => setNewInstructor(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 text-[10px]">DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 border border-zinc-800"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black font-bold uppercase hover:bg-zinc-200"
                >
                  PUBLISH SESSION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ScheduleTimetable;