import React from 'react';
import { ScheduleSession } from '../../types';
import { ChromeBadge } from '../common/ChromeBadge';
import { Calendar, Clock, MapPin, Video, User, CheckCircle2, Laptop, ArrowRight, Sparkles, Download } from 'lucide-react';
import { playCyberClick, playHoverBeep } from '../common/AudioEffects';

interface SessionCardProps {
  session: ScheduleSession;
  onRSVP?: (session: ScheduleSession) => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, onRSVP }) => {
  const getSessionTypeBadge = (type: string) => {
    switch (type) {
      case 'CODE':
        return <ChromeBadge label="CODING" variant="dark" />;
      case 'DESIGN':
        return <ChromeBadge label="DESIGN" variant="silver" />;
      case 'AI':
        return <ChromeBadge label="AI & ML" variant="holo" />;
      case 'CYBER':
        return <ChromeBadge label="SECURITY" variant="alert" />;
      case 'HACKATHON':
        return <ChromeBadge label="HACKATHON" variant="silver" />;
      case 'DAILY_SESSION':
        return <ChromeBadge label="DAILY SESSION" variant="dark" />;
      case 'WORKSHOP':
        return <ChromeBadge label="WORKSHOP" variant="silver" />;
      case 'TALK':
        return <ChromeBadge label="TALK" variant="dark" />;
      default:
        return <ChromeBadge label={type.replace(/_/g, ' ')} variant="dark" />;
    }
  };

  const handleCalendarExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    playCyberClick();
    
    // Generate clean .ics calendar file
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SDC//Skill Development Club//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${session.title}`,
      `DESCRIPTION:${session.description || ''}\\n\\nInstructor: ${session.instructor?.name || 'SDC Lead'}`,
      `LOCATION:${session.location}`,
      `DTSTART:${(session.date || '20260901').replace(/-/g, '')}T${(session.timeStart || '18:00').replace(':', '')}00`,
      `DTEND:${(session.date || '20260901').replace(/-/g, '')}T${(session.timeEnd || '20:00').replace(':', '')}00`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${session.code || 'event'}_event.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const rsvpCount = session.rsvpCount || 0;
  const maxCapacity = session.maxCapacity || 50;
  const capacityPercentage = Math.round((rsvpCount / maxCapacity) * 100);

  return (
    <div
      onMouseEnter={() => playHoverBeep()}
      className="bg-zinc-950 border border-zinc-800 hover:border-zinc-500 p-6 transition-all duration-300 relative overflow-hidden tech-corner-box group shadow-md"
    >
      {/* Top Session Metadata Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800 font-mono text-[10px] text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white tracking-widest">{session.code}</span>
          <span>•</span>
          <span>{session.day || 'EVENT'}</span>
          <span>•</span>
          <span className="text-zinc-300">{session.date}</span>
        </div>

        <div className="flex items-center gap-2">
          {getSessionTypeBadge(session.sessionType || 'CODE')}
        </div>
      </div>

      {/* Main Topic Title & Description */}
      <div className="mt-4 space-y-2">
        <h3 className="font-syne font-black text-xl sm:text-2xl text-white group-hover:text-zinc-100 transition-colors">
          {session.title}
        </h3>
        <p className="font-mono text-xs text-zinc-400 leading-relaxed">
          {session.description}
        </p>
      </div>

      {/* Time, Location & Livestream coordinates */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-zinc-900/50 border border-zinc-800/80 font-mono text-xs">
        <div className="flex items-center gap-2 text-zinc-300">
          <Clock size={14} className="text-purple-400 shrink-0" />
          <span>{session.timeStart || '18:00'} - {session.timeEnd || '20:00'} EST</span>
        </div>

        <div className="flex items-center gap-2 text-zinc-300">
          <MapPin size={14} className="text-emerald-400 shrink-0" />
          <span className="truncate">{session.location}</span>
        </div>

        {session.virtualStreamUrl && (
          <div className="sm:col-span-2 flex items-center gap-2 text-[11px] text-zinc-400 border-t border-zinc-800/60 pt-2">
            <Video size={13} className="text-blue-400 shrink-0" />
            <span className="truncate">LIVESTREAM: {session.virtualStreamUrl}</span>
          </div>
        )}
      </div>

      {/* Curriculum Breakdown */}
      {session.curriculum && session.curriculum.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
            CURRICULUM TOPICS
          </div>
          <ul className="space-y-1 font-mono text-xs text-zinc-300">
            {session.curriculum.map((curr, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-zinc-600 text-[10px] mt-0.5">0{idx + 1}.</span>
                <span>{curr}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prerequisites & Hardware specs */}
      <div className="mt-4 p-3 bg-zinc-950 border border-dashed border-zinc-800 font-mono text-[10px] space-y-1.5 text-zinc-400">
        {session.hardwareRequirements && (
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Laptop size={11} className="text-amber-400" />
            <span className="font-bold">HARDWARE:</span> {session.hardwareRequirements}
          </div>
        )}
        {session.prerequisites && session.prerequisites.length > 0 && (
          <div className="text-zinc-500">
            <span className="text-zinc-400">PREREQUISITES:</span> {session.prerequisites.join(', ')}
          </div>
        )}
      </div>

      {/* Bottom Bar: Instructor snapshot, Capacity meter & RSVP Action */}
      <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Instructor */}
        {session.instructor && (
          <div className="flex items-center gap-2.5">
            <img
              src={session.instructor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={session.instructor.name}
              className="w-8 h-8 rounded-none border border-zinc-700 object-cover grayscale"
            />
            <div className="font-mono">
              <div className="text-xs font-bold text-zinc-200">{session.instructor.name}</div>
              <div className="text-[9px] text-zinc-500">{session.instructor.role}</div>
            </div>
          </div>
        )}

        {/* Capacity & Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Capacity pill */}
          <div className="font-mono text-right hidden sm:block">
            <div className="text-[8px] text-zinc-500">CAPACITY</div>
            <div className="text-[10px] font-bold text-zinc-300">
              {rsvpCount} / {maxCapacity} ({capacityPercentage}%)
            </div>
          </div>

          {/* Add to Calendar */}
          <button
            onClick={handleCalendarExport}
            className="p-2.5 border border-zinc-800 bg-zinc-900 hover:border-zinc-600 text-zinc-400 hover:text-white transition-colors"
            title="Download .ICS Calendar Event"
          >
            <Download size={14} />
          </button>

          {/* RSVP Trigger */}
          <button
            onClick={() => {
              playCyberClick();
              if (onRSVP) onRSVP(session);
            }}
            className="px-4 py-2.5 bg-zinc-100 hover:bg-white text-black font-mono font-bold text-xs uppercase tracking-wider border border-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center gap-1.5"
          >
            <Sparkles size={12} />
            <span>RSVP • GET PASS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
