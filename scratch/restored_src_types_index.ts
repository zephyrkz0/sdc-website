export type EventDifficultyTrack = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type DomainTrack = 'CORE_CODE' | 'GENERATIVE_AI' | 'CYBER_SECURITY' | 'CREATIVE_3D' | 'PRODUCT_DESIGN' | 'SYSTEMS' | string;

export type SessionType = 
  | 'LEARNING_SESSION' 
  | 'WORKSHOP' 
  | 'HACKATHON' 
  | 'CODE' 
  | 'DESIGN' 
  | 'AI' 
  | 'CYBER' 
  | 'EVENT';

export type UserRole = 'MASTER_ADMIN' | 'ADMIN' | 'MEMBER';

export interface ProjectPortfolioItem {
  id: string;
  title: string;
  category?: string;
  description: string;
  tags: string[];
  repoUrl?: string;
  demoUrl?: string;
  previewImage?: string;
  year: string;
  stars?: number;
}

export interface UserAccount {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  track: string;
  avatarUrl: string;
  bio: string;
  skills: string[];
  projects: ProjectPortfolioItem[];
  hoursContributed: number;
  githubUrl?: string;
  linkedinUrl?: string;
  status: 'ACTIVE' | 'DEPLOYED' | 'STANDBY';
  createdAt: string;
  isVerified?: boolean;
  passwordHash?: string;
  fullName?: string;
  callsign?: string;
  opId?: string;
  roleTitle?: string;
  tier?: string;
  location?: string;
  completedModules?: number;
  projectsCount?: number;
  badges?: any[];
  joinedDate?: string;
  hasCompletedOnboarding?: boolean;
  branch?: string;
  semester?: string;
}

export interface ClubMember {
  id: string;
  userId?: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;