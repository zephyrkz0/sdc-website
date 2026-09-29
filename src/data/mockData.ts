import { ClubMember, ScheduleSession, ClubEvent, GlobalClubStats, TerminalLog, PhysicalTicketPass, GalleryItem } from '../types';

export const GLOBAL_STATS: GlobalClubStats = {
  totalSessionsLogged: 0,
  totalHoursExecuted: 0,
  totalUpskilledMembers: 0,
  activeOperatives: 0,
  productionDeployments: 0,
  globalRank: 'CUCEK',
  domainDistribution: [],
};

export const CURRENT_USER_PROFILE: ClubMember = {
  id: 'usr-guest',
  username: 'member',
  callsign: 'member',
  firstName: 'Club',
  lastName: 'Member',
  fullName: 'Club Member',
  email: '',
  roleTitle: 'Club Member',
  role: 'Member',
  tier: 'MEMBER',
  track: 'Web Development',
  branch: 'CUCEK',
  semester: 'S1',
  opId: 'SDC-MEM-01',
  avatarUrl: '',
  bio: 'Member of CUCEK Skill Development Club.',
  hoursContributed: 0,
  completedModules: 0,
  projectsCount: 0,
  skills: [],
  location: 'CUCEK Campus',
  joinedDate: '',
  status: 'ACTIVE',
  github: '',
  githubUrl: '',
  linkedin: '',
  linkedinUrl: '',
  badges: [],
  projects: [],
};

export const CLUB_MEMBERS: ClubMember[] = [];

export const SCHEDULE_SESSIONS: ScheduleSession[] = [];

export const CLUB_EVENTS: ClubEvent[] = [];

export const INITIAL_TICKETS: PhysicalTicketPass[] = [];

export const TERMINAL_LOGS: TerminalLog[] = [];

export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [];
