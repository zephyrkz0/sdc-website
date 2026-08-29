import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Users,
  Calendar,
  User,
  Ticket,
  QrCode,
  Volume2,
  VolumeX,
  LogIn,
  LogOut,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { playCyberClick, isAudioMuted, toggleGlobalAudio } from './AudioEffects';
import { getRoleTier, getRoleStyles } from '../../utils/roleUtils';

export type NavTab = 'dashboard' | 'roster' | 'schedule' | 'profile' | 'tickets' | 'gallery';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenScanner?: () => void;
  onOpenRSVP?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenScanner,
  onOpenRSVP,
}) => {
  const { currentUser, logout, setAuthModalOpen, isAdmin } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [muted, setMuted] = useState(isAudioMuted());
  const [navVisible, setNavVisible] = useState(activeTab !== 'dashboard');

  useEffect(() => {
    // If on other tabs (directory, schedule, profile, etc.), always visible
    if (activeTab !== 'dashboard') {
      setNavVisible(true);
      return;
    }

    const handleScroll = () => {
      // In dashboard: GIF stays fullscreen for a while.
      // Show navbar only after user has scrolled past the full zoom stage (~2.6 viewports).
      const threshold = window.innerHeight * 2.6;
      setNavVisible(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const handleToggleAudio = () => {
    const isNowMuted = toggleGlobalAudio();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      playCyberClick();
    }
  };

  const handleNavClick = (tab: NavTab) => {
    playCyberClick();
    setActiveTab(tab);
    setMobileMenuOpen(false);
    // Scroll back to top when changing tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navTier = currentUser ? getRoleTier(currentUser) : 'MEMBER';
  const navStyles = getRoleStyles(navTier);

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'roster', label: 'Directory' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'profile', label: 'Profile' },
    { id: 'tickets', label: 'Passes' },
    { id: 'gallery', label: 'Gallery' },
  ];

  return (
    <motion.header
      initial={false}
      animate={{
        opacity: navVisible ? 1 : 0,
        y: navVisible ? 0 : -30,
      }}
      style={{
        pointerEvents: navVisible ? 'auto' : 'none',
      }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="sticky top-0 z-50 bg-[#08080c]/90 backdrop-blur-md border-b border-zinc-800/80 font-mono select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo: ✦ SDC (Matching Frames) */}
        <div
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-black border border-zinc-700 flex items-center justify-center text-white font-black font-syne text-sm group-hover:border-white transition-colors">
            ✦
          </div>
          <span className="font-syne font-black text-base tracking-wider text-white">
            SDC
          </span>
        </div>

        {/* Center Navigation Links with Active Underline (Matching Frames) */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Audio Toggle, RSVP PASS button & @zephyrkz0 badge */}
        <div className="flex items-center gap-3">
          {/* Audio Speaker Toggle */}
          <button
            onClick={handleToggleAudio}
            className="w-9 h-9 flex items-center justify-center border border-zinc-800 hover:border-zinc-500 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            title={muted ? 'Enable Sound FX' : 'Mute Sound FX'}
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* RSVP PASS Button (Frame 5) */}
          <button
            onClick={() => {
              playCyberClick();
              if (onOpenRSVP) onOpenRSVP();
            }}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-white text-black font-bold uppercase text-xs tracking-wider hover:bg-zinc-200 transition-all shadow-[0_0_12px_rgba(255,255,255,0.2)]"
          >
            <Sparkles size={13} />
            <span>RSVP PASS</span>
          </button>

          {/* User Account / Profile Badge */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  playCyberClick();
                  setUserDropdownOpen(!userDropdownOpen);
                }}
                className={`px-3 py-1.5 text-xs font-bold font-mono transition-all flex items-center gap-2 ${
                  navTier === 'SUPER_ADMIN'
                    ? 'bg-[#140f06] border-2 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                    : 'bg-zinc-900 border border-zinc-700 text-zinc-200'
                }`}
              >
                <span>@{currentUser.username || 'zephyrkz0'}</span>
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-48 bg-[#0c0c14] border border-zinc-800 p-2 shadow-2xl z-50 text-xs font-mono divide-y divide-zinc-800"
                  >
                    <div className="p-2 space-y-1">
                      <div className="font-bold text-white truncate">{currentUser.fullName || currentUser.username}</div>
                      <div className="text-[10px] text-amber-400 font-bold">{currentUser.role || 'Super Admin'}</div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleNavClick('profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left p-2 text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center gap-2"
                      >
                        <User size={13} />
                        <span>Profile Pass</span>
                      </button>
                      <button
                        onClick={() => {
                          handleNavClick('tickets');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left p-2 text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center gap-2"
                      >
                        <Ticket size={13} />
                        <span>My Passes</span>
                      </button>
                    </div>
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          playCyberClick();
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left p-2 text-red-400 hover:bg-red-950/40 flex items-center gap-2"
                      >
                        <LogOut size={13} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => {
                playCyberClick();
                setAuthModalOpen(true);
              }}
              className="px-4 py-2 bg-purple-950 border border-purple-600 text-purple-200 font-bold text-xs uppercase hover:bg-purple-900"
            >
              SIGN IN
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => {
              playCyberClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="lg:hidden w-9 h-9 flex items-center justify-center border border-zinc-800 bg-zinc-900 text-zinc-300"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0a0a0f] border-b border-zinc-800 px-4 py-4 space-y-2"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left p-3 text-xs font-bold uppercase transition-all ${
                  activeTab === item.id
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
export default Navbar;
