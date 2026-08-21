import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Terminal, Shield, Calendar, Users, Cpu, QrCode, Activity, Flame } from 'lucide-react';
import { GlobalClubStats, TerminalLog, ClubEvent } from '../../types';
import { StatCounter } from './StatCounter';
import { DomainRadar } from './DomainRadar';
import { BlueprintManual } from './BlueprintManual';
import { GlbModelViewer } from '../3d/GlbModelViewer';
import { LandingHeroStage } from '../landing/LandingHeroStage';
import { BlueprintHeader } from '../common/BlueprintHeader';
import { ChromeBadge } from '../common/ChromeBadge';
import { playCyberClick } from '../common/AudioEffects';
import { NavTab } from '../common/Navbar';

interface GlobalDashboardProps {
  stats: GlobalClubStats;
  logs: TerminalLog[];
  featuredEvent: ClubEvent;
  setActiveTab: (tab: NavTab) => void;
  onOpenRSVP: (event?: ClubEvent) => void;
  onOpenScanner: () => void;
}

export const GlobalDashboard: React.FC<GlobalDashboardProps> = ({
  stats,
  logs,
  featuredEvent,
  setActiveTab,
  onOpenRSVP,
  onOpenScanner,
}) => {
  const handleEnterPlatform = () => {
    const modelSection = document.getElementById('sdc-model-section');
    if (modelSection) {
      modelSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full relative">
      {/* 1. INITIAL FULLSCREEN PIXELATED ASCII GIF LANDING STAGE */}
      <LandingHeroStage onEnter={handleEnterPlatform} />

      {/* 2. REVEALED ON SCROLL: 3D GLB MODEL & REST OF PLATFORM */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10 pb-12">
        {/* 3D GLB Model Section */}
        <section id="sdc-model-section" className="relative pt-8 pb-12 overflow-hidden scroll-mt-20">
          {/* Background Grids & Scanlines */}
          <div className="absolute inset-0 bg-blueprint-grid opacity-20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Column: Editorial Headline & Manifesto */}
            <div className="lg:col-span-7 space-y-6">
              {/* Top Tag Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <ChromeBadge label="SKILL_DEVELOPMENT_CLUB" variant="silver" size="sm" />
                <ChromeBadge label="AUTONOMOUS_MATRIX // 2026" variant="dark" size="sm" />
                <span className="font-mono text-[10px] text-zinc-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  ONLINE
                </span>
              </div>

              {/* Massive Acubi Typography */}
              <div className="space-y-2">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl sm:text-6xl lg:text-7xl font-black font-syne tracking-tighter text-white uppercase leading-[0.95]"
                >
                  ARCHITECT <br />
                  <span className="chrome-text">YOUR DIGITAL</span> <br />
                  FRONTIER.
                </motion.h2>
              </div>

              <p className="font-mono text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
                SDC is the centralized operational platform for aggregate skill tracking, high-velocity engineering workshops, verified operative rosters, and holographic event ticketing.
              </p>

              {/* Quick Action Trigger Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    playCyberClick();
                    onOpenRSVP(featuredEvent);
                  }}
                  className="flex items-center gap-2 px-5 py-3 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider border border-white hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.25)] cursor-target"
                >
                  <Sparkles size={14} />
                  <span>CLAIM EVENT PASS // RSVP</span>
                </button>

                <button
                  onClick={() => {
                    playCyberClick();
                    setActiveTab('schedule');
                  }}
                  className="flex items-center gap-2 px-5 py-3 bg-zinc-900 text-zinc-200 font-mono text-xs uppercase tracking-wider border border-zinc-700 hover:border-zinc-500 hover:text-white transition-all cursor-target"
                >
                  <Calendar size={14} />
                  <span>VIEW ITINERARY</span>
                </button>

                <button
                  onClick={() => {
                    playCyberClick();
                    setActiveTab('roster');
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-transparent text-zinc-400 font-mono text-xs uppercase tracking-wider hover:text-white transition-colors cursor-target"
                >
                  <Users size={14} />
                  <span>ROSTER (342) &gt;</span>
                </button>
              </div>

              {/* Technical Coordinate Banner */}
              <div className="pt-4 flex items-center gap-4 text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Flame size={12} className="text-amber-400" />
                  ACTIVE_SPRINT: WEEK_34
                </span>
                <span>//</span>
                <span>TOTAL_UPLINK: 1,280 OPERATIVES</span>
              </div>
            </div>

            {/* Right Column: Interactive 3D GLB Model Viewer */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md h-80 sm:h-96 relative bg-zinc-950/80 border border-zinc-800 p-2 overflow-hidden tech-corner-box">
                <GlbModelViewer
                  modelUrl="/assets/model.glb"
                  interactive={true}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* MODULE 1.1: AGGREGATE CLUB TELEMETRY & IMPACT COUNTERS */}
        <section>
          <BlueprintHeader
            stepNumber="01"
            tag="TELEMETRY_AGGREGATE"
            title="GLOBAL CLUB IMPACT & METRICS"
            subtitle="Real-time synchronized data points aggregating club achievements, executed skill-building hours, and personnel upskilled."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCounter
              figNum="1.1"
              label="SESSIONS LOGGED"
              value={stats.totalSessionsLogged}
              suffix="+"
              detail="Hands-on coding, design sprints & war-games"
              changeRate="+18% MOM"
            />
            <StatCounter
              figNum="1.2"
              label="SKILL HOURS EXECUTED"
              value={stats.totalHoursExecuted}
              suffix=" HRS"
              detail="Aggregated peer-reviewed training time"
              changeRate="+24% MOM"
            />
            <StatCounter
              figNum="1.3"
              label="MEMBERS UPSKILLED"
              value={stats.totalUpskilledMembers}
              suffix="+"
              detail="Certified operatives across 5 domains"
              changeRate="+120 NEW"
            />
            <StatCounter
              figNum="1.4"
              label="PRODUCTION DEPLOYMENTS"
              value={stats.productionDeployments}
              suffix=" REPOS"
              detail="Open-source packages & apps shipped"
              changeRate="89 SHIPPED"
            />
          </div>
        </section>

        {/* MODULE 1.2: DOMAIN RADAR & PRE-ACTION ASSEMBLY MANUAL */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Domain Skill Distribution */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-syne font-bold text-xl text-white uppercase flex items-center gap-2">
                <span className="text-zinc-500">//</span> DOMAIN DISTRIBUTION
              </h3>
              <span className="font-mono text-[10px] text-zinc-400">SPEC_RADAR</span>
            </div>
            <DomainRadar stats={stats} />
          </div>

          {/* Right: Acubi Assembly Manual Widget */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-syne font-bold text-xl text-white uppercase flex items-center gap-2">
                <span className="text-zinc-500">//</span> ONBOARDING MANUAL
              </h3>
              <span className="font-mono text-[10px] text-zinc-400">ACUBI_GUIDE</span>
            </div>
            <BlueprintManual />
          </div>
        </section>

        {/* MODULE 1.3: FEATURED EVENT SPOTLIGHT (INSTANT RSVP TRIGGER) */}
        <section className="relative overflow-hidden bg-zinc-950 border border-zinc-800 p-6 sm:p-8 tech-corner-box">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <ChromeBadge label="UPCOMING_FLAGSHIP" variant="silver" />
                <ChromeBadge label={featuredEvent.date} variant="dark" />
                <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  RSVP OPEN ({featuredEvent.capacity - featuredEvent.rsvpCount} SEATS LEFT)
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black font-syne text-white tracking-tight">
                {featuredEvent.title}
              </h2>

              <p className="font-mono text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {featuredEvent.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
                <span className="text-zinc-300">LOC: {featuredEvent.location}</span>
                <span>//</span>
                <span className="text-zinc-300">TIME: {featuredEvent.time}</span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <button
                onClick={() => {
                  playCyberClick();
                  onOpenRSVP(featuredEvent);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-white via-zinc-200 to-white text-black font-mono font-bold text-xs uppercase tracking-wider border border-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 cursor-target"
              >
                <QrCode size={16} />
                <span>GENERATE PASS // RSVP</span>
              </button>

              <button
                onClick={() => {
                  playCyberClick();
                  setActiveTab('schedule');
                }}
                className="w-full py-2.5 bg-zinc-900 text-zinc-300 font-mono text-xs uppercase tracking-wider border border-zinc-700 hover:border-zinc-500 hover:text-white transition-colors text-center cursor-target"
              >
                VIEW FULL SCHEDULE
              </button>
            </div>
          </div>
        </section>

        {/* MODULE 1.4: REAL-TIME CLUB OPERATIONS TERMINAL LOGS */}
        <section className="bg-zinc-950 border border-zinc-800 p-6 tech-corner-box">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 font-mono text-[10px] text-zinc-400 mb-4">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-emerald-400" />
              <span className="font-bold text-zinc-200">SDC_OPERATIONAL_LOG // LIVE_FEED</span>
            </div>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              AUTO_STREAM_ACTIVE
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs max-h-48 overflow-y-auto pr-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-2 bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 transition-colors"
              >
                <span className="text-zinc-500 text-[10px] select-none">[{log.timestamp}]</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 border uppercase font-bold select-none ${
                    log.category === 'SYS'
                      ? 'border-blue-500/40 text-blue-400 bg-blue-950/20'
                      : log.category === 'SKILL'
                      ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20'
                      : log.category === 'EVENT'
                      ? 'border-purple-500/40 text-purple-400 bg-purple-950/20'
                      : log.category === 'ALERT'
                      ? 'border-red-500/40 text-red-400 bg-red-950/20'
                      : 'border-zinc-700 text-zinc-400 bg-zinc-900'
                  }`}
                >
                  {log.category}
                </span>
                <span className="text-zinc-300 flex-1 text-[11px]">{log.message}</span>
                <span className="text-zinc-500 text-[10px] hidden sm:inline">@{log.author}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
