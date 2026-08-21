import React, { useState, useEffect } from 'react';
import { NavTab, Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CustomCursor } from './components/common/CustomCursor';
import { GlobalDashboard } from './components/dashboard/GlobalDashboard';
import { MemberDirectory } from './components/roster/MemberDirectory';
import { ScheduleTimetable } from './components/schedule/ScheduleTimetable';
import { UserProfile } from './components/profile/UserProfile';
import { TicketManagementView } from './components/ticketing/TicketManagementView';
import { EventRSVPModal } from './components/ticketing/EventRSVPModal';
import { TicketScannerModal } from './components/ticketing/TicketScannerModal';
import {
  GLOBAL_STATS,
  CLUB_MEMBERS,
  SCHEDULE_SESSIONS,
  CLUB_EVENTS,
  CURRENT_USER_PROFILE,
  INITIAL_TICKETS,
  TERMINAL_LOGS,
} from './data/mockData';
import { ClubMember, ClubEvent, ScheduleSession, PhysicalTicketPass, TerminalLog } from './types';
import Lenis from 'lenis';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [members, setMembers] = useState<ClubMember[]>(CLUB_MEMBERS);
  const [sessions, setSessions] = useState<ScheduleSession[]>(SCHEDULE_SESSIONS);
  const [events, setEvents] = useState<ClubEvent[]>(CLUB_EVENTS);
  const [userProfile, setUserProfile] = useState<ClubMember>(CURRENT_USER_PROFILE);
  const [tickets, setTickets] = useState<PhysicalTicketPass[]>(INITIAL_TICKETS);
  const [logs, setLogs] = useState<TerminalLog[]>(TERMINAL_LOGS);

  // Modals state
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [selectedEventForRSVP, setSelectedEventForRSVP] = useState<ClubEvent | ScheduleSession | null>(null);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const handleOpenRSVP = (target?: ClubEvent | ScheduleSession) => {
    setSelectedEventForRSVP(target || events[0]);
    setRsvpModalOpen(true);
  };

  const handleSaveTicket = (newTicket: PhysicalTicketPass) => {
    setTickets((prev) => [newTicket, ...prev]);
    // Append to live logs
    const newLog: TerminalLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      category: 'EVENT',
      message: `Pass [${newTicket.ticketId}] issued to @${newTicket.attendeeCallsign} for [${newTicket.eventTitle}].`,
      author: 'RSVP_BOT',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleCheckInTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.ticketId === ticketId ? { ...t, status: 'CHECKED_IN' } : t))
    );
    const newLog: TerminalLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      category: 'SYS',
      message: `Access granted for pass [${ticketId}] at Sector 01 Scanner Terminal.`,
      author: 'SECURITY_GATE',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleUpdateProfile = (updated: ClubMember) => {
    setUserProfile(updated);
    setMembers((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 relative selection:bg-white selection:text-black">
      {/* Custom Crosshair Cursor with trailing dynamics */}
      <CustomCursor />

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanner={() => setScannerModalOpen(true)}
        onOpenRSVP={() => handleOpenRSVP()}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeTab === 'dashboard' && (
          <GlobalDashboard
            stats={GLOBAL_STATS}
            logs={logs}
            featuredEvent={events[0]}
            setActiveTab={setActiveTab}
            onOpenRSVP={handleOpenRSVP}
            onOpenScanner={() => setScannerModalOpen(true)}
          />
        )}

        {activeTab === 'roster' && (
          <MemberDirectory members={members} />
        )}

        {activeTab === 'schedule' && (
          <ScheduleTimetable
            sessions={sessions}
            onRSVP={handleOpenRSVP}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfile
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {activeTab === 'tickets' && (
          <TicketManagementView
            tickets={tickets}
            events={events}
            onOpenRSVP={handleOpenRSVP}
            onOpenScanner={() => setScannerModalOpen(true)}
          />
        )}
      </main>

      {/* Global Modals */}
      <EventRSVPModal
        isOpen={rsvpModalOpen}
        onClose={() => setRsvpModalOpen(false)}
        targetEvent={selectedEventForRSVP}
        eventsList={events}
        currentUser={userProfile}
        onSaveTicket={handleSaveTicket}
      />

      <TicketScannerModal
        isOpen={scannerModalOpen}
        onClose={() => setScannerModalOpen(false)}
        tickets={tickets}
        onCheckIn={handleCheckInTicket}
      />

      {/* Technical Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
};
export default App;
