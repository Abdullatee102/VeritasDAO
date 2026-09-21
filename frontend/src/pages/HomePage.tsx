import React from 'react';
import { Vote, Award, ArrowRight, UserPlus, BarChart3, CheckCircle2, Lock, Users } from 'lucide-react';
import { useVeritasDAO } from '../hooks/useVeritasDAO';

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { summaryStats, isRegistered } = useVeritasDAO();

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-dark-card to-dark-surface border border-dark-border p-8 sm:p-12 lg:p-16">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Decentralized Governance On Bohr Testnet</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Transparent Governance.<br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              Weighted Voting.
            </span><br />
            Immutable History.
          </h1>

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
            VeritasDAO enables communities to organize sequential on-chain elections. Register once, hold governance tokens ($VRT$), vote with true balance weight, and verify results permanently on-chain.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('elections')}
              className="flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl shadow-glow-emerald transition-all cursor-pointer"
            >
              <Vote className="w-4 h-4" />
              <span>Explore Elections</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!isRegistered ? (
              <button
                onClick={() => onNavigate('register')}
                className="flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-xl transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Once</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-xl transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Voter Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Live Blockchain Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 bg-dark-card border border-dark-border rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Elections</span>
            <Vote className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {summaryStats?.totalElections ?? '...'}
          </div>
          <p className="text-xs text-gray-400 mt-1">Sequential governance cycles</p>
        </div>

        <div className="p-6 bg-dark-card border border-dark-border rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Elections</span>
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {summaryStats?.openElections ?? '...'}
          </div>
          <p className="text-xs text-gray-400 mt-1">Open for voting right now</p>
        </div>

        <div className="p-6 bg-dark-card border border-dark-border rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Voters</span>
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {summaryStats?.totalRegisteredVoters ?? '...'}
          </div>
          <p className="text-xs text-gray-400 mt-1">One-time registered roster</p>
        </div>

        <div className="p-6 bg-dark-card border border-dark-border rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Votes Cast</span>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {summaryStats?.totalVotesCast ?? '...'}
          </div>
          <p className="text-xs text-gray-400 mt-1">{summaryStats?.formattedTotalVoteWeight ?? '0'} VRT total weight</p>
        </div>
      </section>

      {/* Core Protocol Flow */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">How VeritasDAO Works</h2>
          <p className="text-sm text-gray-400">
            A seamless governance lifecycle designed for security, fairness, and permanent verifiability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-dark-card border border-dark-border rounded-2xl space-y-4 relative group hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-white">Register Once</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Voters complete a single transparent on-chain registration. Once registered, you remain eligible to participate in all current and future sequential elections.
            </p>
          </div>

          <div className="p-6 bg-dark-card border border-dark-border rounded-2xl space-y-4 relative group hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-white">Vote With Token Weight</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Voting weight equals your exact $VRT$ governance token balance snapshotted at the instant your vote is cast. No retroactive manipulation or vote leakage.
            </p>
          </div>

          <div className="p-6 bg-dark-card border border-dark-border rounded-2xl space-y-4 relative group hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-white">Immutable On-Chain Archive</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Winners are calculated and permanently recorded by the smart contract. Past elections and candidate vote weights remain publicly verifiable forever.
            </p>
          </div>
        </div>
      </section>

      {/* Chairman vs Token Holders Distinction */}
      <section className="p-8 sm:p-10 bg-dark-card border border-dark-border rounded-3xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/20">
              <Lock className="w-3.5 h-3.5" />
              <span>Trustless Architecture</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              The Chairman Organizes;<br />
              <span className="text-emerald-400">The Token Holders Decide.</span>
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              In VeritasDAO, the Chairman acts strictly as an election administrator with powers bounded by smart-contract rules. The Chairman can create elections and register candidates, but cannot alter cast votes, manipulate voter weights, or rewrite historical winners.
            </p>
          </div>

          <div className="space-y-3 bg-dark-surface p-6 rounded-2xl border border-dark-border">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-gray-300">
                <strong>One-Time Voter Registration:</strong> No tedious per-election registration friction.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-gray-300">
                <strong>Independent Candidate Sets:</strong> Candidate lists are permanently isolated per election.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-gray-300">
                <strong>Deterministic Tie Resolution:</strong> Transparent tie handling recorded on-chain.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-gray-300">
                <strong>Community Proposals:</strong> Token holders can propose elections with sufficient $VRT$ support.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

