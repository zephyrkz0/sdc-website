























  TERMINAL_LOGS,
} from './data/mockData';
import { ClubMember, ClubEvent, ScheduleSession, PhysicalTicketPass, TerminalLog } from './types';
import { memberService } from './services/memberService';
import { eventService } from './services/eventService';
import { ticketService } from './services/ticketService';
import Lenis from 'lenis';

const AURORA_COLOR_STOPS = ['#7cff67', '#B497CF', '#5227FF'];

const AppContent: React.FC = () => {
  const { currentUser, allUsers, setAuthModalOpen } = useAuth();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [members, setMembers] = useState<ClubMember[]>(CLUB_MEMBERS);
  const [sessions, setSessions] = useState<ScheduleSession[]>(SCHEDULE_SESSIONS);
  const [events, setEvents] = useState<ClubEvent[]>(CLUB_EVENTS);
  const [tickets, setTickets] = useState<PhysicalTicketPass[]>(INITIAL_TICKETS);
  const [logs, setLogs] = useState<TerminalLog[]>(TERMINAL_LOGS);

  // Combine Supabase fetched members with local registered users / currentUser
  const combinedMembers = React.useMemo(() => {
    const memberMap = new Map<string, ClubMember>();

    // 1. Add base/fetched members
    members.forEach((m) => {
      const key = (m.email || m.username || m.id).toLowerCase();
      memberMap.set(key, m);
    });

    // 2. Add/merge all registered users (including Super Admin)
    allUsers.forEach((u) => {
      const key = (u.email || u.username || u.id).toLowerCase();
      const existing = memberMap.get(key);
      const memberCard: ClubMember = {
        id: u.id,
        userId: u.id,
        username: u.username || u.callsign || (u.email ? u.email.split('@')[0] : 'member'),
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        fullName: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Member',
        email: u.email,
        role: u.role === 'MASTER_ADMIN' ? 'Super Admin' : u.role === 'ADMIN' ? 'Admin' : (u.role || 'Member'),
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
        createdAt: u.createdAt || new Date().toISOString(),
        callsign: u.username || u.callsign || 'member',
      };
      memberMap.set(key, memberCard);
    });

    // 3. Ensure currentUser is present and up to date
    if (currentUser) {
      const key = (currentUser.email || currentUser.username || currentUser.id).toLowerCase();
      const existing = memberMap.get(key);
      const isSuperAdmin = (currentUser.email || '').toLowerCase().includes('kashinath') || (currentUser.username || '').toLowerCase().includes('kashinath') || currentUser.role === 'MASTER_ADMIN';
      const currentMemberCard: ClubMember = {




        lastName: currentUser.lastName || '',
        fullName: currentUser.fullName || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Member',
        email: currentUser.email,
        role: isSuperAdmin ? 'Super Admin' : currentUser.role === 'ADMIN' ? 'Admin' : (currentUser.role || 'Member'),
        track: currentUser.track || 'Web Development',
        branch: currentUser.branch || existing?.branch || '',
        semester: currentUser.semester || existing?.semester || '',
        avatarUrl: currentUser.avatarUrl || existing?.avatarUrl || '',
        bio: currentUser.bio || existing?.bio || '',
        skills: currentUser.skills && currentUser.skills.length > 0 ? currentUser.skills : existing?.skills || [],
        projects: currentUser.projects || existing?.projects || [],
        hoursContributed: currentUser.hoursContributed || existing?.hoursContributed || 0,
        githubUrl: currentUser.githubUrl || existing?.githubUrl || '',
        linkedinUrl: currentUser.linkedinUrl || existing?.linkedinUrl || '',
        status: currentUser.status || 'ACTIVE',
        createdAt: currentUser.createdAt || new Date().toISOString(),
        callsign: currentUser.username || currentUser.callsign || 'member',
      };
      memberMap.set(key, currentMemberCard);
    }

    // Filter out any ghost/mock user (SDC Root / admin@sdc.internal)
    return Array.from(memberMap.values()).filter((m) => {
      const email = (m.email || '').toLowerCase();
      const username = (m.username || '').toLowerCase();
      const id = m.id || '';
      return id !== 'usr-master-admin-01' && email !== 'admin@sdc.internal' && username !== 'admin';
    });
  }, [members, allUsers, currentUser]);

  // Modals state
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [selectedEventForRSVP, setSelectedEventForRSVP] = useState<ClubEvent | ScheduleSession | null>(null);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const lenisRef = React.useRef<Lenis | null>(null);

  // Load from Supabase on mount
  useEffect(() => {
    memberService.fetchMembers().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setMembers(fetched);
      }
    });

    eventService.fetchEvents().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setSessions(fetched);
      }
    });
  }, []);

  // Load user tickets when current user logs in
  useEffect(() => {
    if (currentUser?.email) {
      ticketService.fetchUserTickets(currentUser.email).then((fetched) => {
        if (fetched && fetched.length > 0) {
          setTickets(fetched);
        }
      });
    }
  }, [currentUser]);

  // Initialize Lenis Smooth Scroll with calm, gentle speed and modal isolation
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.7,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05, // Fast, responsive normal navigation
      touchMultiplier: 1.2,
      prevent: (node) => {
        return (
          node.nodeType === 1 &&
          Boolean(
            (node as HTMLElement).closest('[data-lenis-prevent]') ||
            (node as HTMLElement).closest('.overflow-y-auto') ||
            (node as HTMLElement).closest('.overflow-auto') ||
            (node as HTMLElement).closest('.modal-scroll-box')
          )
        );
      },
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Reset scroll when switching tabs so views are never scrolled out of view
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  const handleOpenRSVP = (target?: ClubEvent | ScheduleSession) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setSelectedEventForRSVP(target || events[0]);
    setRsvpModalOpen(true);
  };

  const handleSaveTicket = async (newTicket: PhysicalTicketPass) => {
    setTickets((prev) => [newTicket, ...prev]);

    // Persist to Supabase
    await ticketService.mintTicket(newTicket);

    // Append to live logs
    const newLog: TerminalLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      category: 'EVENT',
      message: `Pass [${newTicket.ticketId}] issued to @${newTicket.username || newTicket.attendeeCallsign} for [${newTicket.eventTitle}].`,
      author: 'RSVP_BOT',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleCheckInTicket = async (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.ticketId === ticketId ? { ...t, isAdmitted: true } : t))
    );

    // Persist to Supabase
    await ticketService.verifyAndAdmitTicket(ticketId);

    const newLog: TerminalLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      category: 'SYS',
      message: `Access granted for pass [${ticketId}] at Sector 01 Scanner Terminal.`,
      author: 'SECURITY_GATE',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleAddMember = (newMember: ClubMember) => {
    setMembers((prev) => [newMember, ...prev]);
    const newLog: TerminalLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      category: 'SYS',

























































































    <>
      {/* Aurora Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#08080a]" style={{ zIndex: 0 }}>
        <Aurora
          colorStops={AURORA_COLOR_STOPS}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      <div className="min-h-screen bg-transparent text-zinc-100 relative selection:bg-white selection:text-black overflow-x-clip" style={{ zIndex: 1 }}>
        {/* Global Preloading Screen */}
        <GlobalLoadingScreen minDurationMs={1200} />

        {/* TargetCursor component */}
        <TargetCursor
          spinDuration={2}
          hideDefaultCursor={true}
          parallaxOn={true}
          hideDefaultCursor={true}
          parallaxOn={true}
          cursorColor="#ffffff"
          cursorColorOnTarget="#c084fc"
          targetSelector=".cursor-target, button, a, input, select, textarea, [data-interactive='true'], .interactive-card, .tab-btn"
        />

        {/* Navigation Header - Sticky Top */}
        <Navbar
          activeTab={activeTab}
          targetSelector=".cursor-target, button, a, input, select, textarea, [data-interactive='true'], .interactive-card, .tab-btn"
        />

        {/* Navigation Header - Sticky Top */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenScanner={() => setScannerModalOpen(true)}
          onOpenRSVP={() => handleOpenRSVP()}
        />

        {/* Main Content Area */}
        {activeTab === 'dashboard' ? (
          <div className="relative z-10">
            <GlobalDashboard
              stats={GLOBAL_STATS}
              sessions={sessions}
              featuredEvent={events[0] || sessions[0] || null}
              setActiveTab={setActiveTab}
              onOpenRSVP={handleOpenRSVP}
              onOpenScanner={() => setScannerModalOpen(true)}
            />
          </div>
        ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 relative z-10 min-h-[85vh]">
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
                onAddSession={handleAddSession}
                onDeleteSession={handleDeleteSession}
                onRSVP={handleOpenRSVP}
              />
            )}

            {activeTab === 'profile' && (
              <UserProfile />
            )}

            {activeTab === 'tickets' && (
              <TicketManagementView
                tickets={tickets}
                events={events}
                onOpenRSVP={handleOpenRSVP}
                onOpenScanner={() => setScannerModalOpen(true)}
              />
            )}

            {activeTab === 'gallery' && (
        <EventRSVPModal
          isOpen={rsvpModalOpen}
          onClose={() => setRsvpModalOpen(false)}
          targetEvent={selectedEventForRSVP}
          eventsList={events}
          currentUser={activeUserForRSVP}
          onSaveTicket={handleSaveTicket}
        />

        <TicketScannerModal
          isOpen={scannerModalOpen}
          onClose={() => setScannerModalOpen(false)}
          tickets={tickets}
          onCheckIn={handleCheckInTicket}
        />

        <AuthModal />
        <OnboardingModal />
        <EmailVerificationModal />
