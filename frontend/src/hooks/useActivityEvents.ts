import { useState, useEffect } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { bohrTestnet, CONTRACT_ADDRESSES } from '../config/contracts';
import { ActivityEvent } from '../types';

export function useActivityEvents() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchLogs() {
      try {
        const client = createPublicClient({
          chain: bohrTestnet,
          transport: http(import.meta.env.VITE_BOT_RPC_URL || 'https://rpc.bohr.life'),
        });

        const currentBlock = await client.getBlockNumber();
        const fromBlock = currentBlock > 5000n ? currentBlock - 5000n : 0n;

        // Fetch VoteCast events
        const voteLogs = await client.getLogs({
          address: CONTRACT_ADDRESSES.dao,
          event: parseAbiItem('event VoteCast(uint256 indexed electionId, address indexed voter, uint256 indexed candidateId, uint256 weight, uint256 timestamp)'),
          fromBlock,
          toBlock: 'latest',
        });

        // Fetch ElectionCreated events
        const createdLogs = await client.getLogs({
          address: CONTRACT_ADDRESSES.dao,
          event: parseAbiItem('event ElectionCreated(uint256 indexed electionId, string title, uint256 startTime, uint256 endTime, address indexed creator, uint256 timestamp)'),
          fromBlock,
          toBlock: 'latest',
        });

        // Fetch ElectionFinalized events
        const finalizedLogs = await client.getLogs({
          address: CONTRACT_ADDRESSES.dao,
          event: parseAbiItem('event ElectionFinalized(uint256 indexed electionId, uint256 winnerCandidateId, uint256 winningVoteWeight, bool isTie, uint256 timestamp)'),
          fromBlock,
          toBlock: 'latest',
        });

        // Fetch VoterRegistered events
        const registerLogs = await client.getLogs({
          address: CONTRACT_ADDRESSES.dao,
          event: parseAbiItem('event VoterRegistered(address indexed voter, uint256 timestamp)'),
          fromBlock,
          toBlock: 'latest',
        });

        const parsedEvents: ActivityEvent[] = [];

        for (const log of voteLogs) {
          const args = log.args as any;
          parsedEvents.push({
            id: `vote-${log.transactionHash}-${log.logIndex}`,
            type: 'VoteCast',
            title: 'Vote Cast On-Chain',
            description: `Voter ${args.voter ? `${args.voter.slice(0, 6)}...${args.voter.slice(-4)}` : 'Unknown'} voted for Candidate #${args.candidateId?.toString()}`,
            account: args.voter,
            electionId: Number(args.electionId),
            candidateId: Number(args.candidateId),
            weight: args.weight ? (Number(args.weight) / 1e18).toLocaleString() : undefined,
            timestamp: Number(args.timestamp || Date.now() / 1000),
            txHash: log.transactionHash,
            blockNumber: Number(log.blockNumber),
          });
        }

        for (const log of createdLogs) {
          const args = log.args as any;
          parsedEvents.push({
            id: `created-${log.transactionHash}-${log.logIndex}`,
            type: 'ElectionCreated',
            title: 'Election Created',
            description: `"${args.title}" created on-chain by organizer`,
            account: args.creator,
            electionId: Number(args.electionId),
            timestamp: Number(args.timestamp || Date.now() / 1000),
            txHash: log.transactionHash,
            blockNumber: Number(log.blockNumber),
          });
        }

        for (const log of finalizedLogs) {
          const args = log.args as any;
          parsedEvents.push({
            id: `finalized-${log.transactionHash}-${log.logIndex}`,
            type: 'ElectionFinalized',
            title: 'Election Finalized & Result Sealed',
            description: args.isTie
              ? `Election #${args.electionId} concluded in a Tie (Winning Weight: ${(Number(args.winningVoteWeight) / 1e18).toLocaleString()} VRT)`
              : `Election #${args.electionId} finalized: Candidate #${args.winnerCandidateId} declared Winner!`,
            electionId: Number(args.electionId),
            candidateId: Number(args.winnerCandidateId),
            weight: args.winningVoteWeight ? (Number(args.winningVoteWeight) / 1e18).toLocaleString() : undefined,
            timestamp: Number(args.timestamp || Date.now() / 1000),
            txHash: log.transactionHash,
            blockNumber: Number(log.blockNumber),
          });
        }

        for (const log of registerLogs) {
          const args = log.args as any;
          parsedEvents.push({
            id: `register-${log.transactionHash}-${log.logIndex}`,
            type: 'VoterRegistered',
            title: 'Voter Registered Once',
            description: `Address ${args.voter ? `${args.voter.slice(0, 6)}...${args.voter.slice(-4)}` : ''} joined VeritasDAO governance roster`,
            account: args.voter,
            timestamp: Number(args.timestamp || Date.now() / 1000),
            txHash: log.transactionHash,
            blockNumber: Number(log.blockNumber),
          });
        }

        // Sort reverse chronological
        parsedEvents.sort((a, b) => b.timestamp - a.timestamp);

        if (isMounted) {
          setEvents(parsedEvents);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching on-chain activity events:', err);
        if (isMounted) setIsLoading(false);
      }
    }

    fetchLogs();
    const interval = setInterval(fetchLogs, 12_000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { events, isLoading };
}

