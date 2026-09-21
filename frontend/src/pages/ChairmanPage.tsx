import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import {
  Crown,
  PlusCircle,
  UserPlus,
  PlayCircle,
  Trophy,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useVeritasDAO } from '../hooks/useVeritasDAO';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../config/contracts';
import { ElectionStatus } from '../types';

export const ChairmanPage: React.FC = () => {
  const { address } = useAccount();
  const { isChairman, ownerAddress, elections, writeContractAsync, refetchAll } = useVeritasDAO();

  // Create Election Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [startOffsetHours, setStartOffsetHours] = useState('0');
  const [durationDays, setDurationDays] = useState('7');

  // Candidate Management Form State
  const [targetElectionId, setTargetElectionId] = useState<number>(0);
  const [candidateName, setCandidateName] = useState('');
  const [candidateDesc, setCandidateDesc] = useState('');

  // Transaction Status
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const createdElections = elections.filter((e) => e.status === ElectionStatus.Created);
  const openOrClosedElections = elections.filter(
    (e) => e.status === ElectionStatus.Open || e.status === ElectionStatus.Closed
  );

  const handleCreateElection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    try {
      setIsLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      setTxHash(null);

      const now = Math.floor(Date.now() / 1000);
      const startTime = now + Number(startOffsetHours) * 3600;
      const endTime = startTime + Number(durationDays) * 86400;

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.dao,
        abi: CONTRACT_ABIS.dao,
        functionName: 'createElection',
        args: [newTitle.trim(), newDesc.trim(), BigInt(startTime), BigInt(endTime)],
      });

      setTxHash(hash);
      setSuccessMsg(`Election "${newTitle}" successfully initialized on-chain!`);
      setNewTitle('');
      setNewDesc('');
      setTimeout(() => refetchAll(), 3500);
    } catch (err: any) {
      console.error('Create election error:', err);
      setErrorMsg(err?.shortMessage || err?.message || 'Failed to create election.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetElectionId || !candidateName.trim()) return;

    try {
      setIsLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      setTxHash(null);

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.dao,
        abi: CONTRACT_ABIS.dao,
        functionName: 'addCandidate',
        args: [BigInt(targetElectionId), candidateName.trim(), candidateDesc.trim()],
      });

      setTxHash(hash);
      setSuccessMsg(`Candidate "${candidateName}" added to Election #${targetElectionId}!`);
      setCandidateName('');
      setCandidateDesc('');
      setTimeout(() => refetchAll(), 3500);
    } catch (err: any) {
      console.error('Add candidate error:', err);
      setErrorMsg(err?.shortMessage || err?.message || 'Failed to add candidate.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenElection = async (electionId: number) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      setTxHash(null);

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.dao,
        abi: CONTRACT_ABIS.dao,
        functionName: 'openElection',
        args: [BigInt(electionId)],
      });

      setTxHash(hash);
      setSuccessMsg(`Election #${electionId} is now OPEN for public voting!`);
      setTimeout(() => refetchAll(), 3500);
    } catch (err: any) {
      console.error('Open election error:', err);
      setErrorMsg(err?.shortMessage || err?.message || 'Failed to open election.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizeElection = async (electionId: number) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      setTxHash(null);

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.dao,
        abi: CONTRACT_ABIS.dao,
        functionName: 'finalizeElection',
        args: [BigInt(electionId)],
      });

      setTxHash(hash);
      setSuccessMsg(`Election #${electionId} has been successfully FINALIZED on-chain!`);
      setTimeout(() => refetchAll(), 3500);
    } catch (err: any) {
      console.error('Finalize election error:', err);
      setErrorMsg(err?.shortMessage || err?.message || 'Failed to finalize election.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isChairman) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Organizer Restricted Area</h2>
          <p className="text-sm text-gray-400">
            This dashboard is dedicated to the VeritasDAO Chairman/Owner address for organizing sequential elections and adding candidates.
          </p>
          <p className="text-xs text-gray-500 font-mono pt-2">
            On-Chain Chairman Address: {ownerAddress || '...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-10">
      {/* Chairman Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-amber-950/40 via-dark-card to-dark-card border border-amber-500/30 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Crown className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Verified Organizer Access
            </span>
            <h1 className="text-2xl font-bold text-white">Chairman Command Hub</h1>
            <p className="text-xs text-gray-400 font-mono">
              Organizer Address: {address}
            </p>
          </div>
        </div>
      </div>

      {/* Global Alerts */}
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

      {/* Section 1: Create New Sequential Election */}
      <div className="p-6 sm:p-8 bg-dark-card border border-dark-border rounded-3xl space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">1. Create New Election</h2>
            <p className="text-xs text-gray-400">Initialize a new governance cycle in Created state</p>
          </div>
        </div>

        <form onSubmit={handleCreateElection} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Election Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Q4 Protocol Treasury Oversight Committee"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Description / Mandate</label>
            <textarea
              required
              rows={3}
              placeholder="Provide context, responsibilities, and scope for this election..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Start Timing</label>
              <select
                value={startOffsetHours}
                onChange={(e) => setStartOffsetHours(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="0">Immediate upon opening</option>
                <option value="1">1 Hour after opening</option>
                <option value="24">24 Hours after opening</option>
                <option value="48">48 Hours after opening</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Voting Duration</label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="1">1 Day</option>
                <option value="3">3 Days</option>
                <option value="7">7 Days (Standard)</option>
                <option value="14">14 Days</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 rounded-xl transition-all shadow-glow-subtle cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            <span>Initialize Election On-Chain</span>
          </button>
        </form>
      </div>

      {/* Section 2: Candidate Management */}
      <div className="p-6 sm:p-8 bg-dark-card border border-dark-border rounded-3xl space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">2. Register Candidates</h2>
            <p className="text-xs text-gray-400">
              Add candidates to upcoming elections before opening (locks permanently once voting opens)
            </p>
          </div>
        </div>

        {createdElections.length === 0 ? (
          <p className="text-xs text-gray-400 p-4 bg-dark-surface rounded-xl border border-dark-border">
            No elections currently in Created state. Create an election above first.
          </p>
        ) : (
          <form onSubmit={handleAddCandidate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Select Election</label>
              <select
                value={targetElectionId || (createdElections[0] ? Number(createdElections[0].id) : 0)}
                onChange={(e) => setTargetElectionId(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {createdElections.map((elec) => (
                  <option key={Number(elec.id)} value={Number(elec.id)}>
                    Election #{Number(elec.id)}: {elec.title} ({Number(elec.candidateCount)} candidates)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Doe"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Candidate Platform Bio</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Core Protocol Contributor & Security Specialist"
                  value={candidateDesc}
                  onChange={(e) => setCandidateDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-6 py-3 font-bold text-white bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 rounded-xl transition-all shadow-glow-subtle cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>Add Candidate On-Chain</span>
            </button>
          </form>
        )}
      </div>

      {/* Section 3: Open & Finalize Lifecycle Controls */}
      <div className="p-6 sm:p-8 bg-dark-card border border-dark-border rounded-3xl space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">3. Lifecycle Controls</h2>
            <p className="text-xs text-gray-400">Open elections with &gt;= 2 candidates or finalize concluded voting</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Upcoming Elections Ready to Open:
          </h4>
          {createdElections.length === 0 ? (
            <p className="text-xs text-gray-500">No elections currently waiting to open.</p>
          ) : (
            <div className="space-y-3">
              {createdElections.map((elec) => {
                const canOpen = Number(elec.candidateCount) >= 2;
                return (
                  <div
                    key={Number(elec.id)}
                    className="p-4 bg-dark-surface rounded-2xl border border-dark-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">
                        Election #{Number(elec.id)}: {elec.title}
                      </div>
                      <div className="text-gray-400">
                        Candidates: <span className="text-emerald-400 font-semibold">{Number(elec.candidateCount)}</span> (Min. 2 required)
                      </div>
                    </div>

                    <button
                      disabled={!canOpen || isLoading}
                      onClick={() => handleOpenElection(Number(elec.id))}
                      className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Open for Voting</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 pt-4">
            Active / Closed Elections Ready to Finalize:
          </h4>
          {openOrClosedElections.length === 0 ? (
            <p className="text-xs text-gray-500">No active or closed elections waiting for finalization.</p>
          ) : (
            <div className="space-y-3">
              {openOrClosedElections.map((elec) => (
                <div
                  key={Number(elec.id)}
                  className="p-4 bg-dark-surface rounded-2xl border border-dark-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-white text-sm">
                      Election #{Number(elec.id)}: {elec.title}
                    </div>
                    <div className="text-gray-400">
                      Status: <span className="text-emerald-400 font-semibold">{elec.status === ElectionStatus.Open ? 'Open' : 'Closed'}</span> | Total Votes: <span className="text-white font-semibold">{Number(elec.totalVotes)}</span>
                    </div>
                  </div>

                  <button
                    disabled={isLoading}
                    onClick={() => handleFinalizeElection(Number(elec.id))}
                    className="px-4 py-2 font-bold text-white bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Finalize Result</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

