export type DomainTrack = 'CORE_CODE' | 'GENERATIVE_AI' | 'CYBER_SECURITY' | 'CREATIVE_3D' | 'PRODUCT_DESIGN' | 'SYSTEMS';

export type SessionType = 'CODE' | 'DESIGN' | 'AI' | 'CYBER' | 'HACKATHON' | 'EVENT' | 'WORKSHOP';

export interface ProjectPortfolioItem {
  id: string;
  title: string;
  category: DomainTrack;
  description: string;
  tags: string[];
  repoUrl?: string;
  demoUrl?: string;
  previewImage?: string;
  year: string;
  stars?: number;
}

export interface MemberBadge {
  id: string;
  name: string;
  code: string;
  icon: string;
  rarity: 'COMMON' | 'ELITE' | 'MYTHIC' | 'CLASSIFIED';
  earnedDate: string;
  description: string;
}

export interface ClubMember {
  id: string;
  callsign: string;
  fullName: string;
  roleTitle: string;
  tier: 'COMMAND_LEADERSHIP' | 'CORE_EXCOM' | 'ACTIVE_OPERATIVE';
  track: DomainTrack;
  opId: string; // e.g. SDC-CMD-001
  avatarUrl: string;
  bio: string;
  hoursContributed: number;
  completedModules: number;
  projectsCount: number;
  skills: string[];
  badges: MemberBadge[];
  projects: ProjectPortfolioItem[];
  github?: string;
  twitter?: string;
  linkedin?: string;
  location: string;
  joinedDate: string;
  status: 'ACTIVE' | 'DEPLOYED' | 'STANDBY';
}

export interface ScheduleSession {
  id: string;
  title: string;
  code: string; // e.g. SDC-SESS-204
  curriculum: string[];
  day: string; // e.g. "FRIDAY"
  date: string; // e.g. "2026-08-28"
  timeStart: string; // "18:00"
  timeEnd: string; // "20:30"
  sessionType: SessionType;
  track: DomainTrack;
  location: string;
  roomNumber: string;
  virtualStreamUrl?: string;
  instructor: {
    name: string;
    callsign: string;
    opId: string;
    avatar: string;
    role: string;
  };
  prerequisites: string[];
  rsvpCount: number;
  maxCapacity: number;
  description: string;
  hardwareRequirements: string;
}

export interface ClubEvent {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  date: string;
  time: string;
  location: string;
  venueCoords: string;
  type: SessionType;
  track: DomainTrack;
  capacity: number;
  rsvpCount: number;
  description: string;
  tags: string[];
  highlights: string[];
  featured: boolean;
}

export interface PhysicalTicketPass {
  ticketId: string; // e.g. SDC-PASS-8842-X9
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  attendeeName: string;
  attendeeCallsign: string;
  attendeeEmail: string;
  attendeeRole: string;
  attendeeTrack: DomainTrack;
  seatTier: 'GENERAL_OPERATIVE' | 'VIP_SPEAKER' | 'PRESS_EDITORIAL' | 'HACKER_ACCESS';
  qrPayload: string;
  barcodeNumber: string;
  issuedAt: string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'VOID';
  accessSecurityCode: string;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  category: 'SYS' | 'SKILL' | 'EVENT' | 'DEPLOY' | 'ALERT';
  message: string;
  author: string;
}

export interface GlobalClubStats {
  totalSessionsLogged: number;
  totalHoursExecuted: number;
  totalUpskilledMembers: number;
  activeOperatives: number;
  productionDeployments: number;
  globalRank: string;
  domainDistribution: {
    domain: DomainTrack;
    label: string;
    percentage: number;
    hours: number;
  }[];
}
