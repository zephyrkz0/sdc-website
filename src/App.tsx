import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { EmailVerificationModal } from './components/auth/EmailVerificationModal';
import { GlobalLoadingScreen } from './components/common/GlobalLoadingScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';
import { memberService } from './services/memberService';
import { eventService } from './services/eventService';
import { ticketService } from './services/ticketService';
import {
  GLOBAL_STATS,
  CLUB_MEMBERS,
  SCHEDULE_SESSIONS,
  CLUB_EVENTS,
  INITIAL_TICKETS,
  TERMINAL_LOGS,
} from './data/mockData';
import { ClubMember, ClubEvent, ScheduleSession, PhysicalTicketPass, TerminalLog } from './types';
import Lenis from 'lenis';

import { Aurora } from './components/common/Aurora';

const AppContent: React.FC = () => {
  const { currentUser, allUsers, isAdmin } = useAuth();

  const getInitialTab = (): NavTab => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace(/^#/, '').toLowerCase();
      const validTabs: NavTab[] = ['dashboard', 'roster', 'schedule', 'profile', 'tickets', 'gallery'];
      if (validTabs.includes(hash as NavTab)) {
        return hash as NavTab;
      }
    }
    return 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState<NavTab>(getInitialTab);

  const setActiveTab = useCallback((tab: NavTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      if (window.location.hash !== `#${tab}`) {
        window.history.pushState({ tab }, '', `#${tab}`);
      }
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const tab = getInitialTab();
      setActiveTabState(tab);
    };

    window.addEventListener('popstate', handleHashChange);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handleHashChange);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

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
        const liveTickets = isAdmin
          ? await ticketService.fetchAllTickets()
          : await ticketService.fetchUserTickets(currentUser.email);
        if (liveTickets && liveTickets.length > 0) {
          setTickets(liveTickets);
        }
      }
    };

    loadData();
  }, [currentUser, isAdmin]);

  // Combine database members with current session/local state
  const combinedMembers = useMemo(() => {
    // If connected to Supabase and live members exist, the database is the primary source of truth
    if (isSupabaseConfigured() && members.length > 0) {
      const list = [...members];
      // Ensure active currentUser profile changes are immediately visible
      if (currentUser) {
        const idx = list.findIndex(
          (m) =>
            m.id === currentUser.id ||
            (currentUser.email && m.email?.toLowerCase() === currentUser.email.toLowerCase())
        );
        if (idx >= 0) {
          list[idx] = {
            ...list[idx],
            ...currentUser,
            role: currentUser.roleTitle || list[idx].role,
          };
        }
      }
      return list;
    }

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
        u.role === 'SUPER_ADMIN' ||
        (u.role as any) === 'MASTER_ADMIN';

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
        avatarUrl: (u.avatarUrl && !u.avatarUrl.startsWith('blob:') ? u.avatarUrl : '') || (existing?.avatarUrl && !existing.avatarUrl.startsWith('blob:') ? existing.avatarUrl : '') || '',
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
  }, [members, allUsers, currentUser]);

  const hasEvents = events.length > 0 || sessions.length > 0;

  const handleOpenRSVP = (target?: ClubEvent | ScheduleSession) => {
    if (!hasEvents && !target) return;
    setSelectedEventForRSVP(target || events[0] || sessions[0]);
    setRsvpModalOpen(true);
  };

  const handleOpenScanner = async () => {
    if (!isAdmin) return;
    try {
      const allLive = await ticketService.fetchAllTickets();
      if (allLive && allLive.length > 0) {
        setTickets(allLive);
      }
    } catch {}
    setScannerModalOpen(true);
  };

  const handleSaveTicket = async (newTicket: PhysicalTicketPass) => {
    try {
      const persisted = await ticketService.mintTicket(newTicket);
      if (persisted) {
        setTickets((prev) => [persisted, ...prev]);
        return persisted;
      }
      throw new Error('Database Error: Ticket pass could not be confirmed by server.');
    } catch (err) {
      console.error('Failed to persist ticket to Supabase:', err);
      throw err;
    }
  };

  const handleCheckInTicket = async (ticketIdOrCode: string) => {
    try {
      const res = await ticketService.verifyAndAdmitPass(ticketIdOrCode);
      if (res.success && res.ticket) {
        setTickets((prev) => {
          const exists = prev.some((t) => t.ticketId === res.ticket!.ticketId);
          if (exists) {
            return prev.map((t) => (t.ticketId === res.ticket!.ticketId ? res.ticket! : t));
          }
          return [res.ticket!, ...prev];
        });
      }
      return res;
    } catch (err: any) {
      console.warn('Failed to persist check-in to Supabase:', err);
      return { success: false, message: err?.message || 'Server check-in error.' };
    }
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

  const handleAddSession = async (newSession: ScheduleSession) => {
    setSessions((prev) => [newSession, ...prev]);
    try {
      const created = await eventService.createEvent(newSession);
      if (created) {
        setSessions((prev) => prev.map((s) => (s.id === newSession.id ? created : s)));
      }
    } catch (err) {
      console.warn('Failed to save session to Supabase:', err);
    }
  };

  const handleUpdateSession = (updatedSession: ScheduleSession) => {
    setSessions((prev) => prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)));
  };

  const handleDeleteSession = async (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setTickets((prev) => prev.filter((t) => t.eventId !== sessionId));
    await eventService.deleteEvent(sessionId);
  };

  const handleDeleteTicket = async (ticketId: string, eventId?: string) => {
    setTickets((prev) => prev.filter((t) => t.ticketId !== ticketId));
    await ticketService.deleteTicket(ticketId, eventId);
  };

  const liveStats = useMemo(() => ({
    ...GLOBAL_STATS,
    activeMembers: combinedMembers.length || 0,
    totalSessionsLogged: sessions.length || 0,
    totalHoursExecuted: combinedMembers.reduce((acc, m) => acc + (m.hoursContributed || 0), 0),
    productionDeployments: 0,
  }), [combinedMembers, sessions]);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 relative selection:bg-white selection:text-black overflow-x-clip">
      {/* Background Visual */}
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
        hasEvents={hasEvents}
        gifFilledVh={activeTab === 'dashboard' ? 1.925 : 0}
      />

      {/* Main Content Pages */}
      {activeTab === 'dashboard' ? (
        <GlobalDashboard
          stats={liveStats}
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
              tickets={tickets}
              onRSVP={handleOpenRSVP}
              onAddSession={handleAddSession}
              onUpdateSession={handleUpdateSession}
              onDeleteSession={handleDeleteSession}
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
              hasEvents={hasEvents}
              onDeleteTicket={handleDeleteTicket}
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
        currentUser={currentUser}
        isAdmin={isAdmin}
        existingTickets={tickets}
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

      {/* Authentication & Onboarding Modals */}
      <AuthModal />
      <OnboardingModal />
      <EmailVerificationModal />

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
