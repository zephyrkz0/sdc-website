import React, { useState, useEffect, useMemo } from 'react';
import { NavTab, Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { TargetCursor } from './components/common/TargetCursor';
import { GlobalDashboard } from './components/dashboard/GlobalDashboard';
import { MemberDirectory } from './components/roster/MemberDirectory';
import { ScheduleTimetable } from './components/schedule/ScheduleTimetable';
import { UserProfile } from './components/profile/UserProfile';
import { TicketManagementView } from './components/ticketing/TicketManagementView';
import { GalleryView } from './components/gallery/GalleryView';
import { EventRSVPModal } from './components/ticketing/EventRSVPModal';
import { TicketScannerModal } from './components/ticketing/TicketScannerModal';
import { GlobalLoadingScreen } from './components/common/GlobalLoadingScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { memberService } from './services/memberService';
import { eventService } from './services/eventService';
import { ticketService } from './services/ticketService';
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

const AppContent: React.FC = () => {
  const { currentUser, allUsers, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [sessions, setSessions] = useState<ScheduleSession[]>(SCHEDULE_SESSIONS);
  const [events, setEvents] = useState<ClubEvent[]>(CLUB_EVENTS);
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

  // Fetch live members & sessions from Supabase if configured
  useEffect(() => {
    const loadData = async () => {
      const liveMembers = await memberService.fetchMembers();
      if (liveMembers && liveMembers.length > 0) {
        setMembers(liveMembers);
      }

      const liveSessions = await eventService.fetchEvents();
      if (liveSessions && liveSessions.length > 0) {
        setSessions(liveSessions);
      }

      if (currentUser?.email) {
        const liveTickets = await ticketService.fetchUserTickets(currentUser.email);
        if (liveTickets && liveTickets.length > 0) {
          setTickets(liveTickets);
        }
      }
    };

    loadData();
  }, [currentUser]);

  // Combine database members with local registered users
  const combinedMembers = useMemo(() => {
    const memberMap = new Map<string, ClubMember>();

    members.forEach((m) => {
      const key = (m.email || m.username || m.id).toLowerCase();
      memberMap.set(key, m);
    });

    allUsers.forEach((u) => {
      const key = (u.email || u.username || u.id).toLowerCase();
      const existing = memberMap.get(key);
      const isSuperAdmin =
        (u.email || '').toLowerCase().includes('kashinath') ||
        (u.username || '').toLowerCase().includes('kashinath') ||
        u.role === 'MASTER_ADMIN';

      const memberCard: ClubMember = {
        id: u.id,
        userId: u.id,
        username: u.username || u.callsign || 'member',
        callsign: u.username || u.callsign || 'member',
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        fullName: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Member',
        email: u.email,
        role: isSuperAdmin ? 'Super Admin' : u.role === 'ADMIN' ? 'Admin' : u.role || 'Member',
        track: u.track || 'Web Development',
        branch: u.branch || existing?.branch || '',
        semester: u.semester || existing?.semester || '',
        avatarUrl: u.avatarUrl || existing?.avatarUrl || '',
        bio: u.bio || existing?.bio || '',
        skills: u.skills && u.skills.length > 0 ? u.skills : existing?.skills || [],
        projects: u.projects || existing?.projects || [],
        hoursContributed: u.hoursContributed || existing?.hoursContributed || 0,
        githubUrl: u.githubUrl || existing?.githubUrl || '',
        linkedinUrl: u.linkedinUrl || existing?.linkedinUrl || '',
        status: u.status || 'ACTIVE',
      };
      memberMap.set(key, memberCard);
    });

    return Array.from(memberMap.values());
  }, [members, allUsers]);

  const handleOpenRSVP = (target?: ClubEvent | ScheduleSession) => {
    setSelectedEventForRSVP(target || events[0] || sessions[0]);
    setRsvpModalOpen(true);
  };

  const handleOpenScanner = () => {
    if (!isAdmin) return;
    setScannerModalOpen(true);
  };

  const handleSaveTicket = (newTicket: PhysicalTicketPass) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  const handleCheckInTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.ticketId === ticketId ? { ...t, status: 'CHECKED_IN', isAdmitted: true } : t))
    );
  };

  const handleAddMember = (newMember: ClubMember) => {
    setMembers((prev) => [newMember, ...prev]);
  };

  const handleUpdateMember = (updated: Partial<ClubMember> & { id?: string; email?: string; username?: string }) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (
          (updated.id && m.id === updated.id) ||
          (updated.email && m.email === updated.email) ||
          (updated.username && m.username === updated.username)
        ) {
          return { ...m, ...updated };
        }
        return m;
      })
    );
  };

  const handleAddSession = (newSession: ScheduleSession) => {
    setSessions((prev) => [newSession, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 relative selection:bg-white selection:text-black overflow-x-hidden">
      {/* Global Preloading Screen (Frame 1) */}
      <GlobalLoadingScreen minDurationMs={1400} />

      {/* TargetCursor follower */}
      <TargetCursor
        spinDuration={2}
        hideDefaultCursor={true}
        parallaxOn={true}
        cursorColor="#ffffff"
        cursorColorOnTarget="#c084fc"
        targetSelector=".cursor-target, button, a, input, select, textarea, [data-interactive='true'], .interactive-card, .tab-btn"
      />

      {/* Navigation Header (Frames 5, 9, 10, 11, 12, 13) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanner={isAdmin ? handleOpenScanner : undefined}
        onOpenRSVP={() => handleOpenRSVP()}
      />

      {/* Main Content Pages */}
      {activeTab === 'dashboard' ? (
        <GlobalDashboard
          stats={GLOBAL_STATS}
          logs={logs}
          featuredEvent={events[0]}
          setActiveTab={setActiveTab}
          onOpenRSVP={handleOpenRSVP}
          onOpenScanner={handleOpenScanner}
        />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
          {activeTab === 'roster' && (
            <MemberDirectory
              members={combinedMembers}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleTimetable
              sessions={sessions}
              onRSVP={handleOpenRSVP}
              onAddSession={handleAddSession}
            />
          )}

          {activeTab === 'gallery' && (
            <GalleryView />
          )}

          {activeTab === 'profile' && (
            <UserProfile />
          )}

          {activeTab === 'tickets' && (
            <TicketManagementView
              tickets={tickets}
              events={events}
              onOpenRSVP={handleOpenRSVP}
              onOpenScanner={handleOpenScanner}
            />
          )}
        </main>
      )}

      {/* Global Modals */}
      <EventRSVPModal
        isOpen={rsvpModalOpen}
        onClose={() => setRsvpModalOpen(false)}
        targetEvent={selectedEventForRSVP}
        eventsList={events}
        currentUser={currentUser || CURRENT_USER_PROFILE}
        onSaveTicket={handleSaveTicket}
      />

      {isAdmin && (
        <TicketScannerModal
          isOpen={scannerModalOpen}
          onClose={() => setScannerModalOpen(false)}
          tickets={tickets}
          onCheckIn={handleCheckInTicket}
        />
      )}

      {/* Technical Footer (Frame 8) */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
