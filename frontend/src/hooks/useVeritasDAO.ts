import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, bohrTestnet } from '../config/contracts';
import { Election, Candidate, ElectionProposal, VoteRecord } from '../types';
import { formatEther } from 'viem';

export function useVeritasDAO() {
  const { address, isConnected, chain } = useAccount();
  const isCorrectNetwork = chain?.id === bohrTestnet.id;

  // 1. Read DAO Owner / Chairman
  const { data: ownerAddress, refetch: refetchOwner } = useReadContract({
    address: CONTRACT_ADDRESSES.dao,
    abi: CONTRACT_ABIS.dao,
    functionName: 'owner',
    query: {
      refetchInterval: 10_000,
    },
  });

  const isChairman = Boolean(
    address && ownerAddress && address.toLowerCase() === (ownerAddress as string).toLowerCase()
  );

  // 2. Read Voter Registration Status
  const { data: isRegistered, refetch: refetchRegistration } = useReadContract({
    address: CONTRACT_ADDRESSES.dao,
    abi: CONTRACT_ABIS.dao,
    functionName: 'isRegisteredVoter',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchInterval: 5_000,
    },
  });

  // 3. Read Voter Governance Token Balance
  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.token,
    abi: CONTRACT_ABIS.token,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchInterval: 5_000,
    },
  });

  // 4. Read Summary Stats
  const { data: summaryStats, refetch: refetchSummary } = useReadContract({
    address: CONTRACT_ADDRESSES.dao,
    abi: CONTRACT_ABIS.dao,
    functionName: 'getSummaryStats',
    query: {
      refetchInterval: 8_000,
    },
  });

  // 5. Read All Elections
  const { data: allElections, isLoading: isLoadingElections, refetch: refetchElections } = useReadContract({
    address: CONTRACT_ADDRESSES.dao,
    abi: CONTRACT_ABIS.dao,
    functionName: 'getAllElections',
    query: {
      refetchInterval: 8_000,
    },
  });

  // 6. Read All Proposals (Stretch Goal)
  const { data: allProposals, isLoading: isLoadingProposals, refetch: refetchProposals } = useReadContract({
    address: CONTRACT_ADDRESSES.dao,
    abi: CONTRACT_ABIS.dao,
    functionName: 'getAllProposals',
    query: {
      refetchInterval: 8_000,
    },
  });

  // 7. Write Contract Hook
  const { writeContractAsync, data: txHash, isPending: isTxPending, reset: resetTx } = useWriteContract();

  const {
    isLoading: isTxWaiting,
    isSuccess: isTxSuccess,
    isError: isTxError,
    error: txReceiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const refetchAll = () => {
    refetchOwner();
    refetchRegistration();
    refetchTokenBalance();
    refetchSummary();
    refetchElections();
    refetchProposals();
  };

  return {
    address,
    isConnected,
    isCorrectNetwork,
    ownerAddress: ownerAddress as string | undefined,
    isChairman,
    isRegistered: Boolean(isRegistered),
    tokenBalance: tokenBalance as bigint | undefined,
    formattedTokenBalance: tokenBalance ? Number(formatEther(tokenBalance as bigint)).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0',
    summaryStats: summaryStats ? {
      totalElections: Number((summaryStats as any[])[0]),
      openElections: Number((summaryStats as any[])[1]),
      finalizedElections: Number((summaryStats as any[])[2]),
      totalRegisteredVoters: Number((summaryStats as any[])[3]),
      totalVotesCast: Number((summaryStats as any[])[4]),
      totalVoteWeight: (summaryStats as any[])[5] as bigint,
      formattedTotalVoteWeight: Number(formatEther((summaryStats as any[])[5] as bigint)).toLocaleString(undefined, { maximumFractionDigits: 2 }),
    } : null,
    elections: (allElections as Election[] | undefined) || [],
    isLoadingElections,
    proposals: (allProposals as ElectionProposal[] | undefined) || [],
    isLoadingProposals,
    writeContractAsync,
    txHash,
    isTxPending,
    isTxWaiting,
    isTxSuccess,
    isTxError,
    txReceiptError,
    resetTx,
    refetchAll,
  };
}

export function useElectionDetail(electionId: number | undefined) {
  const { address } = useAccount();

  // Read Election by ID
  const { data: election, isLoading: isLoadingElection, refetch: refetchElection } = useReadContract({
    address: CONTRACT_ADDRESSES.dao,
    abi: CONTRACT_ABIS.dao,
    functionName: 'getElection',
    args: electionId ? [BigInt(electionId)] : undefined,
    query: {
      enabled: Boolean(electionId && electionId > 0),
      refetchInterval: 5_000,
    },
  });

  // Read Candidates for this Election
  const { data: candidates, isLoading: isLoadingCandidates, refetch: refetchCandidates } = useReadContract({
    address: CONTRACT_ADDRESSES.dao,
    abi: CONTRACT_ABIS.dao,
    functionName: 'getCandidates',
    args: electionId ? [BigInt(electionId)] : undefined,
    query: {
      enabled: Boolean(electionId && electionId > 0),
      refetchInterval: 5_000,
    },
  });

  // Read User Vote Record in this Election
  const { data: userVoteRecord, refetch: refetchUserVote } = useReadContract({
    address: CONTRACT_ADDRESSES.dao,
    abi: CONTRACT_ABIS.dao,
    functionName: 'getVote',
    args: electionId && address ? [BigInt(electionId), address] : undefined,
    query: {
      enabled: Boolean(electionId && electionId > 0 && address),
      refetchInterval: 5_000,
    },
  });

  // Read Has Voted status
  const { data: hasVoted, refetch: refetchHasVoted } = useReadContract({
    address: CONTRACT_ADDRESSES.dao,
    abi: CONTRACT_ABIS.dao,
    functionName: 'hasVotedInElection',
    args: electionId && address ? [BigInt(electionId), address] : undefined,
    query: {
      enabled: Boolean(electionId && electionId > 0 && address),
      refetchInterval: 5_000,
    },
  });

  const refetchDetail = () => {
    refetchElection();
    refetchCandidates();
    refetchUserVote();
    refetchHasVoted();
  };

  return {
    election: election as Election | undefined,
    candidates: (candidates as Candidate[] | undefined) || [],
    userVoteRecord: userVoteRecord as VoteRecord | undefined,
    hasVoted: Boolean(hasVoted),
    isLoading: isLoadingElection || isLoadingCandidates,
    refetchDetail,
  };
}

