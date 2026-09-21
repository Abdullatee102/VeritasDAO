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
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white transition-all bg-emerald-600 rounded-xl hover:bg-emerald-500 active:scale-95 shadow-sm cursor-pointer whitespace-nowrap"
      >
        <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        <span>Connect</span>
      </button>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <button
        onClick={() => open({ view: 'Networks' })}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-amber-300 bg-amber-950/80 border border-amber-500/40 rounded-xl hover:bg-amber-900/80 active:scale-95 cursor-pointer animate-pulse whitespace-nowrap"
      >
        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="hidden xs:inline">Switch to</span> Bohr
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      {/* Network indicator (Hidden on small mobile, visible on sm+) */}
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 rounded-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-[11px]">Bohr 968</span>
      </div>

      {/* Account pill */}
      <button
        onClick={() => open({ view: 'Account' })}
        className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-gray-200 bg-gray-900 border border-gray-800 rounded-xl hover:border-emerald-500/40 active:scale-95 transition-all cursor-pointer"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="font-mono text-[11px] sm:text-xs">
          {address.slice(0, 4)}...{address.slice(-3)}
        </span>
        <ChevronDown className="w-3 h-3 text-gray-400 hidden xs:inline" />
      </button>

      {/* Disconnect button */}
      <button
        onClick={() => disconnect()}
        title="Disconnect Wallet"
        aria-label="Disconnect Wallet"
        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 bg-gray-900 border border-gray-800 rounded-xl hover:border-red-500/30 active:scale-95 transition-all cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
};
