import React, { useState } from 'react';
import { History, Trophy, ShieldCheck, ArrowRight, Search, ExternalLink } from 'lucide-react';
import { useVeritasDAO } from '../hooks/useVeritasDAO';
import { ElectionStatus } from '../types';
import { CONTRACT_ADDRESSES } from '../config/contracts';

interface HistoryPageProps {
  onNavigate: (tab: string, electionId?: number) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const { elections, isLoadingElections } = useVeritasDAO();
  const [searchQuery, setSearchQuery] = useState('');

  const finalizedElections = elections
    .filter((e) => e.status === ElectionStatus.Finalized)
    .sort((a, b) => Number(b.id) - Number(a.id));

  const filteredHistory = finalizedElections.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 py-2 sm:py-4 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <History className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400 shrink-0" />
            <span>Immutable Archive</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Cryptographically sealed and permanent historical records of all concluded VeritasDAO elections.
          </p>
        </div>

        <div className="p-3 bg-gray-900 border border-gray-800 rounded-2xl flex items-center gap-2 text-xs text-gray-300 self-start sm:self-auto shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{finalizedElections.length} Finalized Elections</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search finalized election archives..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-900/90 border border-gray-800 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* History List */}
      {isLoadingElections ? (
        <div className="py-16 text-center text-gray-400 text-xs sm:text-sm">Loading historical archives from Bohr Testnet...</div>
      ) : filteredHistory.length === 0 ? (
        <div className="py-16 text-center text-gray-400 bg-gray-900/80 border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-2">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto" />
          <p className="text-sm sm:text-base font-semibold text-gray-300">No Finalized Elections Found</p>
          <p className="text-xs text-gray-500">Concluded elections will permanently appear here once finalized.</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {filteredHistory.map((election) => {
            const winningWeight = Number(election.winningVoteWeight) / 1e18;
            const totalWeight = Number(election.totalVoteWeight) / 1e18;

            return (
              <div
                key={Number(election.id)}
                className="p-5 sm:p-8 bg-gray-900/80 border border-gray-800 hover:border-emerald-500/40 rounded-3xl space-y-5 sm:space-y-6 shadow-xl transition-all relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-gray-400 bg-gray-950 px-2.5 py-0.5 rounded-full border border-gray-800">
                        Election #{Number(election.id)}
                      </span>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 rounded-full flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-400" />
                        Finalized
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">{election.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-300 max-w-3xl leading-relaxed">
                      {election.description}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate('election-detail', Number(election.id))}
                    className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl transition-all cursor-pointer shadow-sm w-full sm:w-auto"
                  >
                    <span>Full Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Winner Callout Card */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/40 to-gray-950 rounded-2xl border border-amber-500/30 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
                  <div>
                    <span className="text-amber-400 block text-[10px] sm:text-[11px] font-semibold uppercase">Winner Status</span>
                    <span className="font-extrabold text-white text-sm sm:text-base">
                      {election.isTie ? 'Tie / No Single Winner' : `Candidate #${Number(election.winnerCandidateId)}`}
                    </span>
                  </div>

                  <div>
                    <span className="text-amber-400 block text-[10px] sm:text-[11px] font-semibold uppercase">Winning Vote Weight</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm sm:text-base">
                      {winningWeight.toLocaleString()} VRT
                    </span>
                  </div>

                  <div>
                    <span className="text-amber-400 block text-[10px] sm:text-[11px] font-semibold uppercase">Total Voter Turnout</span>
                    <span className="font-bold text-white font-mono text-sm sm:text-base">
                      {Number(election.totalVotes)} Votes ({totalWeight.toLocaleString()} VRT)
                    </span>
                  </div>
                </div>

                {/* Verification Footer */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-400 pt-2 border-t border-gray-800/80">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Sealed On-Chain & Immutable</span>
                  </div>
                  <a
                    href={`https://scan.bohr.life/address/${CONTRACT_ADDRESSES.dao}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline text-xs"
                  >
                    <span>Verify on BohrScan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
