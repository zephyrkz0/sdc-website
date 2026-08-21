import React from 'react';
import { NavTab } from './Navbar';

interface FooterProps {
  setActiveTab: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="w-full bg-[#050507] border-t border-zinc-800/80 pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-20 relative overflow-hidden">
      {/* Background blueprint grid */}
      <div className="absolute inset-0 bg-blueprint-grid opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        {/* Top Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-zinc-800">
          {/* Left Column: Brand & Manifesto */}
          <div className="lg:col-span-5 space-y-3 font-mono">
            <h3 className="text-2xl font-black font-syne text-white tracking-tight">
              SKILL DEVELOPMENT CLUB
            </h3>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              An autonomous collective of student engineers, designers, researchers, and builders developing production software, 3D graphics, AI systems, and security tools.
            </p>

            <div className="pt-2 text-[10px] text-zinc-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>ESTABLISHED 2023</span>
            </div>
          </div>

          {/* Center Column: Navigation */}
          <div className="lg:col-span-3 space-y-3 font-mono">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              NAVIGATION
            </h4>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="hover:text-white transition-colors cursor-target"
                >
                  01 // DASHBOARD
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('roster')}
                  className="hover:text-white transition-colors cursor-target"
                >
                  02 // DIRECTORY
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="hover:text-white transition-colors cursor-target"
                >
                  03 // SCHEDULE
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="hover:text-white transition-colors cursor-target"
                >
                  04 // PROFILE
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className="hover:text-white transition-colors cursor-target"
                >
                  05 // PASSES
                </button>
              </li>
            </ul>
          </div>

          {/* Right Column: ASCII Art Heart/Matrix (from moodboard) */}
          <div className="lg:col-span-4 bg-zinc-950 p-4 border border-zinc-800 font-mono text-[9px] text-zinc-500 leading-tight space-y-2 select-none overflow-x-auto">
            <div className="flex justify-between items-center text-zinc-400 pb-1 border-b border-zinc-900">
              <span>SKILL DEVELOPMENT CLUB</span>
              <span>2026</span>
            </div>
            <pre className="text-zinc-400 leading-[10px]">
{`   .:::.   .:::.      +-----------------------+
  :::::::.:::::::     | SDC DIGITAL MATRIX    |
  :::::::::::::::     | LAT: 37.7749 N        |
  ':::::::::::::'     | LNG: 122.4194 W       |
    ':::::::::'       | ACCESS: VERIFIED      |
      ':::::'         +-----------------------+
        ':'           `}
            </pre>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-zinc-500">
          <div className="flex items-center gap-3">
            <div className="w-20 h-2.5 barcode-strip opacity-40" />
            <span>SDC 2026</span>
          </div>

          <div className="text-zinc-500">
            ALL RIGHTS RESERVED
          </div>
        </div>
      </div>
    </footer>
  );
};
