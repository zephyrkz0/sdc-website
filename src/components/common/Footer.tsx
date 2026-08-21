import React from 'react';
import { Terminal, Shield, ArrowUpRight, Cpu } from 'lucide-react';
import { NavTab } from './Navbar';

interface FooterProps {
  setActiveTab: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="w-full bg-[#050507] border-t border-zinc-800/80 pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-20 relative overflow-hidden">
      {/* Background blueprint grid */}
      <div className="absolute inset-0 bg-blueprint-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        {/* Top Grid: Editorial Manifesto & ASCII Heart/Diagram */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-zinc-800">
          {/* Left Column: Brand & Manifesto */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black font-syne text-white tracking-tighter">
                SKILL DEVELOPMENT CLUB
              </span>
              <span className="px-2 py-0.5 font-mono text-[9px] bg-zinc-900 border border-zinc-700 text-zinc-400">
                ALPHA_v2.6
              </span>
            </div>
            
            <p className="font-mono text-xs text-zinc-400 leading-relaxed">
              SDC is an autonomous collective of engineers, researchers, visual designers, and offensive security operatives. We push technological frontiers through relentless peer-to-peer execution, open source architectures, and subversive digital aesthetics.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2 py-1 font-mono text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-800">
                [GRID: ALPHA_ZONE]
              </span>
              <span className="px-2 py-1 font-mono text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-800">
                [SECURITY: 4096_RSA]
              </span>
              <span className="px-2 py-1 font-mono text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-800">
                [CADENCE: WEEKLY_SPRINT]
              </span>
            </div>
          </div>

          {/* Center Column: Quick Navigation Matrix */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-zinc-500">//</span> MODULE_DIRECTORY
            </h4>
            <ul className="space-y-1.5 font-mono text-xs text-zinc-400">
              <li>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="hover:text-white flex items-center gap-1.5 transition-colors group"
                >
                  <span className="text-zinc-600 group-hover:text-zinc-400">&gt;</span> 01_GLOBAL_DASHBOARD
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('roster')}
                  className="hover:text-white flex items-center gap-1.5 transition-colors group"
                >
                  <span className="text-zinc-600 group-hover:text-zinc-400">&gt;</span> 02_MEMBER_ROSTER
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="hover:text-white flex items-center gap-1.5 transition-colors group"
                >
                  <span className="text-zinc-600 group-hover:text-zinc-400">&gt;</span> 03_TIMETABLE_ITINERARY
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="hover:text-white flex items-center gap-1.5 transition-colors group"
                >
                  <span className="text-zinc-600 group-hover:text-zinc-400">&gt;</span> 04_OPERATIVE_IDENTITY
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className="hover:text-white flex items-center gap-1.5 transition-colors group"
                >
                  <span className="text-zinc-600 group-hover:text-zinc-400">&gt;</span> 05_EVENT_TICKETING_PASS
                </button>
              </li>
            </ul>
          </div>

          {/* Right Column: ASCII Art Manual Schematic (Inspired by Moodboard) */}
          <div className="lg:col-span-4 bg-zinc-950 p-4 border border-zinc-800 font-mono text-[9px] text-zinc-500 leading-tight space-y-2 select-none overflow-x-auto">
            <div className="flex justify-between items-center text-zinc-400 pb-1 border-b border-zinc-900">
              <span>MANUAL // FIG 0.8: CORE SYNAPSE</span>
              <span>[VALIDATED]</span>
            </div>
            <pre className="text-zinc-400 leading-[10px]">
{`   .:::.   .:::.      +-----------------------+
  :::::::.:::::::     | SDC OPERATIVE MATRIX  |
  :::::::::::::::     | LAT: 37.7749 N        |
  ':::::::::::::'     | LNG: 122.4194 W       |
    ':::::::::'       | PROTOCOL: 09-POPUP    |
      ':::::'         | CERT: SHA-256 VALID   |
        ':'           +-----------------------+`}
            </pre>
            <div className="pt-2 text-zinc-500 flex justify-between items-center text-[8px]">
              <span>PRE-ACTION COMPLETION MANUAL</span>
              <span>TYPE: ACUBI_V2</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Barcode, Coordinates & Legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-zinc-500">
          <div className="flex items-center gap-4">
            <div className="w-24 h-3 barcode-strip opacity-40" />
            <span>SDC-ID-9082-2026 // ALL RIGHTS RESERVED</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <span>TERMINAL_ACTIVE</span>
            <span>✦</span>
            <span>SYSTEM_CLEAR_OK</span>
            <span>✦</span>
            <span className="text-zinc-300">EST. 2023 // GLOBAL_NODE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
