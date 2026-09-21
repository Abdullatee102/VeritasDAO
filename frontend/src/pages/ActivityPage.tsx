import React from 'react';
import { Activity, Vote, CheckCircle2, Trophy, UserPlus, ExternalLink, Loader2 } from 'lucide-react';
import { useActivityEvents } from '../hooks/useActivityEvents';
import { ActivityEvent } from '../types';

export const ActivityPage: React.FC = () => {
  const { events, isLoading } = useActivityEvents();

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'VoteCast':
        return <Vote className="w-4 h-4 text-emerald-400" />;
      case 'ElectionCreated':
        return <Activity className="w-4 h-4 text-blue-400" />;
      case 'ElectionFinalized':
        return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'VoterRegistered':
        return <UserPlus className="w-4 h-4 text-teal-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Activity className="w-8 h-8 text-emerald-400" />
          On-Chain Live Event Stream
        </h1>
        <p className="text-sm text-gray-400">
          Real-time governance events decoded directly from the Bohr Testnet blockchain logs.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
          <p className="text-sm">Fetching on-chain activity logs from Bohr RPC...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="p-8 bg-dark-card border border-dark-border rounded-3xl text-center text-gray-400 space-y-2">
          <p className="text-sm">No recent on-chain events found.</p>
          <p className="text-xs text-gray-500">Events will appear in real time as voters register, vote, and finalize elections.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-5 bg-dark-card border border-dark-border rounded-2xl hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-dark-surface border border-dark-border shrink-0 mt-0.5 sm:mt-0">
                  {getEventIcon(evt.type)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{evt.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-dark-surface rounded-full border border-dark-border text-gray-400">
                      {evt.type}
                    </span>
                  </div>
                  <p className="text-gray-300">{evt.description}</p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-dark-border/40">
                <span className="text-[11px] text-gray-400">
                  {new Date(evt.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                {evt.txHash && (
                  <a
                    href={`https://scan.bohr.life/tx/${evt.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline text-[11px]"
                  >
                    <span>View Tx</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

