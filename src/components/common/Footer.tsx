import React from 'react';
import { NavTab } from './Navbar';
import { playCyberClick } from './AudioEffects';

interface FooterProps {
  setActiveTab: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const navLinks: { id: NavTab; num: string; label: string }[] = [
    { id: 'dashboard', num: '01', label: 'Dashboard' },
    { id: 'roster', num: '02', label: 'Directory' },
    { id: 'schedule', num: '03', label: 'Schedule' },
    { id: 'profile', num: '04', label: 'Profile' },
    { id: 'tickets', num: '05', label: 'Passes' },
    { id: 'gallery', num: '06', label: 'Gallery' },
  ];

  return (
    <footer className="border-t border-zinc-800 bg-[#06060a] text-zinc-400 font-mono text-xs relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Left Column: Mission */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="font-syne font-black text-xl text-white tracking-tight">
              SKILL DEVELOPMENT CLUB
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              An active student technical community at CUCEK focused on upskilling, mentoring, daily hands-on coding sessions, talk sessions, and hackathons to prepare students for real-world careers.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[10px]">
              <span className="text-zinc-300 font-bold">ESTABLISHED 2025</span>
            </div>
          </div>

          {/* Center Column: Navigation */}
          <div className="md:col-span-3 space-y-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              NAVIGATION
            </div>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => {
                      playCyberClick();
                      setActiveTab(link.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors flex items-center gap-2 text-xs"
                  >
                    <span className="text-zinc-600 text-[10px]">{link.num}</span>
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: ASCII Love Badge */}
          <div className="md:col-span-4 bg-[#09090f] border border-zinc-800/80 p-4 font-mono text-[10px] text-zinc-400 space-y-2 select-none shadow-inner">
            <div className="flex items-center justify-between text-zinc-300 border-b border-zinc-800/80 pb-2">
              <span>SKILL DEVELOPMENT CLUB</span>
              <span>2026</span>
            </div>
            <pre className="text-[9px] leading-tight text-zinc-400 font-mono overflow-x-auto py-1">
{` . ::: .    . ::: .   +-----------------------------+
:::::::::::::::::::::  | MADE FOR SDC WITH LOVE      |
:::::::::::::::::::::  | BY SDC MEMBERS              |
 ':::::::::::::::::'   | CUCEK CAMPUS                |
   ':::::::::::::'     | COMMUNITY • UPSKILLING • WORK|
     ':::::::::'       +-----------------------------+
       ':::::'
         ':'`}
            </pre>
          </div>
        </div>

        {/* Bottom Sub-strip */}
        <div className="mt-12 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-zinc-600">
          <span className="tracking-widest">|||||||||||||| SDC CUCEK • 2026</span>
          <span>SKILL DEVELOPMENT CLUB • ALL RIGHTS RESERVED</span>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
