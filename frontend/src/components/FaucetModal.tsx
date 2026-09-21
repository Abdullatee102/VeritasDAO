import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Coins, X, CheckCircle2, AlertCircle, Loader2, ExternalLink, Sparkles } from 'lucide-react';
import { useVeritasDAO } from '../hooks/useVeritasDAO';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../config/contracts';

interface FaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FaucetModal: React.FC<FaucetModalProps> = ({ isOpen, onClose }) => {
  const { isConnected } = useAccount();
  const { writeContractAsync, refetchAll, formattedTokenBalance } = useVeritasDAO();

  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClaim = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      setTxHash(null);

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.token,
        abi: CONTRACT_ABIS.token,
        functionName: 'claimFaucet',
      });

      setTxHash(hash);
      setTimeout(() => {
        refetchAll();
      }, 3000);
    } catch (err: any) {
      console.error('Faucet claim error:', err);
      setErrorMsg(err?.shortMessage || err?.message || 'Failed to claim faucet tokens.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md p-6 bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Decorative emerald gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-dark-hover transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Claim Governance Tokens
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            </h3>
            <p className="text-xs text-gray-400">VeritasDAO Public Testnet Faucet</p>
          </div>
        </div>

        {/* Body Info */}
        <div className="space-y-3 mb-6">
          <div className="p-3.5 bg-dark-surface/80 rounded-xl border border-dark-border text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400">Token Asset:</span>
              <span className="font-semibold text-emerald-400">Veritas Governance Token ($VRT)</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400">Claim Amount:</span>
              <span className="font-bold text-white">100.00 VRT</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Your Current Balance:</span>
              <span className="font-mono text-gray-200">{formattedTokenBalance} VRT</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Holding $VRT determines your exact voting weight in all VeritasDAO sequential elections. Tokens are minted directly on the Bohr Testnet.
          </p>

          {/* Success State */}
          {txHash && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium text-emerald-300">100 VRT Successfully Claimed!</p>
                <a
                  href={`https://scan.bohr.life/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-emerald-400 underline hover:text-emerald-300"
                >
                  View on BohrScan <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Error State */}
          {errorMsg && (
            <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Claim Failed</p>
                <p className="text-red-400/90">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          disabled={!isConnected || isLoading}
          onClick={handleClaim}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl transition-all shadow-glow-subtle cursor-pointer active:scale-98"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Minting 100 VRT...</span>
            </>
          ) : (
            <>
              <Coins className="w-5 h-5" />
              <span>Claim 100 VRT Free</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

