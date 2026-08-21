import React, { useState } from 'react';
import { ClubMember, ProjectPortfolioItem, DomainTrack } from '../../types';
import { OperativeIdCard } from './OperativeIdCard';
import { ProjectPortfolio } from './ProjectPortfolio';
import { SkillHexGrid } from './SkillHexGrid';
import { BlueprintHeader } from '../common/BlueprintHeader';
import { ChromeBadge } from '../common/ChromeBadge';
import { Edit3, Check, Award, Clock, BookOpen, Terminal, Sparkles, Shield, User } from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';
import html2canvas from 'html2canvas';

interface UserProfileProps {
  userProfile: ClubMember;
  onUpdateProfile: (updated: ClubMember) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userProfile,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [callsign, setCallsign] = useState(userProfile.callsign);
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [roleTitle, setRoleTitle] = useState(userProfile.roleTitle);
  const [bio, setBio] = useState(userProfile.bio);
  const [track, setTrack] = useState<DomainTrack>(userProfile.track);
  const [location, setLocation] = useState(userProfile.location);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    playCyberClick();
    playSuccessChime();

    const updated: ClubMember = {
      ...userProfile,
      callsign: callsign.toUpperCase(),
      fullName,
      roleTitle,
      bio,
      track,
      location,
    };

    onUpdateProfile(updated);
    setIsEditing(false);
  };

  const handleAddProject = (newProject: ProjectPortfolioItem) => {
    const updated: ClubMember = {
      ...userProfile,
      projects: [newProject, ...userProfile.projects],
      projectsCount: userProfile.projectsCount + 1,
      hoursContributed: userProfile.hoursContributed + 15,
    };
    onUpdateProfile(updated);
  };

  const handleDownloadIdPass = async () => {
    playCyberClick();
    const node = document.getElementById('operative-id-card-node');
    if (!node) return;

    try {
      const canvas = await html2canvas(node, {
        scale: 3,
        backgroundColor: '#08080a',
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${userProfile.opId}_ID_PASS.png`;
      link.click();
      playSuccessChime();
    } catch (err) {
      console.error('Error exporting ID card:', err);
    }
  };

  return (
    <div className="space-y-16">
      {/* SECTION HEADER */}
      <BlueprintHeader
        stepNumber="04"
        tag="OPERATIVE_ID_SYS"
        title="INDIVIDUAL OPERATIVE DASHBOARD"
        subtitle="Personalized hub managing your verified club identity, physical 3D pass, skill telemetry, and portfolio deployments."
      />

      {/* TOP GRID: 3D ID CARD & PERSONAL TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 3D Operative ID Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-mono text-xs font-bold text-white uppercase flex items-center gap-2">
              <span className="text-zinc-500">//</span> PHYSICAL_ID_BADGE
            </h4>
            <button
              onClick={handleDownloadIdPass}
              className="font-mono text-[10px] text-purple-400 hover:text-purple-300 underline"
            >
              [EXPORT PNG PASS]
            </button>
          </div>

          <OperativeIdCard member={userProfile} onDownloadCard={handleDownloadIdPass} />
        </div>

        {/* Right: Editable Profile Dossier & Achievements */}
        <div className="lg:col-span-7 space-y-6">
          {/* Identity Card Details / Edit Form */}
          <div className="bg-zinc-950 border border-zinc-800 p-6 tech-corner-box">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 font-mono text-[10px]">
              <div className="flex items-center gap-2">
                <User size={13} className="text-purple-400" />
                <span className="font-bold text-white">OPERATIVE CREDENTIALS</span>
                <span className="text-zinc-500">// {userProfile.opId}</span>
              </div>

              <button
                onClick={() => {
                  playCyberClick();
                  setIsEditing(!isEditing);
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-200 hover:text-white transition-colors"
              >
                <Edit3 size={11} />
                <span>{isEditing ? 'CANCEL EDIT' : 'EDIT IDENTITY'}</span>
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="mt-5 space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">CALLSIGN (@)</label>
                    <input
                      type="text"
                      value={callsign}
                      onChange={(e) => setCallsign(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">FULL NAME</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">ROLE TITLE</label>
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">DOMAIN TRACK</label>
                    <select
                      value={track}
                      onChange={(e) => setTrack(e.target.value as DomainTrack)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white focus:outline-none"
                    >
                      <option value="CORE_CODE">CORE_CODE</option>
                      <option value="GENERATIVE_AI">GENERATIVE_AI</option>
                      <option value="CYBER_SECURITY">CYBER_SECURITY</option>
                      <option value="CREATIVE_3D">CREATIVE_3D</option>
                      <option value="PRODUCT_DESIGN">PRODUCT_DESIGN</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">GRID LOCATION</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">BIO / STATEMENT</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-white text-black font-bold uppercase hover:bg-zinc-200"
                  >
                    SAVE PROFILE
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-5 space-y-4 font-mono">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-syne font-black text-2xl text-white">
                      {userProfile.fullName}
                    </h3>
                    <div className="text-xs text-purple-400">@{userProfile.callsign}</div>
                  </div>
                  <ChromeBadge label={userProfile.track} variant="holo" />
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {userProfile.bio}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-900 text-center">
                  <div className="p-2.5 bg-zinc-900/60 border border-zinc-800">
                    <div className="text-[9px] text-zinc-500">HOURS LOGGED</div>
                    <div className="text-base font-bold text-white mt-0.5">{userProfile.hoursContributed}h</div>
                  </div>
                  <div className="p-2.5 bg-zinc-900/60 border border-zinc-800">
                    <div className="text-[9px] text-zinc-500">MODULES</div>
                    <div className="text-base font-bold text-white mt-0.5">{userProfile.completedModules}</div>
                  </div>
                  <div className="p-2.5 bg-zinc-900/60 border border-zinc-800">
                    <div className="text-[9px] text-zinc-500">REPOSITORIES</div>
                    <div className="text-base font-bold text-white mt-0.5">{userProfile.projectsCount}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Skill Hex Mastery Matrix */}
          <SkillHexGrid skills={userProfile.skills} />
        </div>
      </div>

      {/* PORTFOLIO & REPOSITORIES SECTION */}
      <ProjectPortfolio
        projects={userProfile.projects}
        onAddProject={handleAddProject}
      />
    </div>
  );
};
