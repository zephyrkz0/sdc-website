import { ClubMember, UserAccount } from '../types';

export type RoleTier = 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';

export interface RoleVisualStyles {
  tier: RoleTier;
  label: string;
  cardBgClass: string;
  cardBorderClass: string;
  cardGlowClass: string;
  badgeClass: string;
  avatarBorderClass: string;
  roleTagClass: string;
  textColor: string;
  statusDotClass: string;
}

export const getRoleTier = (userOrMember?: Partial<ClubMember | UserAccount> | null): RoleTier => {
  if (!userOrMember) return 'MEMBER';

  const role = (userOrMember.role || userOrMember.roleTitle || '').toLowerCase();
  const email = (userOrMember.email || '').toLowerCase();
  const username = (userOrMember.username || userOrMember.callsign || '').toLowerCase();
  const tier = (userOrMember.tier || '').toLowerCase();

  // Super Admin check
  if (
    role.includes('super admin') ||
    role.includes('master admin') ||
    role === 'super_admin' ||
    role === 'master_admin' ||
    tier === 'master_admin' ||
    tier === 'super_admin'
  ) {
    return 'SUPER_ADMIN';
  }

  // Admin check
  if (
    role.includes('admin') ||
    role === 'admin' ||
    tier === 'admin' ||
    tier === 'command_leadership' ||
    tier === 'core_excom'
  ) {
    return 'ADMIN';
  }

  return 'MEMBER';
};

export const getRoleStyles = (tier: RoleTier): RoleVisualStyles => {
  switch (tier) {
    case 'SUPER_ADMIN':
      return {
        tier: 'SUPER_ADMIN',
        label: 'SUPER ADMIN',
        cardBgClass: 'bg-[#120e06]/90',
        cardBorderClass: 'border-2 border-amber-400 hover:border-amber-300',
        cardGlowClass: 'shadow-[0_0_30px_rgba(251,191,36,0.35)]',
        badgeClass: 'px-2 py-0.5 bg-amber-400 text-black font-bold uppercase tracking-wider text-[9px] shadow-[0_0_12px_rgba(251,191,36,0.5)]',
        avatarBorderClass: 'border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]',
        roleTagClass: 'bg-amber-400/20 text-amber-300 border border-amber-400/60 font-bold',
        textColor: 'text-amber-300',
        statusDotClass: 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]',
      };
    case 'ADMIN':
      return {
        tier: 'ADMIN',
        label: 'ADMIN',
        cardBgClass: 'bg-[#0f0c05]/80',
        cardBorderClass: 'border-2 border-amber-500/80 hover:border-amber-400',
        cardGlowClass: 'shadow-[0_0_18px_rgba(245,158,11,0.2)]',
        badgeClass: 'px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold uppercase tracking-wider text-[9px]',
        avatarBorderClass: 'border border-amber-500/80',
        roleTagClass: 'bg-amber-500/10 text-amber-300 border border-amber-500/40 font-bold',
        textColor: 'text-amber-400',
        statusDotClass: 'bg-amber-400 animate-pulse',
      };
    case 'MEMBER':
    default:
      return {
        tier: 'MEMBER',
        label: 'MEMBER',
        cardBgClass: 'bg-zinc-950',
        cardBorderClass: 'border border-zinc-800 hover:border-zinc-600',
        cardGlowClass: 'shadow-md',
        badgeClass: 'px-2 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-800 uppercase tracking-wider text-[9px]',
        avatarBorderClass: 'border border-zinc-700',
        roleTagClass: 'bg-zinc-900 text-zinc-400 border border-zinc-800',
        textColor: 'text-zinc-300',
        statusDotClass: 'bg-emerald-400',
      };
  }
};
