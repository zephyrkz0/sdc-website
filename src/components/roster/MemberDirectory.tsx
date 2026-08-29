import React, { useState, useMemo } from 'react';
import { ClubMember, UserRole } from '../../types';
import { LeadershipCard } from './LeadershipCard';
import { OperativeRow } from './OperativeRow';
import { MemberModal } from './MemberModal';
import { AddMemberModal } from './AddMemberModal';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Users, Shield, Key, LayoutGrid, List, Check, Crown } from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';
import { memberService } from '../../services/memberService';
import { getRoleTier, getRoleStyles } from '../../utils/roleUtils';

interface MemberDirectoryProps {
  members: ClubMember[];
  onAddMember: (newMember: ClubMember) => void;
  onUpdateMember?: (updatedMember: Partial<ClubMember> & { id?: string; email?: string; username?: string }) => void;
}

export const MemberDirectory: React.FC<MemberDirectoryProps> = ({
  members,
  onAddMember,
  onUpdateMember,
}) => {
  const { isAdmin, isMasterAdmin, allUsers, updateUserRoleAndPosition } = useAuth();

  const [selectedMember, setSelectedMember] = useState<ClubMember | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'HOURS' | 'PROJECTS' | 'NAME'>('HOURS');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewAccountsTable, setViewAccountsTable] = useState(false);
  const [roleStatusMsg, setRoleStatusMsg] = useState('');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [draftPositions, setDraftPositions] = useState<{ [userId: string]: string }>({});
  const [draftRoles, setDraftRoles] = useState<{ [userId: string]: UserRole }>({});

  const tracks = [
    { id: 'ALL', label: 'All Tracks' },
    { id: 'Web Development', label: 'Web Development' },
    { id: 'DSA', label: 'DSA' },
    { id: 'AI', label: 'AI & ML' },
  ];

  const filteredOperatives = useMemo(() => {
    return members
      .filter((member) => {
        const name = member.fullName || `${member.firstName || ''} ${member.lastName || ''}`;
        const handle = member.username || member.callsign || '';
        const matchesTrack =
          selectedTrack === 'ALL' ||
          (member.track && member.track.toLowerCase().includes(selectedTrack.toLowerCase()));
        const matchesSearch =
          searchQuery === '' ||
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (member.skills || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (member.role || '').toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTrack && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'HOURS') return (b.hoursContributed || 0) - (a.hoursContributed || 0);
        if (sortBy === 'PROJECTS') return (b.projects?.length || 0) - (a.projects?.length || 0);
        const nameA = a.fullName || a.username || '';
        const nameB = b.fullName || b.username || '';
        return nameA.localeCompare(nameB);
      });
  }, [members, selectedTrack, searchQuery, sortBy]);

  const filteredAdminUsers = useMemo(() => {
    if (!adminSearchQuery.trim()) return allUsers;
    return allUsers.filter((u) => {
      const q = adminSearchQuery.toLowerCase();
      return (
        u.fullName?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
      );
    });
  }, [allUsers, adminSearchQuery]);

  const handleSaveUserAssignment = async (userId: string, userEmail: string = '', username: string = '') => {
    playCyberClick();

    const targetUser = allUsers.find((u) => u.id === userId);
    const existingMember = members.find(
      (m) =>
        (userEmail && m.email?.toLowerCase() === userEmail.toLowerCase()) ||
        (username && m.username?.toLowerCase() === username.toLowerCase())
    );

    const targetRole: UserRole = draftRoles[userId] || targetUser?.role || 'MEMBER';
    const targetPosition =
      draftPositions[userId] !== undefined
        ? draftPositions[userId].trim()
        : existingMember?.role ||
          (targetRole === 'MASTER_ADMIN' ? 'Super Admin' : targetRole === 'ADMIN' ? 'Admin' : 'Core Member');

    const result = updateUserRoleAndPosition(userId, targetRole, targetPosition);
    setRoleStatusMsg(result.message);

    if (result.success) {
      playSuccessChime();

      if (onUpdateMember) {
        onUpdateMember({
          id: existingMember?.id || userId,
          email: userEmail,
          username,
          role: targetPosition,
          roleTitle: targetPosition,
        });
      }

      try {
        await memberService.createOrUpdateMember({
          userId,
          username,
          email: userEmail,
          role: targetPosition,
        });
      } catch (err) {
        console.warn('Sync to Supabase note:', err);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-mono">
      {/* Header Matching Frame 10 */}
      <div className="space-y-2 border-b border-zinc-800 pb-4">
        <h2 className="text-3xl sm:text-4xl font-syne font-black tracking-tight text-white uppercase">
          MEMBER DIRECTORY
        </h2>
        <p className="text-xs text-zinc-400">
          Verified member profiles, technical specializations, and club leadership.
        </p>
      </div>

      {/* SUPER ADMIN / ADMIN PURPLE BANNER (Frame 10) */}
      {isAdmin && (
        <div className="p-4 sm:p-5 bg-[#0e0a16] border border-purple-600/70 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-purple-400" />
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                SUPER ADMIN
              </span>
              <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[9px] font-bold uppercase tracking-wider">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs text-zinc-300">
              Super Admin: Manage member roles, assign custom titles, and add club members.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                playCyberClick();
                setAddModalOpen(true);
              }}
              className="px-4 py-2 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>+ ADD MEMBER</span>
            </button>

            <button
              onClick={() => {
                playCyberClick();
                setViewAccountsTable(!viewAccountsTable);
              }}
              className="px-4 py-2 bg-purple-950/80 text-purple-200 border border-purple-600 hover:bg-purple-900 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              <Key size={13} />
              <span>{viewAccountsTable ? 'HIDE ROLE MANAGER' : 'ASSIGN ROLES & POSITIONS'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Role Management Dropdown Table */}
      {isAdmin && viewAccountsTable && (
        <div className="p-6 bg-[#0a0a0f] border border-purple-500/40 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={adminSearchQuery}
                onChange={(e) => setAdminSearchQuery(e.target.value)}
                placeholder="Filter registered users by name or email..."
                className="w-full pl-9 pr-4 py-2 bg-[#121218] border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
            {roleStatusMsg && (
              <span className="text-xs font-mono text-amber-300 animate-pulse">{roleStatusMsg}</span>
            )}
          </div>

          <div className="border border-zinc-800 divide-y divide-zinc-800">
            {filteredAdminUsers.map((u) => {
              const memberCard = members.find(
                (m) =>
                  (u.email && m.email?.toLowerCase() === u.email?.toLowerCase()) ||
                  (u.username && m.username?.toLowerCase() === u.username?.toLowerCase())
              );
              const currentPosition =
                draftPositions[u.id] !== undefined
                  ? draftPositions[u.id]
                  : memberCard?.role || (u.role === 'MASTER_ADMIN' ? 'Super Admin' : u.role === 'ADMIN' ? 'Admin' : 'Core Member');
              const currentRole: UserRole = draftRoles[u.id] || u.role || 'MEMBER';
              const rowTier = getRoleTier(u);
              const rowStyles = getRoleStyles(rowTier);

              return (
                <div
                  key={u.id}
                  className="p-3 bg-[#121218] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">{u.fullName || u.username}</span>
                    <span className={`text-[10px] ${rowStyles.textColor}`}>@{u.username}</span>
                    <span className={rowStyles.badgeClass}>{rowStyles.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={currentPosition}
                      onChange={(e) =>
                        setDraftPositions((prev) => ({ ...prev, [u.id]: e.target.value }))
                      }
                      className="px-2 py-1 bg-black border border-zinc-700 text-white text-xs w-40"
                    />
                    <select
                      value={currentRole}
                      onChange={(e) =>
                        setDraftRoles((prev) => ({ ...prev, [u.id]: e.target.value as UserRole }))
                      }
                      className="px-2 py-1 bg-black border border-zinc-700 text-white text-xs"
                    >
                      <option value="MEMBER">MEMBER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MASTER_ADMIN">SUPER ADMIN</option>
                    </select>
                    <button
                      onClick={() => handleSaveUserAssignment(u.id, u.email, u.username)}
                      className="px-3 py-1 bg-white text-black font-bold text-[10px] uppercase"
                    >
                      SAVE
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FILTER TOOLBAR (Frame 10) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d0d12] border border-zinc-800 p-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, skill, or role..."
            className="w-full pl-9 pr-4 py-2 bg-[#121218] border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
          />
        </div>

        {/* Track Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {tracks.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                playCyberClick();
                setSelectedTrack(t.id);
              }}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                selectedTrack === t.id
                  ? 'bg-white text-black'
                  : 'bg-[#121218] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Sort & View Mode */}
        <div className="flex items-center gap-3 font-mono text-xs shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-[10px]">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'HOURS' | 'PROJECTS' | 'NAME')}
              className="bg-[#121218] border border-zinc-800 px-2 py-1.5 font-mono text-xs text-zinc-300 focus:outline-none"
            >
              <option value="HOURS">HOURS</option>
              <option value="PROJECTS">PROJECTS</option>
              <option value="NAME">NAME</option>
            </select>
          </div>

          <div className="flex items-center border border-zinc-800 bg-[#121218] p-0.5">
            <button
              onClick={() => {
                playCyberClick();
                setViewMode('grid');
              }}
              className={`p-1.5 flex items-center gap-1 text-[10px] font-bold uppercase ${
                viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LayoutGrid size={13} />
              <span>CARDS</span>
            </button>
            <button
              onClick={() => {
                playCyberClick();
                setViewMode('list');
              }}
              className={`p-1.5 flex items-center gap-1 text-[10px] font-bold uppercase ${
                viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <List size={13} />
              <span>LIST</span>
            </button>
          </div>
        </div>
      </div>

      {/* MEMBER DIRECTORY GRID (Frame 10) */}
      {filteredOperatives.length === 0 ? (
        <div className="p-12 text-center border border-zinc-800 bg-[#0c0c14] space-y-3">
          <Users size={32} className="mx-auto text-zinc-600" />
          <h3 className="font-syne font-bold text-white text-base uppercase">NO MEMBERS FOUND</h3>
          <p className="text-xs text-zinc-400 font-mono">No registered members match your current search or filter criteria.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOperatives.map((member) => (
            <LeadershipCard
              key={member.id}
              member={member}
              onSelect={(m) => setSelectedMember(m)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOperatives.map((member) => (
            <OperativeRow
              key={member.id}
              member={member}
              onSelect={(m) => setSelectedMember(m)}
            />
          ))}
        </div>
      )}

      {/* Member Details Modal */}
      {selectedMember && (
        <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddMember={onAddMember}
      />
    </div>
  );
};
export default MemberDirectory;
