import React, { useState } from 'react';
import { Vote, Clock, Trophy, ArrowRight, Search } from 'lucide-react';
import { useVeritasDAO } from '../hooks/useVeritasDAO';
import { ElectionStatus } from '../types';

interface ElectionsPageProps {
  onNavigate: (tab: string, electionId?: number) => void;
}

export const ElectionsPage: React.FC<ElectionsPageProps> = ({ onNavigate }) => {
  const { elections, isLoadingElections } = useVeritasDAO();
  const [filter, setFilter] = useState<'all' | 'open' | 'created' | 'finalized'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredElections = elections.filter((election) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'open' && election.status === ElectionStatus.Open) ||
      (filter === 'created' && election.status === ElectionStatus.Created) ||
      (filter === 'finalized' && election.status === ElectionStatus.Finalized);

    const matchesSearch =
      election.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: ElectionStatus) => {
    switch (status) {
      case ElectionStatus.Open:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-xs font-bold animate-pulse shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>OPEN / ACTIVE</span>
          </span>
        );
      case ElectionStatus.Created:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-[10px] sm:text-xs font-semibold shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>UPCOMING</span>
          </span>
        );
      case ElectionStatus.Closed:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-semibold shrink-0">
            <span>CLOSED</span>
          </span>
        );
      case ElectionStatus.Finalized:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-gray-800 border border-gray-600 text-gray-300 text-[10px] sm:text-xs font-semibold shrink-0">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>FINALIZED</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 py-2 sm:py-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Vote className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400 shrink-0" />
            <span>Governance Elections</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Browse active and historical sequential election cycles conducted on-chain.
          </p>
        </div>

        {/* Filter Tabs (Horizontally scrollable on narrow mobile) */}
        <div className="flex items-center gap-1 p-1 bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto no-scrollbar shrink-0 self-start md:self-auto max-w-full">
          {(['all', 'open', 'created', 'finalized'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-xs font-semibold capitalize rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                filter === key
                  ? 'text-white bg-emerald-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {key === 'open' ? 'Active' : key}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search elections by title or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-900/90 border border-gray-800 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Elections List */}
      {isLoadingElections ? (
        <div className="py-16 text-center text-gray-400 text-xs sm:text-sm">Loading elections from Bohr Testnet...</div>
      ) : filteredElections.length === 0 ? (
        <div className="py-16 text-center text-gray-400 bg-gray-900/80 border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-2">
          <p className="text-sm sm:text-base font-semibold text-gray-300">No elections found</p>
          <p className="text-xs text-gray-500">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredElections.map((election) => (
            <div
              key={Number(election.id)}
              className="p-5 sm:p-6 bg-gray-900/80 border border-gray-800 rounded-3xl space-y-4 sm:space-y-5 hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-gray-400">
                    Election #{Number(election.id)}
                  </span>
                  {getStatusBadge(election.status)}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                  {election.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 leading-relaxed">
                  {election.description}
                </p>
              </div>

              {/* Stats & Meta info */}
              <div className="space-y-3 pt-3 border-t border-gray-800/80">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-gray-950/80 rounded-xl border border-gray-800">
                    <span className="text-gray-400 block text-[10px] sm:text-[11px]">Candidates</span>
                    <span className="font-bold text-white text-xs sm:text-sm">{Number(election.candidateCount)} Registered</span>
                  </div>
                  <div className="p-2.5 bg-gray-950/80 rounded-xl border border-gray-800">
                    <span className="text-gray-400 block text-[10px] sm:text-[11px]">Total Votes</span>
                    <span className="font-bold text-emerald-400 text-xs sm:text-sm">{Number(election.totalVotes)} Cast</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 gap-2">
                  <div className="text-[10px] sm:text-[11px] text-gray-400 truncate">
                    {election.status === ElectionStatus.Finalized ? (
                      <span className="text-amber-400 font-medium">Finalized on-chain</span>
                    ) : (
                      <span>Ends: {new Date(Number(election.endTime) * 1000).toLocaleDateString()}</span>
                    )}
                  </div>

                  <button
                    onClick={() => onNavigate('election-detail', Number(election.id))}
                    className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
                  >
                    <span>{election.status === ElectionStatus.Open ? 'Vote Now' : 'Details'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
