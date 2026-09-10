import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClubMember } from '../../types';
import { MemberIdCard } from './OperativeIdCard';
import {
  Edit3,
  Check,
  Sparkles,
  Lock,
  Camera,
  Trash2,
  AlertTriangle,
  X,
  User,
  LogIn,
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';
import html2canvas from 'html2canvas';
import { memberService } from '../../services/memberService';
import { getRoleTier, getRoleStyles } from '../../utils/roleUtils';

interface UserProfileProps {
  userProfile?: ClubMember;
  onUpdateProfile?: (updated: ClubMember) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userProfile: propProfile,
  onUpdateProfile,
}) => {
  const { currentUser, updateUserProfile, setAuthModalOpen, deleteAccount } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [bio, setBio] = useState('');
  const [track, setTrack] = useState('');
  const [skills, setSkills] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Deletion modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const profile = currentUser || propProfile;
    if (profile) {
      setFirstName(profile.firstName || profile.fullName?.split(' ')[0] || '');
      setLastName(profile.lastName || profile.fullName?.split(' ').slice(1).join(' ') || '');
      setBranch(profile.branch || '');
      setSemester(profile.semester || '');
      setBio(profile.bio || '');
      setTrack(profile.track || '');
      setSkills((profile.skills || []).join(', '));
      setAvatarUrl(profile.avatarUrl || '');
      setGithubUrl(profile.githubUrl || profile.github || '');
      setLinkedinUrl(profile.linkedinUrl || profile.linkedin || '');
    }
  }, [currentUser, propProfile]);

  if (!currentUser && !propProfile) {
    return (
      <div className="space-y-8 font-mono">
        <div className="space-y-2 border-b border-zinc-800 pb-4">
          <h2 className="text-3xl sm:text-4xl font-syne font-black tracking-tight text-white uppercase">
            MEMBER PROFILE
          </h2>
          <p className="text-xs text-zinc-400">
            Manage your personal profile, credentials, and project showcase.
          </p>
        </div>

        <div className="max-w-md mx-auto p-8 bg-zinc-950 border border-zinc-800 text-center space-y-4">
          <Lock size={28} className="mx-auto text-zinc-400" />
          <h3 className="font-syne font-bold text-lg text-white">SIGN IN REQUIRED</h3>
          <p className="text-xs text-zinc-400">Please sign in to view and manage your profile.</p>
          <button
            onClick={() => {
              playCyberClick();
              setAuthModalOpen(true);
            }}
            className="px-6 py-2.5 bg-white text-black font-bold uppercase text-xs"
          >
            SIGN IN / REGISTER
          </button>
        </div>
      </div>
    );
  }

  const activeUser = currentUser || propProfile!;
  const roleTier = getRoleTier(activeUser);
  const roleStyles = getRoleStyles(roleTier);

  const handleDownloadIdPass = async () => {
    playCyberClick();
    const node = document.getElementById('member-id-card-node');
    if (!node) return;

    try {
      const canvas = await html2canvas(node, {
        scale: 3,
        backgroundColor: '#000000',
        useCORS: true,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `SDC_ID_${activeUser.username || 'CARD'}.png`;
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    playCyberClick();

    const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
    const updatedData: Partial<ClubMember> = {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim() || activeUser.fullName,
      bio,
      track,
      branch,
      semester,
      skills: skillsArray,
      avatarUrl,
      githubUrl,
      linkedinUrl,
    };

    if (currentUser) {
      updateUserProfile(updatedData as any);
      try {
        await memberService.createOrUpdateMember({
          userId: currentUser.id,
          username: currentUser.username,
          email: currentUser.email,
          ...updatedData,
        });
      } catch (err) {
        console.warn(err);
      }
    }

    if (onUpdateProfile) {
      onUpdateProfile({ ...activeUser, ...updatedData } as ClubMember);
    }

    playSuccessChime();
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-fade-in font-mono">
      {/* Header (Frame 11) */}
      <div className="space-y-2 border-b border-zinc-800 pb-4">
        <h2 className="text-3xl sm:text-4xl font-syne font-black tracking-tight text-white uppercase">
          MEMBER PROFILE
        </h2>
        <p className="text-xs text-zinc-400">
          Manage your personal profile, credentials, and project showcase.
        </p>
      </div>

      {/* Main Grid: Left Vertical ID Card & Right Profile Info Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: ID Card */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-bold">Member ID</span>
            <button
              onClick={handleDownloadIdPass}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              [Export ID Card]
            </button>
          </div>

          <div id="member-id-card-node" className="flex justify-center">
            <MemberIdCard
              member={{
                ...activeUser,
                firstName,
                lastName,
                fullName: `${firstName} ${lastName}`.trim() || activeUser.fullName,
                bio,
                track,
                branch,
                semester,
                avatarUrl,
              }}
            />
          </div>
        </div>

        {/* Right Column: Glowing Golden Profile Information Box (Frame 11) */}
        <div
          className={`lg:col-span-7 p-6 space-y-6 select-none ${roleStyles.cardBgClass} ${roleStyles.cardBorderClass} ${roleStyles.cardGlowClass}`}
        >
          {/* Top Bar with Profile Information */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <User size={16} className={roleStyles.textColor} />
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                PROFILE INFORMATION
              </span>
            </div>

            <button
              onClick={() => {
                playCyberClick();
                setIsEditing(!isEditing);
              }}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-white text-white text-xs uppercase font-bold flex items-center gap-1.5 transition-all"
            >
              <Edit3 size={13} />
              <span>{isEditing ? 'CANCEL' : 'EDIT PROFILE'}</span>
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-[10px] mb-1">FIRST NAME</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] mb-1">LAST NAME</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-[10px] mb-1">ABOUT & SUMMARY</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-[10px] mb-1">BRANCH</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] mb-1">SEMESTER</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] mb-1">TRACK FOCUS</label>
                  <input
                    type="text"
                    value={track}
                    onChange={(e) => setTrack(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-[10px] mb-1">CORE SKILLS (comma-separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-white text-black font-bold uppercase text-xs hover:bg-zinc-200"
              >
                SAVE CHANGES
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-xs font-mono">
              {/* 4 Info Boxes (Frame 11) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-black/60 border border-zinc-800 p-3 space-y-1">
                  <span className="text-zinc-500 text-[9px] uppercase block">NAME</span>
                  <span className="font-bold text-white truncate block">
                    {activeUser.fullName || `${firstName} ${lastName}`.trim() || 'Member'}
                  </span>
                </div>

                <div className="bg-black/60 border border-zinc-800 p-3 space-y-1">
                  <span className="text-zinc-500 text-[9px] uppercase block">HANDLE</span>
                  <span className="font-bold text-purple-300 truncate block">
                    @{activeUser.username || activeUser.callsign || 'member'}
                  </span>
                </div>

                <div className="bg-black/60 border border-zinc-800 p-3 space-y-1">
                  <span className="text-zinc-500 text-[9px] uppercase block">BRANCH • SEM</span>
                  <span className="font-bold text-zinc-300 truncate block">
                    {branch || '—'} {semester ? `• ${semester}` : ''}
                  </span>
                </div>

                <div className="bg-black/60 border border-zinc-800 p-3 space-y-1">
                  <span className="text-zinc-500 text-[9px] uppercase block">TRACK</span>
                  <span className="font-bold text-zinc-300 truncate block">{track || '—'}</span>
                </div>
              </div>

              {/* About & Summary Box (Frame 11) */}
              <div className="bg-black/60 border border-zinc-800 p-3 space-y-1">
                <span className="text-zinc-500 text-[9px] uppercase block">ABOUT & SUMMARY</span>
                <p className="text-zinc-300 leading-relaxed text-xs">{bio || 'No bio added yet.'}</p>
              </div>

              {/* Core Skills Box (Frame 11) */}
              <div className="bg-black/60 border border-zinc-800 p-3 space-y-2">
                <span className="text-zinc-500 text-[9px] uppercase block">CORE SKILLS</span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.split(',').map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px]"
                    >
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default UserProfile;
