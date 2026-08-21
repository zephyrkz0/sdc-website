import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playCyberClick } from '../common/AudioEffects';

export const BlueprintManual: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      num: 1,
      title: 'OPERATIVE ONBOARDING & ID ASSIGNMENT',
      desc: 'Verify public key credentials, generate unique operative serial ID (e.g. SDC-OP-XXXX), and join track workgroups.',
      hardware: 'Personal Workstation + Auth Key',
      diagram: (
        <div className="flex justify-around items-center py-4 border border-zinc-800 bg-zinc-950 font-mono text-[10px] text-zinc-400">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-1 border border-dashed border-zinc-700 flex items-center justify-center text-white">
              KEY
            </div>
            <span>PUBLIC_KEY</span>
          </div>
          <span className="text-zinc-600">&rarr;</span>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-1 border border-white flex items-center justify-center font-bold text-white bg-zinc-900">
              ID
            </div>
            <span>MEMBER_PASS</span>
          </div>
        </div>
      ),
    },
    {
      num: 2,
      title: 'SELECT DOMAIN TRACK',
      desc: 'Select your primary discipline: Fullstack Systems, Neural AI, Cyber Ops, 3D Shaders, or Product Design.',
      hardware: 'Target IDE & Dev Toolchain',
      diagram: (
        <div className="grid grid-cols-5 gap-1.5 py-3 text-center font-mono text-[9px] border border-zinc-800 bg-zinc-950">
          <div className="p-1.5 border border-zinc-800 text-zinc-300">CODE</div>
          <div className="p-1.5 border border-zinc-800 text-zinc-300">AI/ML</div>
          <div className="p-1.5 border border-zinc-800 text-zinc-300">3D/GL</div>
          <div className="p-1.5 border border-zinc-800 text-zinc-300">CYBER</div>
          <div className="p-1.5 border border-zinc-800 text-zinc-300">DESIGN</div>
        </div>
      ),
    },
    {
      num: 3,
      title: 'ATTEND WEEKLY SPRINTS & WORKSHOPS',
      desc: 'Join weekly live coding sessions, pair programming sprints, and reverse engineering laboratories.',
      hardware: 'Standard Dev Environment',
      diagram: (
        <div className="flex items-center justify-between p-3 border border-zinc-800 bg-zinc-950 font-mono text-[10px] text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-zinc-200">LAB ROOM 402</span>
          </div>
          <span className="text-white font-bold">120 MIN SPRINT</span>
        </div>
      ),
    },
    {
      num: 4,
      title: 'DEPLOY OPEN-SOURCE PROJECTS',
      desc: 'Collaborate on real-world repositories, create verified portfolio releases, and earn peer-reviewed badges.',
      hardware: 'GitHub & Production Nodes',
      diagram: (
        <div className="p-3 border border-zinc-800 bg-zinc-950 font-mono text-[10px] text-zinc-400 flex justify-between items-center">
          <span className="text-zinc-300">COMMITS MERGED</span>
          <span className="px-2 py-0.5 bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold">
            +50 HRS BADGE
          </span>
        </div>
      ),
    },
    {
      num: 5,
      title: 'CLAIM EVENT & HACKATHON PASSES',
      desc: 'Mint holographic digital passes with scannable QR codes for upcoming summits, hackathons, and demo days.',
      hardware: 'PDF / Image Export',
      diagram: (
        <div className="p-3 border border-zinc-800 bg-zinc-950 font-mono text-[10px] text-zinc-400 flex justify-between items-center">
          <div className="w-16 h-4 barcode-strip opacity-60" />
          <span className="text-white font-bold">[READY FOR CHECK-IN]</span>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-zinc-950 border border-zinc-800 p-6 relative overflow-hidden tech-corner-box">
      {/* Manual Header */}
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800 font-mono text-xs">
        <div className="text-zinc-200 font-bold">
          CLUB ONBOARDING GUIDE
        </div>
        <div className="text-[10px] text-zinc-500">
          5 STEPS
        </div>
      </div>

      {/* Step Selector Ribbon (1 2 3 4 5) */}
      <div className="grid grid-cols-5 gap-2 my-5">
        {steps.map((s) => {
          const isActive = activeStep === s.num;
          return (
            <button
              key={s.num}
              onClick={() => {
                playCyberClick();
                setActiveStep(s.num);
              }}
              className={`p-2.5 font-mono text-center border transition-all duration-200 cursor-target ${
                isActive
                  ? 'bg-zinc-100 text-black border-white font-bold'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
              }`}
            >
              <div className="text-xs">STEP {s.num}</div>
            </button>
          );
        })}
      </div>

      {/* Active Step Content */}
      <AnimatePresence mode="wait">
        {steps
          .filter((s) => s.num === activeStep)
          .map((s) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 font-mono"
            >
              <h3 className="font-syne font-bold text-base text-white">
                {s.title}
              </h3>

              <p className="text-xs text-zinc-400 leading-relaxed">
                {s.desc}
              </p>

              {/* Exploded Schema Diagram */}
              {s.diagram}

              {/* Requirement footer */}
              <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-900 flex justify-between">
                <span>PREREQUISITE: {s.hardware}</span>
                <span className="text-zinc-400 font-bold">STEP {s.num} / 5</span>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
};
