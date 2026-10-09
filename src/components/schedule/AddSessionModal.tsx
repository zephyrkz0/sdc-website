import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ScheduleSession, SessionType, EventDifficultyTrack } from '../../types';
import { X, Calendar, Clock, MapPin, User, Sparkles, BookOpen } from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';
import { eventService } from '../../services/eventService';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSession?: (newSession: ScheduleSession) => void;
  onUpdateSession?: (updatedSession: ScheduleSession) => void;
  sessionToEdit?: ScheduleSession | null;
}

export const AddSessionModal: React.FC<AddSessionModalProps> = ({
  isOpen,
  onClose,
  onAddSession,
  onUpdateSession,
  sessionToEdit,
}) => {
  const isEditing = Boolean(sessionToEdit);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [sessionType, setSessionType] = useState<SessionType>('WORKSHOP');
  const [track, setTrack] = useState('');
  const [day, setDay] = useState('');
  const [date, setDate] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [location, setLocation] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [virtualStreamUrl, setVirtualStreamUrl] = useState('');
  const [maxCapacity, setMaxCapacity] = useState<number | string>(50);
  const [instructorName, setInstructorName] = useState('');
  const [instructorUsername, setInstructorUsername] = useState('');
  const [instructorAvatar, setInstructorAvatar] = useState('');
  const [curriculum, setCurriculum] = useState('');
  const [description, setDescription] = useState('');
  const [prerequisites, setPrerequisites] = useState('');
  const [hardwareReqs, setHardwareReqs] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (sessionToEdit) {
      setTitle(sessionToEdit.title || '');
      setCode(sessionToEdit.code || '');
      setSessionType((sessionToEdit.sessionType as SessionType) || 'WORKSHOP');
      setTrack(sessionToEdit.track || '');
      setDay(sessionToEdit.day || '');
      setDate(sessionToEdit.date || '');
      setTimeStart(sessionToEdit.timeStart || '');
      setTimeEnd(sessionToEdit.timeEnd || '');
      setLocation(sessionToEdit.location || (sessionToEdit as any).venue || '');
      setRoomNumber(sessionToEdit.roomNumber || '');
      setVirtualStreamUrl(sessionToEdit.virtualStreamUrl || '');
      setMaxCapacity(sessionToEdit.maxCapacity ?? 50);
      setInstructorName(sessionToEdit.instructor?.name || (sessionToEdit as any).instructorName || '');
      setInstructorUsername(sessionToEdit.instructor?.username || '');
      setInstructorAvatar(sessionToEdit.instructor?.avatar || '');
      setCurriculum(Array.isArray(sessionToEdit.curriculum) ? sessionToEdit.curriculum.join(', ') : '');
      setDescription(sessionToEdit.description || '');
      setPrerequisites(Array.isArray(sessionToEdit.prerequisites) ? sessionToEdit.prerequisites.join(', ') : '');
      setHardwareReqs((sessionToEdit as any).hardwareRequirements || '');
      setErrorMsg('');
    } else {
      setTitle('');
      setCode('');
      setSessionType('WORKSHOP');
      setTrack('');
      setDay('');
      setDate('');
      setTimeStart('');
      setTimeEnd('');
      setLocation('');
      setRoomNumber('');
      setVirtualStreamUrl('');
      setMaxCapacity(50);
      setInstructorName('');
      setInstructorUsername('');
      setInstructorAvatar('');
      setCurriculum('');
      setDescription('');
      setPrerequisites('');
      setHardwareReqs('');
      setErrorMsg('');
    }
  }, [isOpen, sessionToEdit]);

  useEffect(() => {
    if (isOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playCyberClick();
    setErrorMsg('');

    if (!title.trim() || !code.trim() || !instructorName.trim()) {
      setErrorMsg('Session Title, Session Code, and Speaker / Instructor Name are required.');
      return;
    }

    setIsSubmitting(true);

    if (isEditing && sessionToEdit) {
      const updatedData: Partial<ScheduleSession> = {
        title: title.trim(),
        code: code.trim().toUpperCase(),
        sessionType,
        track,
        day: day.trim().toUpperCase(),
        date,
        timeStart,
        timeEnd,
        location: location.trim(),
        roomNumber: roomNumber.trim(),
        virtualStreamUrl: virtualStreamUrl.trim() || undefined,
        maxCapacity: Number(maxCapacity) || 50,
        curriculum: curriculum.split(',').map((c) => c.trim()).filter(Boolean),
        description: description.trim() || 'Hands-on practical workshop hosted by Skill Development Club.',
        prerequisites: prerequisites.split(',').map((p) => p.trim()).filter(Boolean),
        hardwareRequirements: hardwareReqs.trim(),
        instructor: {
          name: instructorName.trim(),
          username: (instructorUsername || instructorName).trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
          avatar: instructorAvatar.trim() || sessionToEdit.instructor?.avatar || '',
          role: 'Session Lead',
          callsign: (instructorUsername || instructorName).trim(),
          opId: sessionToEdit.instructor?.opId || `SDC-INST-${Date.now().toString().slice(-4)}`,
        },
      };

      const saved = await eventService.updateEvent(sessionToEdit.id, updatedData);
      setIsSubmitting(false);

      if (saved) {
        if (onUpdateSession) onUpdateSession(saved);
        playSuccessChime();
        onClose();
      } else {
        setErrorMsg('Failed to update session. Please check your connection and try again.');
      }
    } else {
      const newSessionData: Omit<ScheduleSession, 'id'> = {
        title: title.trim(),
        code: code.trim().toUpperCase(),
        sessionType,
        track,
        day: day.trim().toUpperCase(),
        date,
        timeStart,
        timeEnd,
        location: location.trim(),
        roomNumber: roomNumber.trim(),
        virtualStreamUrl: virtualStreamUrl.trim() || undefined,
        maxCapacity: Number(maxCapacity) || 50,
        rsvpCount: 0,
        curriculum: curriculum.split(',').map((c) => c.trim()).filter(Boolean),
        description: description.trim() || 'Hands-on practical workshop hosted by Skill Development Club.',
        prerequisites: prerequisites.split(',').map((p) => p.trim()).filter(Boolean),
        hardwareRequirements: hardwareReqs.trim(),
        instructor: {
          name: instructorName.trim(),
          username: (instructorUsername || instructorName).trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
          avatar: instructorAvatar.trim() || '',
          role: 'Session Lead',
          callsign: (instructorUsername || instructorName).trim(),
          opId: `SDC-INST-${Date.now().toString().slice(-4)}`,
        },
      };

      const saved = await eventService.createEvent(newSessionData);
      setIsSubmitting(false);

      if (saved) {
        if (onAddSession) onAddSession(saved);
        playSuccessChime();
        onClose();
      } else {
        setErrorMsg('Failed to save session. Please check your connection and try again.');
      }
    }
  };

  const modalContent = (
    <div
      data-lenis-prevent="true"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflow: 'hidden',
      }}
    >
      {/* Solid Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#000000',
          opacity: 0.92,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          zIndex: 1,
        }}
      />

      {/* Solid Modal Window with Isolated Scrolling */}
      <div
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 10,
          backgroundColor: '#0a0a0f',
          background: '#0a0a0f',
          color: '#ffffff',
          width: '100%',
          maxWidth: '44rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          border: '2px solid #a855f7',
          boxShadow: '0 0 80px rgba(0, 0, 0, 1), 0 0 40px rgba(168, 85, 247, 0.25)',
          padding: '1.5rem',
          fontFamily: 'var(--font-mono), monospace',
          userSelect: 'none',
          opacity: 1,
          isolation: 'isolate',
        }}
        className="sm:p-8 tech-corner-box modal-scroll-box"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-purple-950/60 border border-purple-500/60 text-purple-400">
              <Calendar size={16} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
                {isEditing ? `EDIT SESSION • ${code || title}` : 'SCHEDULE NEW WORKSHOP / SESSION'}
              </h3>
              <p className="text-[10px] text-zinc-400">
                {isEditing ? 'Modify session parameters, adjust seat capacity, update speakers or timetable coordinates.' : 'Publish an upcoming hands-on workshop, coding session, or guest talk.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playCyberClick();
              onClose();
            }}
            className="p-1.5 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-500 bg-[#14141d] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs font-mono">
          {/* Title & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">SESSION / WORKSHOP TITLE *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#121218] border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">SESSION CODE *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-[#121218] border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-400 uppercase"
              />
            </div>
          </div>

          {/* Type & Difficulty Track */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">SESSION FORMAT</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as SessionType)}
                className="w-full bg-[#121218] border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-400"
              >
                <option value="WORKSHOP">Hands-on Technical Workshop</option>
                <option value="LEARNING_SESSION">Practical Lab Session</option>
                <option value="HACKATHON">Hackathon / Coding Marathon</option>
                <option value="CODE">Live Project Building</option>
                <option value="DESIGN">UI/UX & Product Design</option>
                <option value="AI">AI & Machine Learning</option>
                <option value="CYBER">Cyber Security & Systems</option>
                <option value="EVENT">Tech Talk / Guest Lecture</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">TRACK / DOMAIN</label>
              <input
                type="text"
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                className="w-full bg-[#121218] border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">DAY OF WEEK</label>
              <input
                type="text"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full bg-[#121218] border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-400 uppercase"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">EVENT DATE</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#121218] border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">START TIME</label>
              <input
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                className="w-full bg-[#121218] border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">END TIME</label>
              <input
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                className="w-full bg-[#121218] border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Location & Room */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">CAMPUS VENUE / LOCATION</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#121218] border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">ROOM / LAB NUMBER</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full bg-[#121218] border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Virtual Stream URL */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 uppercase font-bold">ONLINE MEETING LINK (OPTIONAL)</label>
            <input
              type="url"
              value={virtualStreamUrl}
              onChange={(e) => setVirtualStreamUrl(e.target.value)}
              className="w-full bg-[#121218] border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Instructor / Speaker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">SPEAKER / INSTRUCTOR NAME *</label>
              <input
                type="text"
                required
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                className="w-full bg-[#121218] border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">SPEAKER USERNAME / HANDLE</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-zinc-500 text-xs">@</span>
                <input
                  type="text"
                  value={instructorUsername}
                  onChange={(e) => setInstructorUsername(e.target.value)}
                  className="w-full bg-[#121218] border border-zinc-800 pl-7 pr-3 py-2 text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          </div>

          {/* Capacity & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-zinc-400 uppercase font-bold">SEAT CAPACITY *</label>
                <span className="text-[9px] text-purple-400 font-mono">Max RSVPs</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  required
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(e.target.value)}
                  className="w-full bg-[#121218] border border-zinc-800 px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-400"
                  placeholder="50"
                />
                <div className="flex items-center gap-1 shrink-0">
                  {[25, 50, 100, 200].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMaxCapacity(num)}
                      className={`px-2 py-1 text-[9px] border font-mono transition-colors ${
                        Number(maxCapacity) === num
                          ? 'bg-purple-900/60 border-purple-500 text-purple-200 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                      title={`Set capacity to ${num} attendees`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">SESSION OVERVIEW / DESCRIPTION</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#121218] border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Curriculum & Prerequisites */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">KEY TOPICS COVERED (COMMA SEPARATED)</label>
              <input
                type="text"
                value={curriculum}
                onChange={(e) => setCurriculum(e.target.value)}
                className="w-full bg-[#121218] border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">PREREQUISITES</label>
              <input
                type="text"
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                className="w-full bg-[#121218] border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-950/80 border border-red-800 text-[11px] text-red-200">
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => {
                playCyberClick();
                onClose();
              }}
              className="px-4 py-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-white text-black font-bold text-xs uppercase tracking-wider border border-white hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              <Sparkles size={14} />
              <span>{isSubmitting ? (isEditing ? 'SAVING CHANGES...' : 'CREATING SESSION...') : (isEditing ? 'SAVE CHANGES' : 'SCHEDULE WORKSHOP')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default AddSessionModal;

