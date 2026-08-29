import React, { useState } from 'react';
import { PhysicalTicketPass, ClubEvent } from '../../types';
import { PhysicalPass } from './PhysicalPass';
import { BlueprintHeader } from '../common/BlueprintHeader';
import { ChromeBadge } from '../common/ChromeBadge';
import { exportPassToPDF, exportPassToPNG } from './PassExporter';
import { PAST_TICKETS_ARCHIVE } from '../../data/mockData';
import {
  QrCode,
  Download,
  Plus,
  Sparkles,
  CheckCircle2,
  Ticket,
  History,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';

interface TicketManagementViewProps {
  tickets: PhysicalTicketPass[];
  pastTickets?: PhysicalTicketPass[];
  events: ClubEvent[];
  onOpenRSVP: (event?: ClubEvent) => void;
  onOpenScanner: () => void;
}

export const TicketManagementView: React.FC<TicketManagementViewProps> = ({
  tickets,
  pastTickets = PAST_TICKETS_ARCHIVE,
  onOpenRSVP,
  onOpenScanner,
}) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PAST'>('ACTIVE');

  const handleExportPDF = async (ticket: PhysicalTicketPass, idx: number) => {
    playCyberClick();
    try {
      await exportPassToPDF(`pass-card-item-${idx}`, ticket);
      playSuccessChime();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportPNG = async (ticket: PhysicalTicketPass, idx: number) => {
    playCyberClick();
    try {
      await exportPassToPNG(`pass-card-item-${idx}`, ticket);
      playSuccessChime();
    } catch (err) {
      console.error(err);
    }
  };

  const displayedTickets = activeTab === 'ACTIVE' ? tickets : pastTickets;

  return (
    <div className="space-y-16">
      {/* SECTION HEADER */}
      <BlueprintHeader
        title="EVENT TICKETING & PASSES"
        subtitle="Digital pass generation with scannable QR verification and local PDF export."
      />

      {/* TOP ACTION MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-zinc-950 border border-zinc-800 p-6 tech-corner-box">
        <div className="md:col-span-8 space-y-2 font-mono">
          <h3 className="font-syne font-black text-2xl text-white uppercase">
            SDC EVENT PASSES
          </h3>
          <p className="text-xs text-zinc-400">
            View your event passes with unique QR check-in codes for SDC workshops, lab sessions, and hackathons.
          <p className="text-xs text-zinc-400">
            View your event passes with unique QR check-in codes for SDC workshops, lab sessions, and hackathons.
          </p>
        </div>

        <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3">
          <button
            onClick={() => {
              playCyberClick();
              onOpenScanner();
            }}
            className="w-full py-2.5 bg-zinc-900 border border-purple-500/40 text-purple-300 font-mono text-xs uppercase tracking-wider hover:border-purple-400 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <QrCode size={14} />
            <span>LAUNCH SCANNER</span>
          </button>
        </div>
      </div>

      {/* TICKET PASSES SHOWCASE */}
      <section className="space-y-8">
            <button
              onClick={() => {
                playCyberClick();
                setActiveTab('ACTIVE');
              }}
              className={`px-4 py-1.5 uppercase font-bold border transition-all flex items-center gap-2 ${
                activeTab === 'ACTIVE'
                  ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              <Ticket size={13} className={activeTab === 'ACTIVE' ? 'text-black' : 'text-purple-400'} />
              <span>ACTIVE PASSES ({tickets.length})</span>
            </button>
