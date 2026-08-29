import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { User, Sparkles, Code2, Globe, Cpu, BrainCircuit, ArrowRight, Upload, X, Trash2 } from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';
import { memberService } from '../../services/memberService';

export const OnboardingModal: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState('S1');
  const [track, setTrack] = useState('Web Development');
  const [bio, setBio] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill whatever Google or auth provided as starting point (never email for username)
  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || '');
      setLastName(currentUser.lastName || '');
      const initialUsername = currentUser.username && !currentUser.username.includes('@') ? currentUser.username : '';
      setUsername(initialUsername);
      setAvatarUrl(currentUser.avatarUrl || '');
      setTrack(currentUser.track || 'Web Development');
      setBranch(currentUser.branch || 'Computer Science & Engineering');
      setSemester(currentUser.semester || 'S1');
      setBio(currentUser.bio || '');
      setSkills(currentUser.skills || []);
    }
  }, [currentUser]);

  // If no user or user has already completed onboarding, do not show
  if (!currentUser || currentUser.hasCompletedOnboarding) {
    return null;
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const uploadedUrl = await memberService.uploadAvatar(file);
    setIsUploadingAvatar(false);

    if (uploadedUrl) {
      setAvatarUrl(uploadedUrl);
      playSuccessChime();
    }
  };

  const handleRemoveAvatar = () => {
    playCyberClick();
    setAvatarUrl('');
    playSuccessChime();
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const clean = skillInput.trim();
    if (clean && !skills.includes(clean)) {
      setSkills((prev) => [...prev, clean]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playCyberClick();
    setErrorMsg('');

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Please enter your first and last name.');
      return;
    }

    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMsg('Please choose a valid username (at least 3 characters, letters/numbers/underscore).');
      return;
    }

    setIsSubmitting(true);

    const updatedData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      username: cleanUsername,
      callsign: cleanUsername,
      avatarUrl: avatarUrl.trim(),
      track,
      branch,
      semester,
      bio: bio.trim(),
      skills,
      hasCompletedOnboarding: true,
      location: 'CUCEK Campus',
    };

    updateUserProfile(updatedData);

    // Sync to member directory in Supabase
    try {
      await memberService.createOrUpdateMember({
        id: currentUser.id,
        userId: currentUser.id,
        username: cleanUsername,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        email: currentUser.email,
        role: currentUser.role || 'MEMBER',
        track,
        branch,
        semester,
        avatarUrl: avatarUrl.trim(),
        bio: bio.trim(),
        skills,
        hoursContributed: currentUser.hoursContributed || 0,
        status: 'ACTIVE',
        callsign: cleanUsername,
        location: 'CUCEK Campus',
      });
    } catch (err) {
      console.warn('Member directory sync note:', err);
    }

    setIsSubmitting(false);
    playSuccessChime();
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
      {/* Backdrop */}
      <div
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

      {/* Modal Window */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          backgroundColor: '#0a0a0f',
          background: '#0a0a0f',
          color: '#ffffff',
          width: '100%',
          maxWidth: '40rem',
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
        className="sm:p-8 tech-corner-box modal-scroll-box space-y-6"
      >
        {/* Header */}
        <div className="space-y-2 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase">
            <Sparkles size={14} />
            <span>Welcome to Skill Development Club</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-syne text-white uppercase tracking-tight">
            SET UP YOUR PROFILE
          </h2>
          <p className="text-xs font-mono text-zinc-400 leading-relaxed">
            Choose your display name, unique username handle, and focus domain to complete your account registration.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/50 border border-red-800/80 text-red-300 font-mono text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {/* Optional Profile Photo */}
          <div className="space-y-1.5 p-3.5 bg-[#121218] border border-zinc-800">
            <label className="text-zinc-400 uppercase font-bold text-[10px] flex items-center justify-between">
              <span>Profile Photo (Optional)</span>
              <span className="text-zinc-500 font-normal">No photo required</span>
            </label>
            <div className="flex items-center gap-3 pt-1">
              <div className="w-12 h-12 bg-[#181822] border border-zinc-700 overflow-hidden flex items-center justify-center relative shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="font-syne font-bold text-base text-purple-300 uppercase">
                    {(firstName?.[0] || username?.[0] || 'U')}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-white cursor-pointer hover:border-purple-400 flex items-center gap-1.5 text-xs transition-colors">
                  <Upload size={12} />
                  <span>{isUploadingAvatar ? 'UPLOADING...' : 'UPLOAD PHOTO'}</span>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-3 py-1.5 bg-red-950/40 border border-red-800/80 text-red-300 hover:text-red-200 hover:bg-red-900/60 flex items-center gap-1.5 text-xs transition-colors"
                  >
                    <Trash2 size={12} />
                    <span>REMOVE</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-zinc-400 uppercase font-bold text-[10px]">
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Aditya"
                className="w-full bg-[#121218] border border-zinc-800 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-400 uppercase font-bold text-[10px]">
                Last Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Sharma"
                className="w-full bg-[#121218] border border-zinc-800 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 uppercase font-bold text-[10px]">
              Unique Username Handle <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-zinc-500 font-bold">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="choose_username"
                className="w-full bg-[#121218] border border-zinc-800 pl-8 pr-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-400"
              />
            </div>
            <p className="text-[10px] text-zinc-500">Type your preferred handle. This will appear on your ID pass and member profile.</p>
          </div>

          {/* Branch and Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-zinc-400 uppercase font-bold text-[10px]">
                Branch / Department
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-[#121218] border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-400"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-400 uppercase font-bold text-[10px]">
                Current Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-[#121218] border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-400"
              >
                <option value="S1">Semester 1 (S1)</option>
                <option value="S2">Semester 2 (S2)</option>
                <option value="S3">Semester 3 (S3)</option>
                <option value="S4">Semester 4 (S4)</option>
                <option value="S5">Semester 5 (S5)</option>
                <option value="S6">Semester 6 (S6)</option>
                <option value="S7">Semester 7 (S7)</option>
                <option value="S8">Semester 8 (S8)</option>
              </select>
            </div>
          </div>

          {/* Focus Domain */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 uppercase font-bold text-[10px]">
              Primary Focus Domain
            </label>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              className="w-full bg-[#121218] border border-zinc-800 px-3.5 py-2 text-white focus:outline-none focus:border-purple-400"
            >
              <option value="Web Development">Web Development (Full-Stack / React / Node)</option>
              <option value="DSA">Data Structures & Algorithms (DSA)</option>
              <option value="AI & Machine Learning">AI & Machine Learning (AI/ML)</option>
            </select>
          </div>

          {/* Bio (Optional) */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 uppercase font-bold text-[10px]">
              Bio / About You (Optional)
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other members what you are building or interested in learning..."
              className="w-full bg-[#121218] border border-zinc-800 px-3.5 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Skills Tags */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 uppercase font-bold text-[10px]">
              Technical Skills (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="e.g. React, Python, C++ (Press Enter)"
                className="flex-1 bg-[#121218] border border-zinc-800 px-3.5 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-400 text-xs"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700 font-bold"
              >
                Add
              </button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 bg-[#181822] border border-zinc-700 text-zinc-200 text-[10px] flex items-center gap-1.5"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-zinc-400 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-zinc-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-white text-black font-bold uppercase tracking-wider border border-white hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'SAVING PROFILE...' : 'COMPLETE PROFILE SETUP'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default OnboardingModal;
