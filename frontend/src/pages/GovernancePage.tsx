import React, { useState } from 'react';
import {
  BarChart3,
  PlusCircle,
  ThumbsUp,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  Users,
} from 'lucide-react';
import { useVeritasDAO } from '../hooks/useVeritasDAO';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../config/contracts';
import { ProposalStatus } from '../types';

export const GovernancePage: React.FC = () => {
  const { proposals, tokenBalance, formattedTokenBalance, writeContractAsync, refetchAll } = useVeritasDAO();

  // Create Proposal Form
  const [propTitle, setPropTitle] = useState('');
  const [propDesc, setPropDesc] = useState('');
  const [candidate1Name, setCandidate1Name] = useState('');
  const [candidate1Desc, setCandidate1Desc] = useState('');
  const [candidate2Name, setCandidate2Name] = useState('');
  const [candidate2Desc, setCandidate2Desc] = useState('');

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const PROPOSAL_CREATION_THRESHOLD = 50n * 10n ** 18n; // 50 VRT
  const PROPOSAL_SUPPORT_THRESHOLD = 150; // 150 VRT

  const hasSufficientBalance = Boolean(tokenBalance && tokenBalance >= PROPOSAL_CREATION_THRESHOLD);

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propTitle.trim() || !candidate1Name.trim() || !candidate2Name.trim()) return;

    try {
      setIsLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      setTxHash(null);

      const now = Math.floor(Date.now() / 1000);
      const proposedStart = now + 86400; // 1 day
      const proposedEnd = proposedStart + 7 * 86400; // 7 days

      const names = [candidate1Name.trim(), candidate2Name.trim()];
      const descs = [candidate1Desc.trim() || 'Community Candidate', candidate2Desc.trim() || 'Community Candidate'];

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.dao,
        abi: CONTRACT_ABIS.dao,
        functionName: 'proposeElection',
        args: [propTitle.trim(), propDesc.trim(), BigInt(proposedStart), BigInt(proposedEnd), names, descs],
      });

      setTxHash(hash);
      setSuccessMsg(`Community Election Proposal "${propTitle}" created on Bohr Testnet!`);
      setPropTitle('');
      setPropDesc('');
      setCandidate1Name('');
      setCandidate1Desc('');
      setCandidate2Name('');
      setCandidate2Desc('');
      setTimeout(() => refetchAll(), 3500);
    } catch (err: any) {
      console.error('Create proposal error:', err);
      setErrorMsg(err?.shortMessage || err?.message || 'Failed to create proposal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupport = async (proposalId: number) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.dao,
        abi: CONTRACT_ABIS.dao,
        functionName: 'supportProposal',
        args: [BigInt(proposalId)],
      });

      setTxHash(hash);
      setSuccessMsg(`Supported Proposal #${proposalId} with your $VRT$ token weight!`);
      setTimeout(() => refetchAll(), 3500);
    } catch (err: any) {
      console.error('Support proposal error:', err);
      setErrorMsg(err?.shortMessage || err?.message || 'Failed to support proposal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = async (proposalId: number) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.dao,
        abi: CONTRACT_ABIS.dao,
        functionName: 'executeApprovedProposal',
        args: [BigInt(proposalId)],
      });

      setTxHash(hash);
      setSuccessMsg(`Proposal #${proposalId} executed! Real on-chain election generated.`);
      setTimeout(() => refetchAll(), 3500);
    } catch (err: any) {
      console.error('Execute proposal error:', err);
      setErrorMsg(err?.shortMessage || err?.message || 'Failed to execute proposal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Decentralized Proposal System (Stretch Goal)</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2.5">
          <BarChart3 className="w-8 h-8 text-emerald-400" />
          Community Election Proposals
        </h1>
        <p className="text-sm text-gray-400">
          Empowering token holders to propose new sequential elections without relying exclusively on the Chairman.
        </p>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-start gap-3 text-xs text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-200">{successMsg}</p>
            {txHash && (
              <a
                href={`https://scan.bohr.life/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="underline text-emerald-400 flex items-center gap-1 mt-1"
              >
                View on BohrScan <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-950/50 border border-red-500/30 rounded-2xl flex items-start gap-3 text-xs text-red-200 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Active Proposals List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          Community Proposals
        </h3>

        {proposals.length === 0 ? (
          <div className="p-8 bg-dark-card border border-dark-border rounded-3xl text-center text-gray-400 space-y-2">
            <p className="text-sm">No community proposals created yet.</p>
            <p className="text-xs text-gray-500">Submit the first community proposal below!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((prop) => {
              const supportWeightNum = Number(prop.supportWeight) / 1e18;
              const progressPct = Math.min(100, Math.round((supportWeightNum / PROPOSAL_SUPPORT_THRESHOLD) * 100));

              return (
                <div
                  key={Number(prop.id)}
                  className="p-6 bg-dark-card border border-dark-border rounded-3xl space-y-4 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-gray-400">
                          Proposal #{Number(prop.id)}
                        </span>
                        {prop.status === ProposalStatus.Active && (
                          <span className="px-2 py-0.5 text-[10px] font-bold text-blue-300 bg-blue-950 border border-blue-500/40 rounded-full">
                            Active Voting
                          </span>
                        )}
                        {prop.status === ProposalStatus.Approved && (
                          <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-500/40 rounded-full">
                            Approved (Ready to Execute)
                          </span>
                        )}
                        {prop.status === ProposalStatus.Executed && (
                          <span className="px-2 py-0.5 text-[10px] font-bold text-amber-300 bg-amber-950 border border-amber-500/40 rounded-full">
                            Executed (Election #{Number(prop.createdElectionId)})
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-white">{prop.title}</h4>
                      <p className="text-xs text-gray-300">{prop.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-gray-400 block">Proposer:</span>
                      <span className="text-xs font-mono text-emerald-400">
                        {prop.proposer.slice(0, 6)}...{prop.proposer.slice(-4)}
                      </span>
                    </div>
                  </div>

                  {/* Progress towards threshold */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">
                        Community Support: <strong className="text-white font-mono">{supportWeightNum.toLocaleString()} VRT</strong>
                      </span>
                      <span className="text-emerald-400 font-semibold font-mono">
                        {progressPct}% (Target: {PROPOSAL_SUPPORT_THRESHOLD} VRT)
                      </span>
                    </div>
                    <div className="w-full bg-dark-surface rounded-full h-2 overflow-hidden border border-dark-border">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    {prop.status === ProposalStatus.Active && (
                      <button
                        disabled={isLoading}
                        onClick={() => handleSupport(Number(prop.id))}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all cursor-pointer shadow-glow-subtle active:scale-95"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Support with My Weight ({formattedTokenBalance} VRT)</span>
                      </button>
                    )}
                    {prop.status === ProposalStatus.Approved && (
                      <button
                        disabled={isLoading}
                        onClick={() => handleExecute(Number(prop.id))}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-all cursor-pointer active:scale-95"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Execute & Generate On-Chain Election</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Propose Election Form */}
      <div className="p-6 sm:p-8 bg-dark-card border border-dark-border rounded-3xl space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Create a Community Proposal</h3>
            <p className="text-xs text-gray-400">
              Requires a minimum of 50 $VRT$ governance token balance to propose
            </p>
          </div>
        </div>

        {!hasSufficientBalance ? (
          <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-300">Insufficient VRT Balance</p>
              <p className="text-gray-300">
                You currently hold <strong className="text-white">{formattedTokenBalance} VRT</strong>. You need at least 50.00 VRT to initiate a new election proposal.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateProposal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Proposal Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Protocol Risk Assessment Working Group"
                value={propTitle}
                onChange={(e) => setPropTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Description & Purpose</label>
              <textarea
                required
                rows={3}
                placeholder="Detail the rationale and mandate for this proposed election..."
                value={propDesc}
                onChange={(e) => setPropDesc(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Candidates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-dark-surface rounded-2xl border border-dark-border space-y-2">
                <span className="text-xs font-bold text-emerald-400">Initial Candidate 1</span>
                <input
                  type="text"
                  required
                  placeholder="Candidate Name"
                  value={candidate1Name}
                  onChange={(e) => setCandidate1Name(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Platform / Bio"
                  value={candidate1Desc}
                  onChange={(e) => setCandidate1Desc(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-xs text-white"
                />
              </div>

              <div className="p-4 bg-dark-surface rounded-2xl border border-dark-border space-y-2">
                <span className="text-xs font-bold text-teal-400">Initial Candidate 2</span>
                <input
                  type="text"
                  required
                  placeholder="Candidate Name"
                  value={candidate2Name}
                  onChange={(e) => setCandidate2Name(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Platform / Bio"
                  value={candidate2Desc}
                  onChange={(e) => setCandidate2Desc(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-6 py-3 font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 rounded-xl transition-all shadow-glow-emerald cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              <span>Submit Community Proposal (50 VRT Threshold)</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

