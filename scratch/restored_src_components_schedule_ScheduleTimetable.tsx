import React, { useState, useMemo } from 'react';
import { ScheduleSession, SessionType, ClubEvent, PastEventRecord } from '../../types';
import { SessionCard } from './SessionCard';
import { AddSessionModal } from './AddSessionModal';
import { BlueprintHeader } from '../common/BlueprintHeader';
import { PAST_EVENTS_ARCHIVE } from '../../data/mockData';
import {
  Search,
  Calendar,
  Filter,
  Sparkles,
  Clock,
  MapPin,
  Plus,
  Shield,
  History,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { playCyberClick } from '../common/AudioEffects';
import { useAuth } from '../../context/AuthContext';

interface ScheduleTimetableProps {
  sessions: ScheduleSession[];
  pastEvents?: PastEventRecord[];
  onAddSession?: (session: ScheduleSession) => void;
  onDeleteSession?: (sessionId: string) => void;
  onRSVP: (session: ScheduleSession | ClubEvent) => void;
}

export const ScheduleTimetable: React.FC<ScheduleTimetableProps> = ({
  sessions,
  pastEvents = PAST_EVENTS_ARCHIVE,
  onAddSession,
  onDeleteSession,
  onRSVP,
}) => {
  const { isAdmin } = useAuth();

  const [activeView, setActiveView] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
  const [selectedType, setSelectedType] = useState<SessionType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const sessionTypes: { id: SessionType | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All Sessions' },
    { id: 'LEARNING_SESSION', label: 'Daily Lab Sessions' },
    { id: 'WORKSHOP', label: 'Workshops' },
    { id: 'EVENT', label: 'Talk Sessions' },
    { id: 'HACKATHON', label: 'Hackathons' },
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

  const filteredPastEvents = useMemo(() => {
    return pastEvents.filter((evt) => {
      return (
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.highlightSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [pastEvents, searchQuery]);

  return (
    <div className="space-y-12">
      {/* SECTION HEADER */}
      <BlueprintHeader
        title="SCHEDULE & TIMETABLE"
        subtitle="Explore upcoming learning sessions, hands-on workshops, and past event archives."
      />

      {/* ADMIN CONTROLS BAR */}
      {isAdmin && (
        <div className="p-4 bg-purple-950/40 border-2 border-purple-500/60 tech-corner-box flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 font-mono text-xs text-purple-200">
            <Shield size={18} className="text-purple-400" />
            <div>
              <span className="font-bold text-white uppercase">ADMINISTRATOR EVENT CONTROLS</span>
              <p className="text-[10px] text-zinc-400">
                You can create and publish live sessions, workshops, and hackathons directly to the schedule.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playCyberClick();
              setAddModalOpen(true);
            }}
            className="px-4 py-2 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider border border-white hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.25)]"
          >
            <Plus size={14} />
            <span>SCHEDULE WORKSHOP / SESSION</span>
          </button>
        </div>
      )}

      {/* VIEW SWITCHER TABS: UPCOMING SESSIONS VS PAST EVENTS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800 font-mono text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playCyberClick();
              setActiveView('UPCOMING');
            }}