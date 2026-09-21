export const ElectionStatus = {
  Created: 0,
  Open: 1,
  Closed: 2,
  Finalized: 3,
} as const;

export type ElectionStatus = typeof ElectionStatus[keyof typeof ElectionStatus];

export const ProposalStatus = {
  Active: 0,
  Approved: 1,
  Executed: 2,
  Rejected: 3,
} as const;

export type ProposalStatus = typeof ProposalStatus[keyof typeof ProposalStatus];

export interface Candidate {
  id: bigint;
  name: string;
  description: string;
  voteWeight: bigint;
  voteCount: bigint;
  active: boolean;
}

export interface Election {
  id: bigint;
  title: string;
  description: string;
  startTime: bigint;
  endTime: bigint;
  status: ElectionStatus;
  winnerCandidateId: bigint;
  winningVoteWeight: bigint;
  isTie: boolean;
  resultFinalized: boolean;
  totalVotes: bigint;
  totalVoteWeight: bigint;
  candidateCount: bigint;
  createdAt: bigint;
}

export interface VoteRecord {
  voter: string;
  candidateId: bigint;
  weight: bigint;
  timestamp: bigint;
}

export interface ElectionProposal {
  id: bigint;
  proposer: string;
  title: string;
  description: string;
  proposedStartTime: bigint;
  proposedEndTime: bigint;
  supportWeight: bigint;
  supportCount: bigint;
  status: ProposalStatus;
  createdAt: bigint;
  createdElectionId: bigint;
}

export interface ActivityEvent {
  id: string;
  type: 'VoterRegistered' | 'VoteCast' | 'ElectionCreated' | 'CandidateAdded' | 'ElectionOpened' | 'ElectionClosed' | 'ElectionFinalized' | 'ElectionProposalCreated' | 'ElectionProposalSupported' | 'ElectionProposalExecuted';
  title: string;
  description: string;
  account?: string;
  electionId?: number;
  candidateId?: number;
  weight?: string;
  timestamp: number;
  txHash?: string;
  blockNumber?: number;
}

