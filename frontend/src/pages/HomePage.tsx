import React from 'react';
import { Vote, Award, ArrowRight, UserPlus, BarChart3, CheckCircle2, Lock, Users, Sparkles } from 'lucide-react';
import { useVeritasDAO } from '../hooks/useVeritasDAO';

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { summaryStats, isRegistered } = useVeritasDAO();

  return (
    <div className="space-y-10 sm:space-y-14 lg:space-y-18 py-2 sm:py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-gray-900/90 to-gray-950 border border-gray-800 p-6 sm:p-10 md:p-14 lg:p-16 shadow-2xl">
        {/* Glow Background Blurs */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-72 sm:w-96 h-72 sm:h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Decentralized Governance On Bohr Testnet</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Transparent Governance.<br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              Weighted Voting.
            </span><br />
            Immutable History.
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl leading-relaxed">
            VeritasDAO enables communities to organize sequential on-chain elections. Register once, hold governance tokens ($VRT$), vote with real balance weight, and verify results permanently on-chain.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
            <button
              onClick={() => onNavigate('elections')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl shadow-lg shadow-emerald-950 transition-all cursor-pointer"
            >
              <Vote className="w-4 h-4" />
              <span>Explore Elections</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!isRegistered ? (
              <button
                onClick={() => onNavigate('register')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 active:scale-95 rounded-xl transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Once</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 active:scale-95 rounded-xl transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Voter Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Live Blockchain Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="p-4 sm:p-6 bg-gray-900/80 border border-gray-800 rounded-2xl sm:rounded-3xl hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between text-gray-400 mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Total Elections</span>
            <Vote className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {summaryStats?.totalElections ?? '...'}
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Sequential governance cycles</p>
        </div>

        <div className="p-4 sm:p-6 bg-gray-900/80 border border-gray-800 rounded-2xl sm:rounded-3xl hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between text-gray-400 mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Active Elections</span>
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {summaryStats?.openElections ?? '...'}
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Open for voting right now</p>
        </div>

        <div className="p-4 sm:p-6 bg-gray-900/80 border border-gray-800 rounded-2xl sm:rounded-3xl hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between text-gray-400 mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Registered Voters</span>
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {summaryStats?.totalRegisteredVoters ?? '...'}
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1">One-time registered roster</p>
        </div>

        <div className="p-4 sm:p-6 bg-gray-900/80 border border-gray-800 rounded-2xl sm:rounded-3xl hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between text-gray-400 mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Total Votes Cast</span>
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {summaryStats?.totalVotesCast ?? '...'}
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 truncate">
            {summaryStats?.formattedTotalVoteWeight ?? '0'} VRT total weight
          </p>
        </div>
      </section>

      {/* Core Protocol Flow */}
      <section className="space-y-6 sm:space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 px-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">How VeritasDAO Works</h2>
          <p className="text-xs sm:text-sm text-gray-400">
            A seamless governance lifecycle designed for security, fairness, and permanent verifiability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-6 sm:p-7 bg-gray-900/80 border border-gray-800 rounded-2xl sm:rounded-3xl space-y-3 relative group hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base sm:text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-white">Register Once</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Voters complete a single transparent on-chain registration. Once registered, you remain eligible to participate in all current and future sequential elections.
            </p>
          </div>

          <div className="p-6 sm:p-7 bg-gray-900/80 border border-gray-800 rounded-2xl sm:rounded-3xl space-y-3 relative group hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base sm:text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-white">Vote With Token Weight</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Voting weight equals your exact $VRT$ governance token balance snapshotted at the instant your vote is cast. No retroactive manipulation or vote leakage.
            </p>
          </div>

          <div className="p-6 sm:p-7 bg-gray-900/80 border border-gray-800 rounded-2xl sm:rounded-3xl space-y-3 relative group hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base sm:text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-white">Immutable Archive</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Winners are calculated and permanently recorded by the smart contract. Past elections and candidate vote weights remain publicly verifiable forever.
            </p>
          </div>
        </div>
      </section>

      {/* Chairman vs Token Holders Distinction */}
      <section className="p-6 sm:p-8 md:p-10 bg-gray-900/80 border border-gray-800 rounded-3xl shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div className="space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/20">
              <Lock className="w-3.5 h-3.5" />
              <span>Trustless Architecture</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              The Chairman Organizes;<br />
              <span className="text-emerald-400">The Token Holders Decide.</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              In VeritasDAO, the Chairman acts strictly as an election administrator with powers bounded by smart-contract rules. The Chairman can create elections and register candidates, but cannot alter cast votes, manipulate voter weights, or rewrite historical winners.
            </p>
          </div>

          <div className="space-y-2.5 sm:space-y-3 bg-gray-950/80 p-5 sm:p-6 rounded-2xl border border-gray-800">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-gray-300">
                <strong className="text-white">One-Time Voter Registration:</strong> No tedious per-election registration friction.
              </p>
            </div>
            <div className="flex items-start gap-2.5 sm:gap-3">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-gray-300">
                <strong className="text-white">Independent Candidate Sets:</strong> Candidate lists are permanently isolated per election.
              </p>
            </div>
            <div className="flex items-start gap-2.5 sm:gap-3">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-gray-300">
                <strong className="text-white">Deterministic Tie Resolution:</strong> Transparent tie handling recorded on-chain.
              </p>
            </div>
            <div className="flex items-start gap-2.5 sm:gap-3">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-gray-300">
                <strong className="text-white">Community Proposals:</strong> Token holders can propose elections with sufficient $VRT$ support.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
