import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Crown, Shield } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../common/Icons';
import { ClubMember } from '../../types';
import { ChromeBadge } from '../common/ChromeBadge';
import { playCyberClick } from '../common/AudioEffects';
import { getRoleTier, getRoleStyles } from '../../utils/roleUtils';

interface MemberModalProps {
  member: ClubMember | null;
  onClose: () => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({ member, onClose }) => {
  useEffect(() => {
    if (member) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [member]);

  if (!member) return null;

  const name = member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Member';
  const handle = member.username || member.callsign || 'member';
  const tier = getRoleTier(member);
  const styles = getRoleStyles(tier);

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
            <span className="font-bold text-white uppercase tracking-wider">MEMBER PROFILE</span>
          </div>

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

        {/* Member Header Information */}
        <div className="mt-6 flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar Box */}
          <div
            className={`w-24 h-24 sm:w-28 sm:h-28 shrink-0 overflow-hidden flex items-center justify-center bg-black ${styles.avatarBorderClass}`}
          >
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="font-syne font-black text-3xl text-purple-300 uppercase select-none">
                {name.charAt(0) || handle.charAt(0) || 'M'}
              </span>
            )}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`font-mono text-xs font-bold ${styles.textColor}`}>
                @{handle}
              </span>
              <div className="flex items-center gap-1.5">
                <span className={styles.badgeClass}>
                  {styles.label}
                </span>
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
            {member.githubUrl || member.github ? (
              <a
                href={member.githubUrl || member.github}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-200 flex items-center gap-1.5 transition-colors"
              >
                <GithubIcon size={14} />
                <span>GitHub</span>
              </a>
            ) : null}
            {member.linkedinUrl || member.linkedin ? (
              <a
                href={member.linkedinUrl || member.linkedin}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-200 flex items-center gap-1.5 transition-colors"
              >
                <LinkedinIcon size={14} />
                <span>LinkedIn</span>
              </a>
            ) : null}
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
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
export default MemberModal;
