import React from 'react';
import { PhysicalTicketPass, ClubEvent } from '../../types';
import { PhysicalPass } from './PhysicalPass';
import { BlueprintHeader } from '../common/BlueprintHeader';
import { ChromeBadge } from '../common/ChromeBadge';
import { exportPassToPDF, exportPassToPNG } from './PassExporter';
import { QrCode, Download, Plus, Sparkles, CheckCircle2, Ticket } from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';

interface TicketManagementViewProps {
  tickets: PhysicalTicketPass[];
  events: ClubEvent[];
  onOpenRSVP: (event?: ClubEvent) => void;
  onOpenScanner: () => void;
}

export const TicketManagementView: React.FC<TicketManagementViewProps> = ({
  tickets,
  events,
  onOpenRSVP,
  onOpenScanner,
}) => {
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

  return (
    <div className="space-y-16">
      {/* SECTION HEADER */}
      <BlueprintHeader
        stepNumber="05"
        tag="PASSES"
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
            Generate your personalized physical ticket pass with unique QR check-in codes for club summits and workshops.
          </p>
        </div>

        <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3">
          <button
            onClick={() => {
              playCyberClick();
              onOpenRSVP();
            }}
            className="w-full py-3 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider border border-white hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
          >
            <Sparkles size={14} />
            <span>MINT NEW PASS</span>
          </button>

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

      {/* MINTED PASSES SHOWCASE */}
      <section className="space-y-8">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Ticket size={14} className="text-purple-400" />
            <span className="font-bold text-white">YOUR ISSUED PASSES ({tickets.length})</span>
          </div>
          <span className="text-zinc-500">READY FOR CHECK-IN</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tickets.map((ticket, idx) => (
            <div key={ticket.ticketId} className="space-y-4">
              <PhysicalPass pass={ticket} id={`pass-card-item-${idx}`} enable3D={true} />

              <div className="flex items-center gap-3 font-mono">
                <button
                  onClick={() => handleExportPDF(ticket, idx)}
                  className="flex-1 py-2 bg-zinc-900 border border-zinc-700 hover:border-white text-white text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={13} />
                  <span>DOWNLOAD PDF</span>
                </button>
                <button
                  onClick={() => handleExportPNG(ticket, idx)}
                  className="flex-1 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white text-xs uppercase transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={13} />
                  <span>SAVE PNG</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UPCOMING EVENTS RSVP CATALOG */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 font-mono text-xs">
          <span className="font-bold text-white">ALL UPCOMING GATHERINGS & HACKATHONS</span>
          <span className="text-zinc-500">{events.length} ACTIVE EVENTS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-6 bg-zinc-950 border border-zinc-800 hover:border-zinc-500 transition-all font-mono space-y-4 tech-corner-box group"
            >
              <div className="flex items-center justify-between text-[10px]">
                <ChromeBadge label={evt.track} variant="dark" />
                <span className="text-zinc-500">{evt.date}</span>
              </div>

              <div className="space-y-1">
                <h4 className="font-syne font-bold text-lg text-white group-hover:text-zinc-200 transition-colors">
                  {evt.title}
                </h4>
                <p className="text-[11px] text-zinc-400 line-clamp-2">
                  {evt.description}
                </p>
              </div>

              <div className="space-y-1 text-[10px] text-zinc-400 pt-2 border-t border-zinc-900">
                <div>LOC: {evt.location}</div>
                <div>SEATS: {evt.rsvpCount} / {evt.capacity} RESERVED</div>
              </div>

              <button
                onClick={() => {
                  playCyberClick();
                  onOpenRSVP(evt);
                }}
                className="w-full py-2.5 bg-zinc-100 text-black font-bold text-xs uppercase hover:bg-white transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles size={12} />
                <span>RSVP // GET PASS</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
