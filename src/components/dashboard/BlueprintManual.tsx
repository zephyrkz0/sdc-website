import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Check, Shield, Cpu, BookOpen, Layers, Terminal } from 'lucide-react';
import { playCyberClick } from '../common/AudioEffects';

export const BlueprintManual: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      num: 1,
      title: 'OPERATIVE ONBOARDING & ID ASSIGNMENT',
      code: 'STEP_01 // IDENT_AUTH',
      desc: 'Verify public key, mint unique operative serial code (e.g. SDC-OP-XXXX), and join track workgroups.',
      hardware: 'Auth Key (Ed25519) + Workstation setup',
      boltQty: 'x1 KEY',
      diagram: (
        <div className="flex justify-around items-center py-4 border border-zinc-800 bg-zinc-950 font-mono text-[9px] text-zinc-400">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-1 border border-dashed border-zinc-600 flex items-center justify-center text-white">
              [KEY]
            </div>
            <span>PUBLIC_KEY</span>
          </div>
          <span className="text-zinc-600">&rarr;</span>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-1 border border-white flex items-center justify-center font-bold text-white bg-zinc-900">
              ID
            </div>
            <span>OP_SERIAL</span>
          </div>
        </div>
      ),
    },
    {
      num: 2,
      title: 'SELECT TRACK & CURRICULUM PREREQUISITES',
      code: 'STEP_02 // TRACK_SELECT',
      desc: 'Pick your primary domain track: Core Code, Neural AI, Cyber Ops, 3D Shaders, or Product Design.',
      hardware: 'Target IDE / Compiler / Toolchain',
      boltQty: 'x5 TRACKS',
      diagram: (
        <div className="grid grid-cols-5 gap-1 py-3 text-center font-mono text-[8px] border border-zinc-800 bg-zinc-950">
          <div className="p-1 border border-zinc-800 text-zinc-300">CODE</div>
          <div className="p-1 border border-zinc-800 text-zinc-300">AI/ML</div>
          <div className="p-1 border border-zinc-800 text-zinc-300">3D/GL</div>
          <div className="p-1 border border-zinc-800 text-zinc-300">CYBER</div>
          <div className="p-1 border border-zinc-800 text-zinc-300">DESIGN</div>
        </div>
      ),
    },
    {
      num: 3,
      title: 'ATTEND WEEKLY TIMETABLE SESSIONS',
      code: 'STEP_03 // ACTIVE_HOURS',
      desc: 'Join high-intensity live sessions, pair programming sprints, and reverse engineering workshops.',
      hardware: 'Dedicated GPU + Linux/macOS runtime',
      boltQty: 'x4 SESSIONS/WK',
      diagram: (
        <div className="flex items-center justify-between p-3 border border-zinc-800 bg-zinc-950 font-mono text-[9px] text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>SESSION_ROOM_402</span>
          </div>
          <span className="text-zinc-300 font-bold">120 MIN SPRINT</span>
        </div>
      ),
    },
    {
      num: 4,
      title: 'SHIP OPEN-SOURCE PROJECT DEPLOYMENT',
      code: 'STEP_04 // DEPLOY_SHIP',
      desc: 'Collaborate on real-world repositories, create verified portfolio releases, and earn cryptographic badges.',
      hardware: 'GitHub Repo + Production Node',
      boltQty: 'x1 PR MERGED',
      diagram: (
        <div className="p-3 border border-zinc-800 bg-zinc-950 font-mono text-[9px] text-zinc-400 flex justify-between items-center">
          <span>STATUS: COMMIT_MERGED</span>
          <span className="px-2 py-0.5 bg-zinc-800 text-zinc-200 border border-zinc-600 font-bold">
            +50 HRS BADGE
          </span>
        </div>
      ),
    },
    {
      num: 5,
      title: 'RSVP & CLAIM PHYSICAL EVENT PASS',
      code: 'STEP_05 // PASS_MINT',
      desc: 'Mint your holographic boarding ticket for club summits, hackathons, and demo day stages.',
      hardware: 'PDF / QR Ticket Scanner',
      boltQty: 'x1 PASS',
      diagram: (
        <div className="p-3 border border-zinc-800 bg-zinc-950 font-mono text-[9px] text-zinc-400 flex justify-between items-center">
          <div className="w-12 h-6 barcode-strip opacity-60" />
          <span className="text-white font-bold">[CHECK_IN_AUTH: READY]</span>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-zinc-950 border border-zinc-800 p-6 relative overflow-hidden tech-corner-box">
      {/* Top Manual Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-zinc-800 font-mono">
        <div>
          <div className="text-xs text-zinc-200 font-bold flex items-center gap-2">
            <span>PRE-ACTION COMPLETION MANUAL</span>
            <span className="px-1.5 py-0.2 text-[8px] bg-zinc-800 text-zinc-400 border border-zinc-700">
              MANUAL NO. 27
            </span>
          </div>
          <p className="text-[10px] text-zinc-500">
            This manual will guide operatives through core club initiation and workflow.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[9px] text-zinc-400">
          <span>BOLT_SPEC: M4x10</span>
          <span>//</span>
          <span>ACUBI_CORP</span>
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
              className={`p-2.5 font-mono text-center border transition-all duration-200 ${
                isActive
                  ? 'bg-zinc-100 text-black border-white font-bold scale-[1.02] shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
              }`}
            >
              <div className="text-xs">STEP {s.num}</div>
              <div className="text-[8px] opacity-70 hidden sm:block truncate mt-0.5">
                {s.boltQty}
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Active Step Content */}
      <AnimatePresence mode="wait">
        {steps
          .filter((s) => s.num === activeStep)
          .map((s) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-syne font-bold text-base text-white">
                  {s.title}
                </h3>
                <span className="font-mono text-[9px] px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 w-fit">
                  {s.code}
                </span>
              </div>

              <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                {s.desc}
              </p>

              {/* Exploded Schema Diagram */}
              {s.diagram}

              {/* Hardware / Prereq Box */}
              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 pt-2 border-t border-zinc-900">
                <span>REQUIRED: {s.hardware}</span>
                <span>PART_QTY: {s.boltQty}</span>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
};
