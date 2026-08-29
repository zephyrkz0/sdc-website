import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Calendar,
  User,
  Ticket,
  Volume2,
  VolumeX,
  Menu,
  X,
  Sparkles,
  LogIn,
  LogOut,
  Image as ImageIcon,
} from 'lucide-react';
import { toggleAudio, isAudioEnabled, playCyberClick } from './AudioEffects';
import { useAuth } from '../../context/AuthContext';

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
  onOpenRSVP = () => {},
}) => {
  const { currentUser, logout, setAuthModalOpen } = useAuth();

  const [soundOn, setSoundOn] = useState(isAudioEnabled());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Smart Visibility: Hidden during initial landing hero reveal on Dashboard, visible otherwise
  useEffect(() => {
    if (activeTab === 'dashboard' && window.scrollY < window.innerHeight * 0.85) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [activeTab]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateNavbar = () => {
      const currentScrollY = window.scrollY;

      if (activeTab === 'dashboard' && currentScrollY < window.innerHeight * 0.85) {
        setIsVisible(false);
        setUserDropdownOpen(false);
        lastScrollY = currentScrollY;
        ticking = false;
        return;
      }

      if (currentScrollY < 120) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setIsVisible(false);
        setUserDropdownOpen(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const handleSoundToggle = () => {
    const next = toggleAudio();
    setSoundOn(next);
    if (next) playCyberClick();
  };

  const handleNavClick = (tab: NavTab) => {
    playCyberClick();
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
    { id: 'roster', label: 'Directory', icon: <Users size={14} /> },
    { id: 'schedule', label: 'Schedule', icon: <Calendar size={14} /> },
    { id: 'profile', label: 'Profile', icon: <User size={14} /> },
    { id: 'tickets', label: 'Passes', icon: <Ticket size={14} /> },
    { id: 'gallery', label: 'Gallery', icon: <ImageIcon size={14} /> },
  ];

  return (
    <motion.header
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: isVisible ? 0 : -90,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
      className="fixed top-0 left-0 right-0 z-50 w-full bg-[#08080a]/95 backdrop-blur-md border-b border-zinc-800 shadow-2xl font-mono"
    >
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <div
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 bg-zinc-900 border border-zinc-700 flex items-center justify-center relative overflow-hidden group-hover:border-white transition-colors">
            <span className="font-black text-lg text-white">✦</span>
          </div>
          <div>
            <span className="font-black text-base md:text-lg tracking-wider text-white">
              SDC
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-3.5 py-2 font-mono text-xs font-bold tracking-wider transition-all duration-200 flex items-center gap-1.5 group ${
                  isActive
                    ? 'text-white bg-zinc-900/90 border border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40 border border-transparent'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-white"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions (Sign In / User Profile Dropdown, Audio, RSVP) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Audio Toggle */}
          <button
            onClick={handleSoundToggle}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-zinc-800 hover:border-zinc-500 bg-zinc-900/60 text-zinc-400 hover:text-white transition-colors"
            title={soundOn ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          {/* Mint Pass / RSVP Button */}
          <button
            onClick={() => {
              playCyberClick();
              onOpenRSVP();
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-mono font-bold uppercase tracking-wider bg-white text-black border border-white hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            <Sparkles size={12} />
            <span>RSVP PASS</span>
          </button>

          {/* User Auth Section */}
          </button>

          {/* User Auth Section */}
          {currentUser ? (
            <div className="relative">
              const navTier = getRoleTier(currentUser);
              const navStyles = getRoleStyles(navTier);
              return (
                <div className="relative">
                  <button
                    onClick={() => {
                      playCyberClick();
                      setUserDropdownOpen(!userDropdownOpen);
                    }}
                    className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 transition-all ${
                      navTier === 'SUPER_ADMIN'
                        ? 'border-2 border-amber-400 bg-amber-950/40 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                        : navTier === 'ADMIN'
                        ? 'border-2 border-amber-500/80 bg-amber-950/30 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                        : 'border border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:border-zinc-500'
                    }`}
                  >
                    <div className={`w-6 h-6 overflow-hidden shrink-0 flex items-center justify-center ${navStyles.avatarBorderClass}`}>
                      {currentUser.avatarUrl ? (
                        <img
                          src={currentUser.avatarUrl}
                          alt={currentUser.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className={`font-syne font-black text-[10px] uppercase ${navStyles.textColor}`}>
                          {currentUser.firstName?.[0] || currentUser.username?.[0] || 'U'}
                        </span>
                      )}
                    <span className={`font-mono text-xs hidden md:inline font-bold ${navStyles.textColor}`}>
                      @{currentUser.username}
                    </span>
                  </button>
                      <span className={`font-mono text-xs hidden md:inline font-bold ${navStyles.textColor}`}>
                        @{currentUser.username}
                      </span>
                    </div>
                  </button>

                  {/* User Dropdown */}
                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => handleNavClick('profile')}
                        className="w-full text-left p-2 text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors flex items-center gap-2"
                      >
                        <User size={13} />
                        <span>My Profile</span>
                      </button>
                      >
                        <Ticket size={13} />
                        <span>My Passes</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-zinc-800">
                      <button
                        onClick={() => {
                            <span className={navStyles.badgeClass}>{navStyles.label}</span>
                          </div>
                          <div className={`text-[10px] truncate font-bold ${navStyles.textColor}`}>@{currentUser.username}</div>
                          <div className="text-[9px] text-zinc-500 truncate">{currentUser.email}</div>
                        </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => handleNavClick('profile')}
                        className="w-full text-left p-2 text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors flex items-center gap-2"
                      >
                        <User size={13} />
                        <span>My Profile</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('tickets')}
                        className="w-full text-left p-2 text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors flex items-center gap-2"
                      >
                        <Ticket size={13} />
                        <span>My Passes</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-zinc-800">
                      <button
                        onClick={() => {
                          playCyberClick();
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left p-2 text-red-400 hover:bg-red-950/30 transition-colors flex items-center gap-2"
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
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 border border-purple-500/60 text-purple-300 hover:text-white hover:border-purple-400 transition-all hover:scale-105 active:scale-95"
            >
              <LogIn size={13} />
              <span>SIGN IN</span>
              <LogIn size={13} />
              <span>SIGN IN</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => {
              playCyberClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-zinc-800 hover:border-zinc-500 bg-zinc-900 text-zinc-300"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-4 space-y-2 font-mono text-xs"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between p-3 border transition-all ${
                    isActive
                      ? 'bg-zinc-900 text-white border-white'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-bold">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
