import React, { useState, useMemo } from 'react';
import { ClubMember, UserRole } from '../../types';
import { BlueprintHeader } from '../common/BlueprintHeader';
import { LeadershipCard } from './LeadershipCard';
import { OperativeRow } from './OperativeRow';
import { MemberModal } from './MemberModal';
import { AddMemberModal } from './AddMemberModal';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Users, Shield, Key, LayoutGrid, List, Check, Sparkles, Tag, UserCheck, ShieldAlert, Crown } from 'lucide-react';
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

  // Filtering & Sorting Logic for Public Directory
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

  // Filtered Users for Master Admin Console
  const filteredAdminUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const name = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`;
      const handle = u.username || u.callsign || '';
      const email = u.email || '';
      const q = adminSearchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        name.toLowerCase().includes(q) ||
        handle.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q)
      );
    });
  }, [allUsers, adminSearchQuery]);

  // Handle Master Admin saving role and custom position
  const handleSaveUserAssignment = async (userId: string, userEmail: string, username: string) => {
    playCyberClick();

    const targetUser = allUsers.find((u) => u.id === userId);
    const existingMember = members.find((m) => m.email?.toLowerCase() === userEmail.toLowerCase() || m.username?.toLowerCase() === username.toLowerCase());

    const targetRole: UserRole = draftRoles[userId] || targetUser?.role || 'MEMBER';
    const targetPosition = draftPositions[userId] !== undefined 
      ? draftPositions[userId].trim()
      : (existingMember?.role || (targetRole === 'MASTER_ADMIN' ? 'Super Admin' : targetRole === 'ADMIN' ? 'Admin' : 'Core Member'));

    const result = updateUserRoleAndPosition(userId, targetRole, targetPosition);
    setRoleStatusMsg(result.message);

    if (result.success) {
      playSuccessChime();

      // Update in local members list
      if (onUpdateMember) {
        onUpdateMember({
          id: existingMember?.id || userId,
          email: userEmail,
          username,
          role: targetPosition,
          roleTitle: targetPosition,
        });
      }

      // Sync to Supabase
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
    <div className="space-y-12">
      {/* Header */}
      <BlueprintHeader
        title="MEMBER DIRECTORY"
        subtitle="Verified member profiles, technical specializations, and club leadership."
      />

      {/* Admin Privileges Bar */}
      {isAdmin && (
        <div
          style={{ backgroundColor: '#140c24' }}
          className="p-4 bg-[#140c24] border-2 border-purple-500/70 tech-corner-box flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg"
        >
          <div className="flex items-center gap-2.5 font-mono text-xs text-purple-200">
            <Shield size={18} className="text-purple-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white uppercase">
                  {isMasterAdmin ? 'MASTER ADMINISTRATOR' : 'ADMINISTRATOR ACCESS ACTIVE'}
                </span>
                <span className="px-1.5 py-0.2 bg-purple-900 text-purple-200 text-[8px] font-bold border border-purple-600">
                  {isMasterAdmin ? 'MASTER ADMIN' : 'ADMIN'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">
                {isMasterAdmin
                  ? 'Master Admin: Full management access, member search, custom position assignment (Co-Lead, Lead, Community Manager), and system role promotion.'
                  : 'Admin: Manage events, directory members, gallery uploads, and ticket check-ins.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                playCyberClick();
                setAddModalOpen(true);
              }}
              className="flex-1 sm:flex-initial px-4 py-2 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider border border-white hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.25)]"
            >
              <Plus size={14} />
              <span>ADD MEMBER CARD</span>
            </button>

            <button
              onClick={() => {
                playCyberClick();
                setViewAccountsTable(!viewAccountsTable);
              }}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-[#121218] border-2 border-purple-500/80 text-purple-200 hover:text-white hover:border-purple-400 font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            >
              <Key size={14} />
              <span>{viewAccountsTable ? 'HIDE ROLE CONSOLE' : isMasterAdmin ? 'ASSIGN ROLES & POSITIONS' : 'REGISTERED USERS'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Master Admin Role & Position Management Console */}
      {isAdmin && viewAccountsTable && (
        <section
          style={{ backgroundColor: '#09090d' }}
          className="p-5 sm:p-6 bg-[#09090d] border-2 border-purple-500/80 tech-corner-box space-y-5 font-mono text-xs shadow-2xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5 text-white font-bold uppercase">
              <Users size={18} className="text-purple-400" />
              <span className="text-sm">
                {isMasterAdmin ? 'MASTER ADMIN // MEMBER ROLES & POSITION CONSOLE' : 'REGISTERED USERS DIRECTORY'}
              </span>
              <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-600 text-[10px]">
                {allUsers.length} MEMBERS
              </span>
            </div>

            {/* Live Search by Name or Username or Email */}
            <div className="relative w-full md:w-80">
              <Search size={14} className="absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                value={adminSearchQuery}
                onChange={(e) => setAdminSearchQuery(e.target.value)}
                placeholder="Search member by username or name..."
                className="w-full bg-[#14141d] border border-zinc-700 pl-9 pr-7 py-2 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-purple-400"
              />
              {adminSearchQuery && (
                <button
                  className="absolute right-2.5 top-2 text-zinc-400 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {roleStatusMsg && (
            <div className="p-3 bg-purple-950/90 border border-purple-500 text-purple-200 text-xs flex items-center justify-between">
              <span>{roleStatusMsg}</span>
              <button onClick={() => setRoleStatusMsg('')} className="text-purple-400 hover:text-white font-bold ml-2">×</button>
            </div>
          )}

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredAdminUsers.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 bg-[#121218] border border-zinc-800">
                No members found matching "{adminSearchQuery}".
              </div>
            ) : (
              filteredAdminUsers.map((u) => {
                const memberCard = members.find((m) => m.email?.toLowerCase() === u.email?.toLowerCase() || m.username?.toLowerCase() === u.username?.toLowerCase());
                const currentPosition = draftPositions[u.id] !== undefined
                  ? draftPositions[u.id]
                  : (memberCard?.role || (u.role === 'MASTER_ADMIN' ? 'Super Admin' : u.role === 'ADMIN' ? 'Admin' : 'Core Member'));
                const currentRole: UserRole = draftRoles[u.id] || u.role || 'MEMBER';

                return (
                  <div
                    key={u.id}
                    className="p-4 bg-[#121218] border border-zinc-800 hover:border-purple-500/50 transition-colors flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4"
                  >
                    {/* User Identity */}
                    <div className="flex items-center gap-3 min-w-0 sm:min-w-[260px]">
                      <div className="w-11 h-11 bg-[#1a1429] border border-purple-500/60 overflow-hidden shrink-0 flex items-center justify-center">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={u.username}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <span className="font-syne font-black text-sm text-purple-300 uppercase">
                            {u.firstName?.[0] || u.username?.[0] || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs truncate">
                            {u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User'}
                          </span>
                          <span className="text-[10px] text-purple-400 font-mono">@{u.username || u.callsign}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate">{u.email}</div>
                        <div className="text-[9px] text-zinc-500">
                          Current status: <span className="text-zinc-300 font-bold">{memberCard?.role || u.role}</span>
                        </div>
                      </div>
                    </div>

                    {/* Master Admin Controls */}
                    {isMasterAdmin ? (
                      <div className="flex flex-1 flex-wrap items-center gap-3 w-full xl:w-auto">
                        {/* Custom Position / Status Text Input */}
                        <div className="flex-1 min-w-[200px]">
                          <label className="text-[9px] text-zinc-400 uppercase font-bold block mb-1">
                            ASSIGN POSITION / STATUS (TYPE OUT)
                          </label>
                          <input
                            type="text"
                            value={currentPosition}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDraftPositions((prev) => ({ ...prev, [u.id]: val }));
                            }}
                            placeholder="e.g. Co-Lead, Lead, Community Manager, Tech Lead..."
                            className="w-full bg-[#0a0a0f] border border-zinc-700 px-2.5 py-1.5 text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-purple-400"
                          />
                          {/* Quick preset chips */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {['Co-Lead', 'Lead', 'Community Manager', 'Technical Lead', 'Core Member'].map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  setDraftPositions((prev) => ({ ...prev, [u.id]: tag }));
                                }}
                                className="text-[8px] px-1.5 py-0.2 bg-zinc-900 hover:bg-purple-950 hover:text-purple-200 border border-zinc-800 text-zinc-400 transition-colors"
                              >
                                +{tag}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* System Access Role Selector */}
                                  setDraftPositions((prev) => ({ ...prev, [u.id]: tag }));
                                }}
                                className="text-[8px] px-1.5 py-0.2 bg-zinc-900 hover:bg-purple-950 hover:text-purple-200 border border-zinc-800 text-zinc-400 transition-colors"
                              >
                                +{tag}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* System Access Role Selector */}
                        <div className="min-w-[160px]">
                          <label className="text-[9px] text-zinc-400 uppercase font-bold block mb-1">
                            SYSTEM ACCESS LEVEL
                          </label>
                          <select
                            value={currentRole}
                            onChange={(e) => {
                              const val = e.target.value as UserRole;
                              setDraftRoles((prev) => ({ ...prev, [u.id]: val }));
                            }}
                            className="w-full bg-[#0a0a0f] border border-zinc-700 px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-purple-400"
                          >
                            <option value="MEMBER">MEMBER (Standard Access)</option>
                            <option value="ADMIN">ADMIN (Events & Scanner Access)</option>
                            <option value="MASTER_ADMIN">MASTER_ADMIN (Full Super Admin)</option>
                          </select>
                        </div>

                        {/* Save Changes Button */}
                        <button
                          type="button"
                          onClick={() => handleSaveUserAssignment(u.id, u.email, u.username)}
                          className="mt-3 xl:mt-0 px-4 py-2 bg-white text-black hover:bg-zinc-200 font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95"
                        >
                          <Check size={13} />
                          <span>SAVE CHANGES</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {u.role}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* MEMBER DIRECTORY SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="font-mono text-[10px] text-purple-400 font-bold tracking-wider mb-1">// PERSONNEL MATRIX</div>
            <h3 className="text-2xl sm:text-3xl font-black font-syne text-white uppercase tracking-tight">
              MEMBER DIRECTORY
            </h3>
          </div>
          <div className="font-mono text-xs text-zinc-400">
            TOTAL MEMBERS: <span className="text-white font-bold">{filteredOperatives.length}</span> / {members.length}
          </div>
        </div>

        {/* Filter, Search & View Toolbar */}
        <div
          style={{ backgroundColor: '#09090d' }}
          className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-[#09090d] p-4 border border-zinc-800 shadow-md"
        >
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, @username, skill, or role..."
              className="w-full bg-[#121218] border border-zinc-800 pl-9 pr-4 py-2 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* Track Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {tracks.map((t) => {
              const isSelected = selectedTrack === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    playCyberClick();
                    setSelectedTrack(t.id);
                  }}
                  className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider whitespace-nowrap border transition-all ${
                    isSelected
                      ? 'bg-zinc-200 text-black border-white font-bold'
                      : 'bg-[#121218] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                  }`}
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

            {/* View Toggle (Cards vs List) */}
            <div className="flex items-center border border-zinc-800 bg-[#121218] p-0.5">
              <button
                onClick={() => {
                  playCyberClick();
                  setViewMode('grid');
                }}
                title="Big Cards Grid"
                className={`p-1.5 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase ${
                  viewMode === 'grid'
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LayoutGrid size={13} />
                <span className="hidden sm:inline">CARDS</span>
              </button>
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Sort & View Mode Toggle */}
          <div className="flex items-center gap-3 font-mono text-xs shrink-0">
            {/* Sort Selector */}
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

            {/* View Toggle (Cards vs List) */}
            <div className="flex items-center border border-zinc-800 bg-[#121218] p-0.5">
              <button
                onClick={() => {
                  playCyberClick();
                  setViewMode('grid');
                }}
                title="Big Cards Grid"
                className={`p-1.5 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase ${
                  viewMode === 'grid'
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LayoutGrid size={13} />
                <span className="hidden sm:inline">CARDS</span>
              </button>
              <button
                onClick={() => {
                  playCyberClick();
                  setViewMode('list');
                }}
                title="Matrix List"
                className={`p-1.5 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase ${
                  viewMode === 'list'
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <List size={13} />
                <span className="hidden sm:inline">LIST</span>
              </button>
            </div>
          </div>
        </div>

        {/* Members Content / Empty State */}
        {members.length === 0 ? (
          <div
            style={{ backgroundColor: '#09090d' }}
            className="p-12 bg-[#09090d] border border-zinc-800 text-center space-y-4 tech-corner-box shadow-xl"
          >
            <div className="w-14 h-14 mx-auto bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400">
              <Users size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="font-syne font-black text-xl text-white uppercase">
                NO MEMBER PROFILES PUBLISHED YET
              </h4>
              <p className="font-mono text-xs text-zinc-400 max-w-md mx-auto">
                {isAdmin
                  ? 'As an Administrator, click "+ ADD MEMBER CARD" above to create and publish official member profiles with custom photos.'
                  : 'Member profiles will appear here once published by club leads.'}
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  playCyberClick();
                  setAddModalOpen(true);
                }}
                className="px-6 py-3 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider border border-white hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
              >
                <Plus size={14} />
                <span>+ ADD FIRST MEMBER CARD</span>
              </button>
            )}
          </div>
        ) : filteredOperatives.length === 0 ? (
          <div className="text-center py-16 bg-zinc-950 border border-dashed border-zinc-800 font-mono text-xs text-zinc-500">
            [!] NO OPERATIVES MATCH CURRENT SEARCH QUERY OR FILTER.
          </div>
        ) : viewMode === 'grid' ? (
          /* BIG CARDS GRID VIEW */
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
          /* COMPACT LIST VIEW */
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
      </section>

      {/* Member Details Modal */}
      {selectedMember && (
        <MemberModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {/* Admin Add Member Modal */}
      <AddMemberModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddMember={onAddMember}
      />
    </div>
  );
};

export default MemberDirectory;
