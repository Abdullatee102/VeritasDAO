import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Wallet, Coins, UserPlus, CheckCircle2, AlertCircle, Vote, ArrowRight, Trophy, Clock } from 'lucide-react';
import { useVeritasDAO } from '../hooks/useVeritasDAO';
import { FaucetModal } from '../components/FaucetModal';
import { ElectionStatus } from '../types';

interface DashboardPageProps {
  onNavigate: (tab: string, electionId?: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { address, isConnected } = useAccount();
  const {
    isRegistered,
    formattedTokenBalance,
    elections,
    isChairman,
  } = useVeritasDAO();

  const [isFaucetOpen, setIsFaucetOpen] = useState(false);

  const activeElections = elections.filter((e) => e.status === ElectionStatus.Open);
  const concludedElections = elections.filter((e) => e.status === ElectionStatus.Finalized);

  if (!isConnected || !address) {
    return (
      <div className="py-12 text-center space-y-6 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center mx-auto text-emerald-400">
          <Wallet className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Connect Your Wallet</h2>
          <p className="text-sm text-gray-400">
            Connect to Bohr Testnet to inspect your voter registration status, $VRT$ token balance, and participate in active elections.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header Profile Card */}
      <div className="p-6 sm:p-8 bg-dark-card border border-dark-border rounded-3xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Voter Profile</span>
              {isChairman && (
                <span className="px-2.5 py-0.5 text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 rounded-full">
                  Chairman / Organizer
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono">
              {address.slice(0, 8)}...{address.slice(-6)}
            </h2>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {isRegistered ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Registered Voter (Eligible for All Elections)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Not Registered Yet</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {!isRegistered && (
              <button
                onClick={() => onNavigate('register')}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-glow-subtle cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Once</span>
              </button>
            )}
            <button
              onClick={() => setIsFaucetOpen(true)}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 rounded-xl transition-all cursor-pointer"
            >
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>Claim Free 100 VRT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Governance & Voting Power Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 bg-dark-card border border-dark-border rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Governance Balance</span>
            <Coins className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {formattedTokenBalance} <span className="text-sm font-sans font-medium text-emerald-400">VRT</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Veritas Governance Tokens</p>
        </div>

        <div className="p-6 bg-dark-card border border-dark-border rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Vote Weight</span>
            <Vote className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {formattedTokenBalance}
          </div>
          <p className="text-xs text-gray-400 mt-1">1 VRT = 1 Voting Weight</p>
        </div>

        <div className="p-6 bg-dark-card border border-dark-border rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Open Elections</span>
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {activeElections.length}
          </div>
          <p className="text-xs text-gray-400 mt-1">Active voting sessions</p>
        </div>

        <div className="p-6 bg-dark-card border border-dark-border rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Finalized Elections</span>
            <Trophy className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {concludedElections.length}
          </div>
          <p className="text-xs text-gray-400 mt-1">Recorded in history</p>
        </div>
      </div>

      {/* Active Elections to Vote */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Vote className="w-5 h-5 text-emerald-400" />
            Active Elections
          </h3>
          <button
            onClick={() => onNavigate('elections')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeElections.length === 0 ? (
          <div className="p-8 bg-dark-card border border-dark-border rounded-2xl text-center text-gray-400 space-y-2">
            <p className="text-sm">No active elections open for voting at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeElections.map((election) => (
              <div
                key={Number(election.id)}
                className="p-6 bg-dark-card border border-dark-border rounded-2xl space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      Election #{Number(election.id)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {Number(election.candidateCount)} Candidates
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white">{election.title}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2">{election.description}</p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-dark-border/60">
                  <div className="text-xs text-gray-400">
                    Total Votes: <span className="text-gray-200 font-semibold">{Number(election.totalVotes)}</span>
                  </div>
                  <button
                    onClick={() => onNavigate('election-detail', Number(election.id))}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all cursor-pointer"
                  >
                    <span>Inspect & Vote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FaucetModal isOpen={isFaucetOpen} onClose={() => setIsFaucetOpen(false)} />
    </div>
  );
};

