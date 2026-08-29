export type DomainTrack = 'CORE_CODE' | 'GENERATIVE_AI' | 'CYBER_SECURITY' | 'CREATIVE_3D' | 'PRODUCT_DESIGN' | 'SYSTEMS' | string;

export type SessionType = 'CODE' | 'DESIGN' | 'AI' | 'CYBER' | 'HACKATHON' | 'EVENT' | 'WORKSHOP' | string;

export type UserRole = 'MASTER_ADMIN' | 'ADMIN' | 'MEMBER';

export interface ProjectPortfolioItem {
  id: string;
  title: string;
  category?: DomainTrack;
  description: string;
  tags: string[];
  repoUrl?: string;
  demoUrl?: string;
  previewImage?: string;
  year?: string;
  stars?: number;
}

export interface MemberBadge {
  id: string;
  name: string;
  code?: string;
  icon?: string;
  rarity?: 'COMMON' | 'ELITE' | 'MYTHIC' | 'CLASSIFIED';
  earnedDate?: string;
  description?: string;
}

export interface ClubMember {
  id: string;
  userId?: string;
  callsign?: string;
  username?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  roleTitle?: string;
  tier?: 'MASTER_ADMIN' | 'SUPER_ADMIN' | 'COMMAND_LEADERSHIP' | 'CORE_EXCOM' | 'ADMIN' | 'ACTIVE_OPERATIVE' | 'MEMBER';
  track: DomainTrack;
  opId?: string;
  avatarUrl?: string;
  bio?: string;
  branch?: string;
  semester?: string;
  hoursContributed?: number;
  completedModules?: number;
  projectsCount?: number;
  skills: string[];
  badges?: MemberBadge[];
  projects?: ProjectPortfolioItem[];
  github?: string;
  githubUrl?: string;
  twitter?: string;
  linkedin?: string;
  linkedinUrl?: string;
  location?: string;
  joinedDate?: string;
  status?: 'ACTIVE' | 'DEPLOYED' | 'STANDBY' | string;
}

export interface UserAccount extends ClubMember {
  username: string;
  email: string;
  passwordHash?: string;
  isVerified?: boolean;
  role: UserRole;
  createdAt?: string;
  hasCompletedOnboarding?: boolean;
}

export interface ScheduleSession {
  id: string;
  title: string;
  code?: string;
  curriculum?: string[];
  day?: string;
  date: string;
  time?: string;
  timeStart?: string;
  timeEnd?: string;
  sessionType?: SessionType | string;
  track?: DomainTrack | string;
  location?: string;
  venue?: string;
  roomNumber?: string;
  virtualStreamUrl?: string;
  instructor?: any;
  instructorName?: string;
  instructorCallsign?: string;
  instructorAvatar?: string;
  prerequisites?: string[];
  rsvpCount?: number;
  capacity?: number;
  maxCapacity?: number;
  tags?: string[];
  status?: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description?: string;
  resources?: { label: string; url: string }[];
  hardwareRequirements?: string;
  bannerUrl?: string;
  featured?: boolean;
  level?: string;
  speaker?: string;
}

export type EventDifficultyTrack = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';

export interface PastEventRecord {
  id: string;
  title: string;
  date: string;
  attendeesCount?: number;
  summary?: string;
  photosCount?: number;
  instructorName?: string;
  highlightSummary?: string;
  bannerUrl?: string;
  resourcesLink?: string;
  code?: string;
  type?: string;
  track?: string;
  location?: string;
}

export interface ClubEvent {
  id: string;
  title: string;
  subtitle?: string;
  code?: string;
  date: string;
  time: string;
  location: string;
  venueCoords?: string;
  type: SessionType;
  track: DomainTrack;
  capacity: number;
  rsvpCount: number;
  description: string;
  tags?: string[];
  highlights?: string[];
  featured?: boolean;
}

export interface PhysicalTicketPass {
  ticketId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  attendeeName: string;
  attendeeCallsign: string;
  attendeeEmail: string;
  attendeeRole?: string;
  attendeeTrack?: DomainTrack;
  seatTier?: 'GENERAL_OPERATIVE' | 'VIP_SPEAKER' | 'PRESS_EDITORIAL' | 'HACKER_ACCESS' | string;
  qrPayload: string;
  barcodeNumber: string;
  issuedAt?: string;
  createdAt?: string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'VOID' | string;
  accessSecurityCode?: string;
  isAdmitted?: boolean;
  admittedAt?: string;
  venue?: string;
  userName?: string;
  username?: string;
  userEmail?: string;
  userCallsign?: string;
  tier?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'DAILY_SESSIONS' | 'WORKSHOPS' | 'TALKS' | 'HACKATHONS' | 'COMMUNITY' | string;
  imageUrl: string;
  date: string;
  description?: string;
  caption?: string;
  tags?: string[];
  photographer?: string;
  aspectRatio?: string;
  createdAt?: string;
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
