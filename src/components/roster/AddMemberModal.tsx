import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ClubMember } from '../../types';
import { X, Upload, User, Sparkles, Image as ImageIcon } from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';
import { memberService } from '../../services/memberService';
import { AvatarImage } from '../common/AvatarImage';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (newMember: ClubMember) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [track, setTrack] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [hoursContributed, setHoursContributed] = useState<number | string>('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'DEPLOYED' | 'STANDBY'>('ACTIVE');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playCyberClick();
    setErrorMsg('');

    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim()) {
      setErrorMsg('First Name, Last Name, Username, and Email are required.');
      return;
    }

    setIsUploading(true);

    let finalAvatarUrl = avatarUrl;
    if (avatarFile) {
      const uploaded = await memberService.uploadAvatar(avatarFile);
      if (uploaded) finalAvatarUrl = uploaded;
    }

    const newMemberData: Omit<ClubMember, 'id' | 'createdAt'> = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
      email: email.trim().toLowerCase(),
      role: role.trim(),
      roleTitle: role.trim(),
      tier: role.toLowerCase().includes('admin') ? 'ADMIN' : 'MEMBER',
      opId: `SDC-MEM-${Date.now().toString().slice(-4)}`,
      track: track.trim(),
      avatarUrl: finalAvatarUrl || '',
      bio: bio.trim() || 'Active verified member of Skill Development Club.',
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      badges: [],
      projects: [],
      hoursContributed: Number(hoursContributed) || 0,
      completedModules: 0,
      projectsCount: 0,
      location: 'CUCEK CAMPUS',
      joinedDate: new Date().getFullYear().toString(),
      githubUrl: githubUrl.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
      status,
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      callsign: username.trim(),
    };

    const saved = await memberService.createMember(newMemberData);
    setIsUploading(false);

    if (saved) {
      onAddMember(saved);
      playSuccessChime();
      onClose();
    } else {
      setErrorMsg('Failed to save member. Please try again.');
    }
  };

  const modalContent = (
    <div
      data-lenis-prevent="true"
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
      {/* Solid Backdrop */}
      <div
        onClick={onClose}
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

      {/* Modal Window with Isolated Scrolling */}
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
          maxWidth: '38rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          border: '2px solid #a855f7',
          boxShadow: '0 0 80px rgba(0, 0, 0, 1), 0 0 40px rgba(168, 85, 247, 0.25)',
          padding: '1.5rem',
          fontFamily: 'var(--font-mono), monospace',
          userSelect: 'none',
          opacity: 1,
          isolation: 'isolate',
        }}
        className="sm:p-8 tech-corner-box text-zinc-100 modal-scroll-box"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-none animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              ADD NEW MEMBER TO DIRECTORY
              </h3>
            </div>
            <button
              onClick={() => {
                playCyberClick();
                onClose();
              }}
              className="p-1.5 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-500 bg-zinc-900 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs font-mono">
            {/* Avatar Upload */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-400 uppercase tracking-wider">PROFILE PHOTO</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-zinc-900 border border-zinc-700 overflow-hidden flex items-center justify-center relative shrink-0">
                  <AvatarImage
                    src={avatarUrl}
                    alt="Preview"
                    fallbackText={firstName?.[0] || 'U'}
                    className="w-full h-full object-cover"
                    fallbackClassName="font-syne font-bold text-xl text-zinc-400 uppercase"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 hover:border-zinc-500 cursor-pointer transition-colors text-xs">
                    <Upload size={13} />
                    <span>CHOOSE FILE TO UPLOAD</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Names & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase">FIRST NAME *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase">LAST NAME *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase">USERNAME (HANDLE) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-500 text-xs">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 pl-7 pr-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase">EMAIL ADDRESS *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {/* Role & Track */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase">ROLE TITLE</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase">TRACK FOCUS</label>
                <input
                  type="text"
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase">BIO / ABOUT</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-zinc-500 text-xs"
              />
            </div>

            {/* Skills & Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase">SKILLS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase">HOURS CONTRIBUTED</label>
                <input
                  type="number"
                  min="0"
                  value={hoursContributed}
                  onChange={(e) => setHoursContributed(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {/* Socials & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase">GITHUB URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase">LINKEDIN URL</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase">STATUS</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DEPLOYED">DEPLOYED</option>
                  <option value="STANDBY">STANDBY</option>
                </select>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-950/60 border border-red-800/80 text-[11px] text-red-300">
                {errorMsg}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  onClose();
                }}
                className="px-4 py-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition-colors"
              >
                CANCEL
              </button>

              <button
                type="submit"
                disabled={isUploading}
                className="px-5 py-2 bg-white text-black font-bold text-xs uppercase tracking-wider border border-white hover:bg-zinc-200 transition-all flex items-center gap-2"
              >
                <Sparkles size={13} />
                <span>{isUploading ? 'ADDING MEMBER...' : 'ADD MEMBER'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default AddMemberModal;
