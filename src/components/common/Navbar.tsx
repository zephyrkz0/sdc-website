import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, QrCode, Menu, X, Terminal, Sparkles, User, Calendar, Users, LayoutDashboard, Ticket } from 'lucide-react';
import { toggleAudio, isAudioEnabled, playCyberClick } from './AudioEffects';

export type NavTab = 'dashboard' | 'roster' | 'schedule' | 'profile' | 'tickets';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenScanner: () => void;
  onOpenRSVP: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenScanner,
  onOpenRSVP,
}) => {
  const [soundOn, setSoundOn] = useState(true);
  const [timeStr, setTimeStr] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setSoundOn(isAudioEnabled());
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSoundToggle = () => {
    const newState = toggleAudio();
    setSoundOn(newState);
    if (newState) playCyberClick();
  };

  const navItems: { id: NavTab; label: string; num: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'DASHBOARD', num: '01', icon: <LayoutDashboard size={14} /> },
    { id: 'roster', label: 'DIRECTORY', num: '02', icon: <Users size={14} /> },
    { id: 'schedule', label: 'SCHEDULE', num: '03', icon: <Calendar size={14} /> },
    { id: 'profile', label: 'PROFILE', num: '04', icon: <User size={14} /> },
    { id: 'tickets', label: 'PASSES', num: '05', icon: <Ticket size={14} /> },
  ];

  const handleNavClick = (tab: NavTab) => {
    playCyberClick();
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#08080a]/90 backdrop-blur-md border-b border-zinc-800/80">
      {/* Top Minimal Status Strip */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1 bg-zinc-950 border-b border-zinc-900 font-mono text-[10px] text-zinc-500 overflow-hidden select-none">
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>SKILL DEVELOPMENT CLUB</span>
        </div>

        <div className="flex items-center gap-4 text-zinc-500">
          <span className="text-zinc-400">{timeStr} UTC</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <div
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 bg-zinc-900 border border-zinc-700 flex items-center justify-center relative overflow-hidden group-hover:border-white transition-colors">
            <span className="font-syne font-black text-lg text-white">✦</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-syne font-black text-base md:text-lg tracking-wider text-white">
                SDC
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                PORTAL
              </span>
            </div>
            <p className="font-mono text-[9px] text-zinc-500 tracking-tighter uppercase hidden sm:block">
              Skill Development Club // Hub
            </p>
          </div>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-950/80 p-1 border border-zinc-800">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-3.5 py-1.5 flex items-center gap-2 font-mono text-xs tracking-wider uppercase transition-all duration-200 ${
                  isActive
                    ? 'bg-zinc-200 text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <span className="text-[10px] opacity-60">[{item.num}]</span>
                <span className="flex items-center gap-1.5">
                  {item.icon}
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-black" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            className="p-2 border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title={soundOn ? 'Audio FX Enabled (Click to Mute)' : 'Audio FX Muted'}
          >
            {soundOn ? <Volume2 size={16} className="text-emerald-400" /> : <VolumeX size={16} />}
          </button>

          {/* Scanner Simulator Trigger */}
          <button
            onClick={() => {
              playCyberClick();
              onOpenScanner();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-white font-mono text-xs transition-colors"
            title="Open Pass Check-in Scanner"
          >
            <QrCode size={14} className="text-purple-400" />
            <span>SCAN_PASS</span>
          </button>

          {/* Instant RSVP CTA */}
          <button
            onClick={() => {
              playCyberClick();
              onOpenRSVP();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-100 text-black font-mono font-bold text-xs tracking-wider uppercase border border-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            <Sparkles size={13} />
            <span>RSVP // PASS</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 border border-zinc-800 bg-zinc-900 text-zinc-300"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-[#0c0c0e] px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-wider border ${
                  isActive
                    ? 'bg-zinc-200 text-black font-bold border-white'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>[{item.num}]</span>
                  <span>{item.label}</span>
                </div>
                {item.icon}
              </button>
            );
          })}

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenScanner();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-purple-500/40 bg-purple-950/20 text-purple-300 font-mono text-xs"
            >
              <QrCode size={14} />
              <span>SCANNER SIMULATOR</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
