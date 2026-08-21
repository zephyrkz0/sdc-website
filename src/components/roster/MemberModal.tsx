import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Shield, Award, Terminal, Calendar, MapPin, Sparkles } from 'lucide-react';
import { GithubIcon, TwitterIcon, LinkedinIcon } from '../common/Icons';
import { ClubMember } from '../../types';
import { ChromeBadge } from '../common/ChromeBadge';
import { playCyberClick } from '../common/AudioEffects';

interface MemberModalProps {
  member: ClubMember | null;
  onClose: () => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({ member, onClose }) => {
  if (!member) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            playCyberClick();
            onClose();
          }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window with Acubi Brutalist styling */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-700 shadow-2xl p-6 sm:p-8 z-10 my-8 overflow-hidden tech-corner-box max-h-[90vh] overflow-y-auto"
        >
          {/* Top Bar: Serial ID & Close Button */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 font-mono text-[10px] text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">[OPERATIVE_DOSSIER]</span>
              <span>//</span>
              <span className="text-zinc-300">{member.opId}</span>
              <span>//</span>
              <span className="text-emerald-400 font-bold">{member.status}</span>
            </div>

            <button
              onClick={() => {
                playCyberClick();
                onClose();
              }}
              className="p-1.5 border border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors bg-zinc-900"
            >
              <X size={16} />
            </button>
          </div>

          {/* Profile Header: Avatar, Name, Role & Badges */}
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-zinc-900 border-2 border-white/60 overflow-hidden shrink-0">
              <img
                src={member.avatarUrl}
                alt={member.fullName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-scanline opacity-40 pointer-events-none" />
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-purple-400 font-bold">
                  @{member.callsign}
                </span>
                <ChromeBadge
                  label={member.tier.replace('_', ' ')}
                  variant={member.tier === 'COMMAND_LEADERSHIP' ? 'silver' : 'dark'}
                  size="sm"
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-syne text-white tracking-tight">
                {member.fullName}
              </h2>

              <p className="font-mono text-xs text-zinc-300">
                {member.roleTitle}
              </p>

              <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin size={10} /> {member.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={10} /> JOINED: {member.joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Bio statement */}
          <div className="mt-6 p-4 bg-zinc-900/50 border border-zinc-800 font-mono text-xs text-zinc-300 leading-relaxed">
            <div className="text-[9px] text-zinc-500 pb-1">// MISSION_STATEMENT</div>
            {member.bio}
          </div>

          {/* Aggregate Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3 font-mono text-center">
            <div className="p-3 bg-zinc-900 border border-zinc-800">
              <div className="text-[9px] text-zinc-500">HOURS LOGGED</div>
              <div className="text-lg font-bold text-white mt-0.5">{member.hoursContributed} hrs</div>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800">
              <div className="text-[9px] text-zinc-500">MODULES COMPLETED</div>
              <div className="text-lg font-bold text-white mt-0.5">{member.completedModules}</div>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800">
              <div className="text-[9px] text-zinc-500">PROJECTS SHIPPED</div>
              <div className="text-lg font-bold text-white mt-0.5">{member.projectsCount}</div>
            </div>
          </div>

          {/* Earned Badges Section */}
          {member.badges && member.badges.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-mono text-xs font-bold text-white uppercase flex items-center gap-2">
                <Award size={14} className="text-amber-400" />
                <span>CRYPTOGRAPHIC BADGES ({member.badges.length})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {member.badges.map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3 font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{b.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-zinc-200">{b.name}</div>
                        <div className="text-[9px] text-zinc-500">{b.description}</div>
                      </div>
                    </div>
                    <span className="text-[8px] px-1.5 py-0.5 border border-zinc-700 bg-zinc-950 text-zinc-400 shrink-0">
                      {b.rarity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio Projects Section */}
          {member.projects && member.projects.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-mono text-xs font-bold text-white uppercase flex items-center gap-2">
                <Terminal size={14} className="text-emerald-400" />
                <span>DEPLOYED PROJECTS & REPOSITORIES</span>
              </h3>

              <div className="space-y-3">
                {member.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 bg-zinc-900 border border-zinc-800 space-y-2 hover:border-zinc-600 transition-colors font-mono"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-white">
                        {proj.title}
                      </h4>
                      <span className="text-[9px] text-zinc-500">{proj.year}</span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
                      <div className="flex flex-wrap gap-1">
                        {proj.tags.map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 text-[8px] bg-zinc-950 border border-zinc-800 text-zinc-400"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3">
                        {proj.repoUrl && (
                          <a
                            href={proj.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white transition-colors"
                          >
                            <GithubIcon size={12} />
                            <span>CODE</span>
                          </a>
                        )}
                        {proj.demoUrl && (
                          <a
                            href={proj.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            <ExternalLink size={12} />
                            <span>LIVE DEMO</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social & Close Action */}
          <div className="mt-8 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              {member.github && (
                <a
                  href={member.github}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white"
                >
                  <GithubIcon size={14} />
                </a>
              )}
              {member.twitter && (
                <a
                  href={member.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white"
                >
                  <TwitterIcon size={14} />
                </a>
              )}
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white"
                >
                  <LinkedinIcon size={14} />
                </a>
              )}
            </div>

            <button
              onClick={() => {
                playCyberClick();
                onClose();
              }}
              className="w-full sm:w-auto px-5 py-2 bg-zinc-100 text-black font-bold uppercase tracking-wider hover:bg-white"
            >
              CLOSE DOSSIER [ESC]
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
