import React, { useState } from 'react';
import { PhysicalTicketPass, ClubEvent } from '../../types';
import { PhysicalPass } from './PhysicalPass';
import { exportPassToPDF, exportPassToPNG } from './PassExporter';
import { QrCode, Download, Ticket, Sparkles, Clock, Trash2 } from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';
import { useAuth } from '../../context/AuthContext';

interface TicketManagementViewProps {
  tickets?: PhysicalTicketPass[];
  events?: ClubEvent[];
  onOpenRSVP: (event?: ClubEvent) => void;
  onOpenScanner?: () => void;
  hasEvents?: boolean;
  onDeleteTicket?: (ticketId: string, eventId?: string) => void;
}

export const TicketManagementView: React.FC<TicketManagementViewProps> = ({
  tickets = [],
  events = [],
  onOpenRSVP,
  onOpenScanner,
  hasEvents = false,
  onDeleteTicket,
}) => {
  const { isAdmin } = useAuth();
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

  return (
    <div className="space-y-8 animate-fade-in font-mono">
      {/* Header (Frame 12) */}
      <div className="space-y-2 border-b border-zinc-800 pb-4">
        <h2 className="text-3xl sm:text-4xl font-syne font-black tracking-tight text-white uppercase">
          EVENT TICKETING & PASSES
        </h2>
        <p className="text-xs text-zinc-400">
          Digital pass generation with scannable QR verification and local PDF export.
        </p>
      </div>

      {/* Top Banner with SDC EVENT PASSES & LAUNCH SCANNER (Frame 12) */}
      <div className="p-6 bg-[#0c0c14] border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <h3 className="font-syne font-black text-xl sm:text-2xl text-white uppercase tracking-tight">
            SDC EVENT PASSES
          </h3>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            View your event passes with unique QR check-in codes for SDC workshops, lab sessions, and hackathons.
          </p>
        </div>

        {isAdmin && onOpenScanner && (
          <button
            onClick={() => {
              playCyberClick();
              onOpenScanner();
            }}
            className="px-5 py-2.5 bg-zinc-900 border border-purple-500/60 text-purple-300 hover:text-white hover:border-purple-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap self-start md:self-auto"
          >
            <QrCode size={14} />
            <span>LAUNCH SCANNER</span>
          </button>
        )}
      </div>

      {/* Tabs Strip (Frame 12) */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playCyberClick();
              setActiveTab('ACTIVE');
            }}
            className={`px-4 py-2 text-xs font-bold uppercase transition-all flex items-center gap-2 ${
              activeTab === 'ACTIVE'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Ticket size={13} />
            <span>ACTIVE PASSES ({tickets.length})</span>
          </button>
          <button
            onClick={() => {
              playCyberClick();
              setActiveTab('PAST');
            }}
            className={`px-4 py-2 text-xs font-bold uppercase transition-all flex items-center gap-2 ${
              activeTab === 'PAST'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Clock size={13} />
            <span>VIEW PAST TICKETS (0)</span>
          </button>
        </div>

        <span className="hidden sm:inline text-zinc-500 text-[10px]">
          AUTHENTICATED LIVE PASSES
        </span>
      </div>

      {/* Passes List or Empty State (Frame 12) */}
      {tickets.length === 0 ? (
        <div className="p-16 bg-[#0a0a0f] border border-zinc-800 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 mx-auto bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400">
            <Ticket size={22} />
          </div>
          <div className="space-y-1">
            <h4 className="font-syne font-black text-lg text-white uppercase">
              YOU HAVEN'T REGISTERED FOR ANY EVENTS YET
            </h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              {hasEvents
                ? 'Once you RSVP for an upcoming workshop, summit, or hackathon session, your official digital pass with a verified check-in QR code will appear here.'
                : 'There are currently no upcoming events available. Your passes will appear here once events are announced and you RSVP.'}
            </p>
          </div>
          {hasEvents && (
            <button
              onClick={() => {
                playCyberClick();
                onOpenRSVP();
              }}
              className="px-5 py-2.5 bg-white text-black font-bold uppercase text-xs hover:bg-zinc-200 inline-flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>EXPLORE EVENTS & RSVP</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tickets.map((ticket, idx) => (
            <div key={ticket.ticketId} className="space-y-4">
              <PhysicalPass pass={ticket} id={`pass-card-item-${idx}`} enable3D={true} />

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleExportPDF(ticket, idx)}
                  className="flex-1 py-2 bg-zinc-900 border border-zinc-700 hover:border-white text-white text-xs font-bold uppercase flex items-center justify-center gap-2"
                >
                  <Download size={13} />
                  <span>DOWNLOAD PDF</span>
                </button>
                <button
                  onClick={() => handleExportPNG(ticket, idx)}
                  className="flex-1 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white text-xs uppercase flex items-center justify-center gap-2"
                >
                  <Download size={13} />
                  <span>SAVE PNG</span>
                </button>
                {onDeleteTicket && (
                  <button
                    onClick={() => {
                      playCyberClick();
                      if (confirm('Cancel this pass? This will free up the event seat.')) {
                        onDeleteTicket(ticket.ticketId, ticket.eventId);
                      }
                    }}
                    className="py-2 px-3 bg-zinc-900 border border-zinc-800 hover:border-red-500 hover:bg-red-950/30 text-zinc-500 hover:text-red-400 text-xs uppercase font-bold flex items-center justify-center gap-1.5 transition-colors"
                    title="Cancel Pass"
                  >
                    <Trash2 size={13} />
                    <span>CANCEL</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default TicketManagementView;
