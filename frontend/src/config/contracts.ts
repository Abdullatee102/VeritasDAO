import { defineChain } from 'viem';
import { VERITAS_DAO_ABI, VERITAS_TOKEN_ABI } from '../abis';

export const bohrTestnet = defineChain({
  id: 968,
  name: 'Bohr Testnet',
  nativeCurrency: {
    name: 'BOHR',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_BOT_RPC_URL || 'https://rpc.bohr.life'],
    },
    public: {
      http: [import.meta.env.VITE_BOT_RPC_URL || 'https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BohrScan',
      url: import.meta.env.VITE_BOT_EXPLORER_URL || 'https://scan.bohr.life/',
    },
  },
  testnet: true,
});

export const CONTRACT_ADDRESSES = {
  dao: (import.meta.env.VITE_VERITAS_DAO_CONTRACT_ADDRESS || '0xBBa1e3CbaC23E0B25ACa52244858B66Dec9979eb') as `0x${string}`,
  token: (import.meta.env.VITE_VERITAS_GOVERNANCE_TOKEN_ADDRESS || '0xFbe652f579E6c3605269cF4Cd5ce8C660f7ea370') as `0x${string}`,
} as const;

export const CONTRACT_ABIS = {
  dao: VERITAS_DAO_ABI,
  token: VERITAS_TOKEN_ABI,
} as const;

