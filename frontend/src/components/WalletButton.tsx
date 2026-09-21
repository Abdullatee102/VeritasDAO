import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { Wallet, LogOut, ChevronDown, AlertCircle, ShieldCheck } from 'lucide-react';
import { bohrTestnet } from '../config/contracts';

export const WalletButton: React.FC = () => {
  const { open } = useAppKit();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();

  const isCorrectNetwork = chain?.id === bohrTestnet.id;

  if (!isConnected || !address) {
    return (
      <button
        onClick={() => open()}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-emerald-600 rounded-xl hover:bg-emerald-500 active:scale-95 shadow-glow-subtle cursor-pointer"
      >
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </button>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <button
        onClick={() => open({ view: 'Networks' })}
        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-300 bg-amber-950/70 border border-amber-500/30 rounded-xl hover:bg-amber-900/60 active:scale-95 cursor-pointer animate-pulse"
      >
        <AlertCircle className="w-4 h-4 text-amber-400" />
        <span>Switch to Bohr Testnet</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Network badge */}
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 rounded-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Bohr Testnet</span>
      </div>

      {/* Account pill */}
      <button
        onClick={() => open({ view: 'Account' })}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-200 bg-dark-card border border-dark-border rounded-xl hover:border-emerald-500/40 transition-all cursor-pointer"
      >
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {/* Disconnect button */}
      <button
        onClick={() => disconnect()}
        title="Disconnect Wallet"
        className="p-2 text-gray-400 hover:text-red-400 bg-dark-card border border-dark-border rounded-xl hover:border-red-500/30 transition-all cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};

