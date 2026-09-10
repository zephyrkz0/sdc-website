import React, { useState } from 'react';
import { ProjectPortfolioItem, DomainTrack } from '../../types';
import { Plus, ExternalLink, Terminal, Sparkles, X } from 'lucide-react';
import { GithubIcon } from '../common/Icons';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';
import confetti from 'canvas-confetti';

interface ProjectPortfolioProps {
  projects: ProjectPortfolioItem[];
  onAddProject: (project: ProjectPortfolioItem) => void;
}

export const ProjectPortfolio: React.FC<ProjectPortfolioProps> = ({
  projects,
  onAddProject,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DomainTrack>('CORE_CODE');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    playCyberClick();
    const newProj: ProjectPortfolioItem = {
      id: `proj-${Date.now()}`,
      title: title.toUpperCase(),
      category,
      description,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      repoUrl: repoUrl || undefined,
      demoUrl: demoUrl || undefined,
      year: new Date().getFullYear().toString(),
      stars: 1,
    };

    onAddProject(newProj);
    playSuccessChime();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });

    // Reset form
    setTitle('');
    setDescription('');
    setTagsInput('');
    setRepoUrl('');
    setDemoUrl('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="font-mono text-[10px] text-zinc-500">PROJECT DIRECTORY</div>
          <h3 className="font-syne font-black text-2xl text-white uppercase tracking-tight">
            MEMBER PROJECTS & PORTFOLIO
          </h3>
        </div>

        <button
          onClick={() => {
            playCyberClick();
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider border border-white hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
          <Plus size={14} />
          <span>SUBMIT PROJECT</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-5 bg-zinc-950 border border-zinc-800 hover:border-zinc-500 transition-all space-y-3 font-mono tech-corner-box group"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[9px] px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-purple-300 font-bold">
                {proj.category}
              </span>
              <span className="text-[9px] text-zinc-500">{proj.year}</span>
            </div>

            <h4 className="font-syne font-bold text-base text-white group-hover:text-zinc-200 transition-colors">
              {proj.title}
            </h4>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {proj.description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-900">
              <div className="flex flex-wrap gap-1">
                {proj.tags.map((t) => (
                  <span
                    key={t}
                    className="px-1.5 py-0.5 text-[8px] bg-zinc-900 border border-zinc-800 text-zinc-400"
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
                    className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white"
                  >
                    <GithubIcon size={12} />
                    <span>REPO</span>
                  </a>
                )}
                {proj.demoUrl && (
                  <a
                    href={proj.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                  >
                    <ExternalLink size={12} />
                    <span>DEMO</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-700 p-6 z-10 tech-corner-box shadow-2xl font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs text-zinc-400">
              <span className="text-white font-bold uppercase tracking-wider">ADD NEW PROJECT</span>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-zinc-500 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">PROJECT TITLE</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">DOMAIN CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DomainTrack)}
                  className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white focus:outline-none"
                >
                  <option value="CORE_CODE">Web Development (Fullstack)</option>
                  <option value="GENERATIVE_AI">AI & Machine Learning</option>
                  <option value="CYBER_SECURITY">Cyber Security & Systems</option>
                  <option value="CREATIVE_3D">3D Graphics & Game Dev</option>
                  <option value="PRODUCT_DESIGN">UI/UX & Product Design</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">DESCRIPTION</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">TAGS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">GITHUB URL</label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">DEMO URL</label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black font-bold uppercase hover:bg-zinc-200"
                >
                  DEPLOY TO PORTFOLIO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
