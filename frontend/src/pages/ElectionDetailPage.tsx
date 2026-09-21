import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import {
  Vote,
  Clock,
  CheckCircle2,
  Trophy,
  ArrowLeft,
  AlertCircle,
  Loader2,
  ExternalLink,
  Award,
  Crown,
} from 'lucide-react';
import { useVeritasDAO, useElectionDetail } from '../hooks/useVeritasDAO';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../config/contracts';
import { ElectionStatus } from '../types';
import { FaucetModal } from '../components/FaucetModal';

interface ElectionDetailPageProps {
  electionId: number;
  onBack: () => void;
  onNavigate: (tab: string) => void;
}

export const ElectionDetailPage: React.FC<ElectionDetailPageProps> = ({
  electionId,
  onBack,
  onNavigate,
}) => {
  const { isConnected } = useAccount();
  const {
    isRegistered,
    formattedTokenBalance,
    tokenBalance,
    isChairman,
    writeContractAsync,
    refetchAll,
  } = useVeritasDAO();

  const {
    election,
    candidates,
    userVoteRecord,
    hasVoted,
    isLoading,
    refetchDetail,
  } = useElectionDetail(electionId);

  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);

  if (isLoading || !election) {
    return (
      <div className="py-20 text-center text-gray-400 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
        <p className="text-xs sm:text-sm">Loading election details from Bohr Testnet...</p>
      </div>
    );
  }

  const isOpen = election.status === ElectionStatus.Open;
  const isFinalized = election.status === ElectionStatus.Finalized;
  const isCreated = election.status === ElectionStatus.Created;
  const isClosed = election.status === ElectionStatus.Closed;

  const totalElectionVoteWeight = Number(election.totalVoteWeight) / 1e18;

  const handleVote = async () => {
    if (!selectedCandidateId) return;
    try {
      setIsSubmittingVote(true);
      setErrorMsg(null);
      setTxHash(null);

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.dao,
        abi: CONTRACT_ABIS.dao,
        functionName: 'vote',
        args: [BigInt(electionId), BigInt(selectedCandidateId)],
      });

      setTxHash(hash);
      setTimeout(() => {
        refetchDetail();
        refetchAll();
      }, 3500);
    } catch (err: any) {
      console.error('Vote error:', err);
      setErrorMsg(err?.shortMessage || err?.message || 'Failed to submit vote.');
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const handleFinalize = async () => {
    try {
      setIsFinalizing(true);
      setErrorMsg(null);

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.dao,
        abi: CONTRACT_ABIS.dao,
        functionName: 'finalizeElection',
        args: [BigInt(electionId)],
      });

      setTxHash(hash);
      setTimeout(() => {
        refetchDetail();
        refetchAll();
      }, 3500);
    } catch (err: any) {
      console.error('Finalize error:', err);
      setErrorMsg(err?.shortMessage || err?.message || 'Failed to finalize election.');
    } finally {
      setIsFinalizing(false);
    }
  };

  const selectedCandidate = candidates.find((c) => Number(c.id) === selectedCandidateId);

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-4 space-y-6 sm:space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-gray-900 border border-gray-800 rounded-xl transition-all cursor-pointer active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Elections</span>
      </button>

      {/* Header Info Banner */}
      <div className="p-5 sm:p-8 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-5 sm:space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-0.5 rounded-full inline-block">
              Election #{Number(election.id)}
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight mt-1.5">
              {election.title}
            </h1>
          </div>

          <div className="shrink-0">
            {isOpen && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] sm:text-xs font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>OPEN FOR VOTING</span>
              </span>
            )}
            {isFinalized && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[11px] sm:text-xs font-bold">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>FINALIZED ON-CHAIN</span>
              </span>
            )}
            {isCreated && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-[11px] sm:text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>UPCOMING</span>
              </span>
            )}
            {isClosed && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[11px] sm:text-xs font-semibold">
                <span>CLOSED (AWAITING FINALIZATION)</span>
              </span>
            )}
          </div>
        </div>

        <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed max-w-3xl">
          {election.description}
        </p>

        {/* Meta Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-4 border-t border-gray-800/80 text-xs">
          <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800">
            <span className="text-gray-400 block text-[10px] sm:text-[11px]">Start Date</span>
            <span className="font-semibold text-white text-[11px] sm:text-xs">
              {new Date(Number(election.startTime) * 1000).toLocaleDateString()}
            </span>
          </div>
          <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800">
            <span className="text-gray-400 block text-[10px] sm:text-[11px]">End Date</span>
            <span className="font-semibold text-white text-[11px] sm:text-xs">
              {new Date(Number(election.endTime) * 1000).toLocaleDateString()}
            </span>
          </div>
          <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800">
            <span className="text-gray-400 block text-[10px] sm:text-[11px]">Total Votes Cast</span>
            <span className="font-bold text-emerald-400 font-mono text-xs sm:text-sm">
              {Number(election.totalVotes)}
            </span>
          </div>
          <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800">
            <span className="text-gray-400 block text-[10px] sm:text-[11px]">Total Vote Weight</span>
            <span className="font-bold text-white font-mono text-xs sm:text-sm truncate block">
              {totalElectionVoteWeight.toLocaleString()} VRT
            </span>
          </div>
        </div>
      </div>

      {/* Winner Banner (if Finalized) */}
      {isFinalized && (
        <div className="p-5 sm:p-7 bg-gradient-to-r from-amber-950/50 via-gray-900 to-amber-950/50 border border-amber-500/40 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-400">
                Official Finalized Result
              </span>
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white">
                {election.isTie ? (
                  <span className="text-amber-300">Election Result: Concluded in a Tie</span>
                ) : (
                  <span>
                    Winner: Candidate #{Number(election.winnerCandidateId)} (
                    {candidates.find((c) => Number(c.id) === Number(election.winnerCandidateId))?.name || 'Winner'}
                    )
                  </span>
                )}
              </h3>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-300">
            Recorded Winning Weight:{' '}
            <strong className="text-amber-300 font-mono">
              {(Number(election.winningVoteWeight) / 1e18).toLocaleString()} VRT
            </strong>
            . This election is permanently archived in the VeritasDAO on-chain history.
          </p>
        </div>
      )}

      {/* Candidates List & Vote Distribution */}
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <span>Candidate Platform & Vote Tally</span>
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {candidates.map((candidate) => {
            const candidateWeight = Number(candidate.voteWeight) / 1e18;
            const percentage =
              totalElectionVoteWeight > 0
                ? Math.round((candidateWeight / totalElectionVoteWeight) * 100)
                : 0;

            const isWinner =
              isFinalized &&
              !election.isTie &&
              Number(election.winnerCandidateId) === Number(candidate.id);

            const isSelected = selectedCandidateId === Number(candidate.id);

            return (
              <div
                key={Number(candidate.id)}
                onClick={() => {
                  if (isOpen && !hasVoted && isRegistered) {
                    setSelectedCandidateId(Number(candidate.id));
                  }
                }}
                className={`p-4 sm:p-6 bg-gray-900/80 border rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 transition-all ${
                  isWinner
                    ? 'border-amber-500/60 bg-amber-950/20'
                    : isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-950/20'
                    : 'border-gray-800 hover:border-gray-700'
                } ${isOpen && !hasVoted && isRegistered ? 'cursor-pointer active:scale-[0.99]' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-gray-400">
                        Candidate #{Number(candidate.id)}
                      </span>
                      {isWinner && (
                        <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-amber-300 bg-amber-950 border border-amber-500/40 rounded-full flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> Winner
                        </span>
                      )}
                      {isSelected && (
                        <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-500/40 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-white">{candidate.name}</h4>
                    <p className="text-xs text-gray-300 leading-relaxed">{candidate.description}</p>
                  </div>

                  {/* Vote Weight & Percentage */}
                  <div className="text-left sm:text-right shrink-0 pt-1 sm:pt-0">
                    <div className="text-base sm:text-lg font-extrabold text-white font-mono">
                      {candidateWeight.toLocaleString()}{' '}
                      <span className="text-xs text-emerald-400 font-sans">VRT</span>
                    </div>
                    <div className="text-[11px] sm:text-xs text-gray-400 font-mono">
                      {percentage}% ({Number(candidate.voteCount)} votes)
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-950 rounded-full h-2 sm:h-2.5 overflow-hidden border border-gray-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isWinner
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Voting Actions Section */}
      {isOpen && (
        <div className="p-5 sm:p-8 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-5 sm:space-y-6 shadow-2xl">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Vote className="w-5 h-5 text-emerald-400" />
            <span>Cast Your Weighted Vote</span>
          </h3>

          {!isConnected ? (
            <div className="p-5 sm:p-6 bg-gray-950 rounded-2xl border border-gray-800 text-center space-y-3">
              <p className="text-xs sm:text-sm text-gray-400">Connect your Web3 wallet to vote in this election.</p>
            </div>
          ) : !isRegistered ? (
            <div className="p-5 sm:p-6 bg-amber-950/40 border border-amber-500/30 rounded-2xl space-y-3 text-xs text-amber-200">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <AlertCircle className="w-5 h-5" />
                <span>Voter Registration Required</span>
              </div>
              <p className="text-gray-300">
                You must complete one-time voter registration before casting a vote.
              </p>
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl transition-all cursor-pointer"
              >
                Go to Registration Portal
              </button>
            </div>
          ) : hasVoted ? (
            <div className="p-5 sm:p-6 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-2 text-xs text-emerald-200">
              <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>You Have Voted in this Election</span>
              </div>
              <p className="text-gray-300">
                Your vote was recorded with weight{' '}
                <strong className="text-white font-mono">
                  {userVoteRecord ? (Number(userVoteRecord.weight) / 1e18).toLocaleString() : ''} VRT
                </strong>{' '}
                for Candidate #{userVoteRecord ? Number(userVoteRecord.candidateId) : ''}.
              </p>
            </div>
          ) : (!tokenBalance || tokenBalance === 0n) ? (
            <div className="p-5 sm:p-6 bg-amber-950/40 border border-amber-500/30 rounded-2xl space-y-3 text-xs text-amber-200">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <AlertCircle className="w-5 h-5" />
                <span>Zero Governance Token Balance</span>
              </div>
              <p className="text-gray-300">
                Your vote weight is determined by your $VRT$ token balance. You need tokens to cast a weighted vote.
              </p>
              <button
                onClick={() => setIsFaucetOpen(true)}
                className="px-4 py-2 text-xs font-bold text-emerald-300 bg-emerald-950 border border-emerald-500/40 rounded-xl hover:bg-emerald-900 active:scale-95 transition-all cursor-pointer"
              >
                Claim 100 VRT Testnet Faucet
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Voting Weight Preview */}
              <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Your Voting Power:</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">
                    {formattedTokenBalance} VRT
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Selected Candidate:</span>
                  <span className="font-bold text-white truncate max-w-[60%] text-right">
                    {selectedCandidate ? `${selectedCandidate.name} (#${selectedCandidateId})` : 'None selected'}
                  </span>
                </div>
              </div>

              {txHash && (
                <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-start gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Vote Confirmed On-Chain!</p>
                    <a
                      href={`https://scan.bohr.life/tx/${txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-emerald-400 flex items-center gap-1 mt-0.5"
                    >
                      <span>View transaction on BohrScan</span> <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 bg-red-950/50 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="break-all">{errorMsg}</p>
                </div>
              )}

              <button
                disabled={!selectedCandidateId || isSubmittingVote}
                onClick={handleVote}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-emerald-950 cursor-pointer active:scale-98"
              >
                {isSubmittingVote ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Broadcasting Vote to Bohr Testnet...</span>
                  </>
                ) : (
                  <>
                    <Vote className="w-5 h-5" />
                    <span className="truncate">
                      {selectedCandidate ? `Vote for ${selectedCandidate.name}` : 'Select a Candidate Above'}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chairman Finalize Control */}
      {(isOpen || isClosed) && !isFinalized && isChairman && (
        <div className="p-5 sm:p-6 bg-gray-900/90 border border-amber-500/30 rounded-3xl space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <Crown className="w-4 h-4" />
            <span>Chairman Finalization Control</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            As Chairman, you can conclude voting and calculate the official on-chain winner once the voting period ends or manual close is triggered.
          </p>
          <button
            disabled={isFinalizing}
            onClick={handleFinalize}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 active:scale-95 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isFinalizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
            <span>Finalize Election & Determine Winner</span>
          </button>
        </div>
      )}

      <FaucetModal isOpen={isFaucetOpen} onClose={() => setIsFaucetOpen(false)} />
    </div>
  );
};
