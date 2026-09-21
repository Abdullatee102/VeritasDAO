import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { http } from 'viem';
import { bohrTestnet } from './contracts';

export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'b0ed2f41971704df2800043e6799378c';

export const networks = [bohrTestnet] as any;

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  transports: {
    [bohrTestnet.id]: http(import.meta.env.VITE_BOT_RPC_URL || 'https://rpc.bohr.life'),
  },
});

export const config = wagmiAdapter.wagmiConfig;

// Initialize Reown AppKit
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'VeritasDAO',
    description: 'Decentralized Governance and Sequential Election Platform',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://veritasdao.app',
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#10b981',
    '--w3m-color-mix': '#064e3b',
    '--w3m-color-mix-strength': 25,
    '--w3m-border-radius-master': '12px',
  },
  defaultNetwork: bohrTestnet,
  features: {
    analytics: false,
    email: false,
    socials: [],
  },
});

