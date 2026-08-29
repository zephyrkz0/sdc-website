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
  id: 'usr-me',
  username: 'kashinath',
  callsign: 'kashinath',
  firstName: 'Kasinath',
  lastName: 'R',
  fullName: 'Kasinath R',
  email: 'kashinath.r2017@gmail.com',
  roleTitle: 'Club Lead',
  role: 'Super Admin',
  tier: 'SUPER_ADMIN',
  track: 'AI & Machine Learning',
  branch: 'Computer Science & Engineering',
  semester: 'S1',
  opId: 'SDC-LEAD-01',
  avatarUrl: '',
  bio: 'Lead and core member of CUCEK Skill Development Club.',
  hoursContributed: 0,
  completedModules: 0,
  projectsCount: 0,
  skills: ['TypeScript', 'React', 'Python', 'Machine Learning', 'Ollama', 'Competitive Programming'],
  location: 'CUCEK Campus',
  joinedDate: 'AUG 2024',
  status: 'ACTIVE',
  github: 'https://github.com',
  githubUrl: 'https://github.com',
  linkedin: 'https://linkedin.com',
  linkedinUrl: 'https://linkedin.com',
  badges: [],
  projects: [],
};

export const CLUB_MEMBERS: ClubMember[] = [];

export const SCHEDULE_SESSIONS: ScheduleSession[] = [];

export const CLUB_EVENTS: ClubEvent[] = [];

export const INITIAL_TICKETS: PhysicalTicketPass[] = [];

export const TERMINAL_LOGS: TerminalLog[] = [];

export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [];
