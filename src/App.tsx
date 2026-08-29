import React, { useState, useEffect, useMemo } from 'react';
import { NavTab, Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
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

import { Aurora } from './components/common/Aurora';

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

  // Combine database members with local registered users with multi-field deduplication
  const combinedMembers = useMemo(() => {
    const memberList: ClubMember[] = [];

    const findExisting = (item: { email?: string; username?: string; fullName?: string; id?: string }) => {
      const email = item.email?.toLowerCase().trim();
      const username = item.username?.toLowerCase().trim();
      const name = item.fullName?.toLowerCase().trim();

      return memberList.find((m) => {
        if (email && m.email && m.email.toLowerCase().trim() === email) return true;
        if (username && m.username && m.username.toLowerCase().trim() === username) return true;
        if (name && m.fullName && m.fullName.toLowerCase().trim() === name) return true;
        if (item.id && m.id === item.id) return true;
        return false;
      });
    };

    // First add members from database/mock
    members.forEach((m) => {
      if (!findExisting(m)) {
        memberList.push({ ...m });
      }
    });

    // Merge registered user accounts (updating in place if already present)
    allUsers.forEach((u) => {
      const existing = findExisting(u);
      const isSuperAdmin =
        (u.email || '').toLowerCase().includes('kashinath') ||
        (u.username || '').toLowerCase().includes('kashinath') ||
        u.role === 'MASTER_ADMIN';

      const memberCard: ClubMember = {
        id: existing?.id || u.id,
        userId: u.id,
        username: u.username || u.callsign || existing?.username || 'member',
        callsign: u.username || u.callsign || existing?.callsign || 'member',
        firstName: u.firstName || existing?.firstName || '',
        lastName: u.lastName || existing?.lastName || '',
        fullName: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || existing?.fullName || 'Member',
        email: u.email || existing?.email || '',
        role: isSuperAdmin ? 'Super Admin' : u.role === 'ADMIN' ? 'Admin' : u.role || existing?.role || 'Member',
        roleTitle: isSuperAdmin ? 'Super Admin' : u.role === 'ADMIN' ? 'Admin' : u.role || existing?.role || 'Member',
        tier: isSuperAdmin ? 'SUPER_ADMIN' : u.role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
        track: u.track || existing?.track || 'Web Development',
        branch: u.branch || existing?.branch || '',
        semester: u.semester || existing?.semester || '',
        avatarUrl: u.avatarUrl || existing?.avatarUrl || '',
        bio: u.bio || existing?.bio || '',
        skills: u.skills && u.skills.length > 0 ? u.skills : existing?.skills || [],
        projects: u.projects && u.projects.length > 0 ? u.projects : existing?.projects || [],
        hoursContributed: u.hoursContributed || existing?.hoursContributed || 0,
        githubUrl: u.githubUrl || existing?.githubUrl || '',
        linkedinUrl: u.linkedinUrl || existing?.linkedinUrl || '',
        status: u.status || existing?.status || 'ACTIVE',
      };

      if (existing) {
        const index = memberList.indexOf(existing);
        memberList[index] = { ...existing, ...memberCard };
      } else {
        memberList.push(memberCard);
      }
    });

    return memberList;
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
    <div className="min-h-screen bg-[#08080a] text-zinc-100 relative selection:bg-white selection:text-black overflow-x-clip">
      {/* React Bits WebGL Aurora Background — Sole Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <Aurora
          colorStops={['#7cff67', '#B497CF', '#5227FF']}
          blend={0.5}
          amplitude={1.1}
          speed={0.5}
        />
      </div>

      {/* Global Preloading Screen (Frame 1) */}
      <GlobalLoadingScreen minDurationMs={1400} />

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
