import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Crown, Shield, Edit3, Save } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../common/Icons';
import { ClubMember } from '../../types';
import { ChromeBadge } from '../common/ChromeBadge';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';
import { getRoleTier, getRoleStyles } from '../../utils/roleUtils';
import { AvatarImage } from '../common/AvatarImage';
import { useAuth } from '../../context/AuthContext';
import { memberService } from '../../services/memberService';

interface MemberModalProps {
  member: ClubMember | null;
  onClose: () => void;
  onUpdateMember?: (updated: ClubMember) => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({ member, onClose, onUpdateMember }) => {
  const { isAdmin, currentUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(member?.bio || '');
  const [skills, setSkills] = useState((member?.skills || []).join(', '));
  const [track, setTrack] = useState(member?.track || '');
  const [branch, setBranch] = useState(member?.branch || '');
  const [semester, setSemester] = useState(member?.semester || '');
  const [githubUrl, setGithubUrl] = useState(member?.githubUrl || member?.github || '');
  const [linkedinUrl, setLinkedinUrl] = useState(member?.linkedinUrl || member?.linkedin || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (member) {
      setBio(member.bio || '');
      setSkills((member.skills || []).join(', '));
      setTrack(member.track || '');
      setBranch(member.branch || '');
      setSemester(member.semester || '');
      setGithubUrl(member.githubUrl || member.github || '');
      setLinkedinUrl(member.linkedinUrl || member.linkedin || '');
      setIsEditing(false);

      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [member, onClose]);

  if (!member) return null;

  const canEdit = Boolean(
    isAdmin ||
      (currentUser &&
        (currentUser.id === member.id ||
          currentUser.email === member.email ||
          currentUser.username === member.username))
  );

  const name = member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Member';
  const handle = member.username || member.callsign || 'member';
  const tier = getRoleTier(member);
  const styles = getRoleStyles(tier);

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    playCyberClick();
    setIsSaving(true);

    const updatedSkills = skills.split(',').map((s) => s.trim()).filter(Boolean);
    const updatedMember: ClubMember = {
      ...member,
      bio,
      track,
      branch,
      semester,
      skills: updatedSkills,
      githubUrl,
      github: githubUrl,
      linkedinUrl,
      linkedin: linkedinUrl,
    };

    try {
      await memberService.createOrUpdateMember({
        userId: member.id || member.userId,
        username: member.username,
        email: member.email,
        bio,
        track,
        branch,
        semester,
        skills: updatedSkills,
        githubUrl,
        linkedinUrl,
      });

      if (onUpdateMember) {
        onUpdateMember(updatedMember);
      }
      playSuccessChime();
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update member profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const modalContent = (
    <div
      data-lenis-prevent="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-modal-title"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflow: 'hidden',
      }}
    >
      {/* 100% Solid Dark Backdrop */}
      <div
        onClick={() => {
          playCyberClick();
          onClose();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#000000',
          opacity: 0.92,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          zIndex: 1,
        }}
      />

      {/* 100% Solid Opaque Modal Window */}
      <div
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 10,
          backgroundColor: '#0a0a0f',
          background: '#0a0a0f',
          color: '#ffffff',
          width: '100%',
          maxWidth: '42rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          border: '2px solid #52525b',
          boxShadow: '0 0 80px rgba(0, 0, 0, 1), 0 25px 50px -12px rgba(0, 0, 0, 0.95)',
          padding: '1.5rem',
          fontFamily: 'var(--font-mono), monospace',
          userSelect: 'none',
          opacity: 1,
          isolation: 'isolate',
        }}
        className="sm:p-8 tech-corner-box modal-scroll-box"
      >
        {/* Top Bar with Title and Close */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-[10px] text-zinc-400">
          <div className="flex items-center gap-2">
            <span id="member-modal-title" className="font-bold text-white uppercase tracking-wider">
              {isEditing ? 'EDIT MEMBER PROFILE' : 'MEMBER PROFILE'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => {
                  playCyberClick();
                  setIsEditing(!isEditing);
                }}
                className="px-2.5 py-1 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-[10px] uppercase font-bold flex items-center gap-1 bg-[#14141d] transition-colors"
              >
                <Edit3 size={11} />
                <span>{isEditing ? 'VIEW' : 'EDIT'}</span>
              </button>
            )}

            <button
              onClick={() => {
                playCyberClick();
                onClose();
              }}
              className="p-1.5 border border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors bg-[#14141d]"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {isEditing ? (
          /* Inline Edit Form (X3) */
          <form onSubmit={handleSaveMember} className="mt-6 space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">TRACK FOCUS</label>
                <input
                  type="text"
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black border border-zinc-800 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">BRANCH</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black border border-zinc-800 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">SEMESTER</label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black border border-zinc-800 text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">ABOUT / BIO</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-1.5 bg-black border border-zinc-800 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">SKILLS (comma separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-3 py-1.5 bg-black border border-zinc-800 text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">GITHUB URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black border border-zinc-800 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">LINKEDIN URL</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black border border-zinc-800 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-white text-black font-bold uppercase hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
              >
                <Save size={13} />
                <span>{isSaving ? 'SAVING...' : 'SAVE CHANGES'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Standard View Mode */
          <>
            {/* Member Header Information */}
            <div className="mt-6 flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar Box */}
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 shrink-0 overflow-hidden flex items-center justify-center bg-black ${styles.avatarBorderClass}`}
              >
                <AvatarImage
                  src={member.avatarUrl}
                  alt={name}
                  fallbackText={name.charAt(0) || handle.charAt(0) || 'M'}
                  className="w-full h-full object-cover"
                  fallbackClassName="font-syne font-black text-3xl text-purple-300 uppercase select-none"
                />
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`font-mono text-xs font-bold ${styles.textColor}`}>
                    @{handle}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={styles.badgeClass}>{styles.label}</span>
                  </div>
                  <ChromeBadge
                    label={member.track || 'Web Development'}
                    variant="dark"
                    size="sm"
                  />
                </div>

                <h2 className="text-2xl sm:text-3xl font-black font-syne text-white tracking-tight leading-snug">
                  {name}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-zinc-400 pt-1">
                  {member.branch && (
                    <span className="flex items-center gap-1">
                      Branch: <span className="text-white font-bold">{member.branch} {member.semester ? `(${member.semester})` : ''}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    Status: <span className="text-zinc-300 font-bold">{member.status || 'Active'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Biography Section */}
            <div className="mt-6 p-4 bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 leading-relaxed">
              <div className="text-[10px] text-zinc-500 mb-1 uppercase font-bold tracking-wider">ABOUT</div>
              {member.bio || 'Active verified member of the Skill Development Club.'}
            </div>

            {/* Skills Matrix */}
            <div className="mt-6 space-y-2">
              <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider flex items-center gap-2">
                <span>SKILLS & CAPABILITIES</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(member.skills && member.skills.length > 0 ? member.skills : ['Web Development', 'React', 'Problem Solving']).map((s, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs font-mono bg-zinc-900 border border-zinc-700 text-zinc-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Social / External Links */}
            <div className="mt-8 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                {(() => {
                  const rawGit = member.githubUrl || member.github;
                  const safeGit = rawGit ? (rawGit.startsWith('http://') || rawGit.startsWith('https://') ? rawGit : `https://${rawGit}`) : null;
                  if (!safeGit || (!safeGit.startsWith('http://') && !safeGit.startsWith('https://'))) return null;
                  return (
                    <a
                      href={safeGit}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-200 flex items-center gap-1.5 transition-colors"
                    >
                      <GithubIcon size={14} />
                      <span>GitHub</span>
                    </a>
                  );
                })()}
                {(() => {
                  const rawIn = member.linkedinUrl || member.linkedin;
                  const safeIn = rawIn ? (rawIn.startsWith('http://') || rawIn.startsWith('https://') ? rawIn : `https://${rawIn}`) : null;
                  if (!safeIn || (!safeIn.startsWith('http://') && !safeIn.startsWith('https://'))) return null;
                  return (
                    <a
                      href={safeIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-200 flex items-center gap-1.5 transition-colors"
                    >
                      <LinkedinIcon size={14} />
                      <span>LinkedIn</span>
                    </a>
                  );
                })()}
              </div>

              <button
                onClick={() => {
                  playCyberClick();
                  onClose();
                }}
                className="px-5 py-2 bg-white text-black font-bold uppercase hover:bg-zinc-200 transition-colors"
              >
                CLOSE
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
export default MemberModal;
