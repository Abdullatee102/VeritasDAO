import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { UserPlus, CheckCircle2, ShieldCheck, AlertCircle, Coins, ArrowRight, Loader2, ExternalLink, Sparkles } from 'lucide-react';
import { useVeritasDAO } from '../hooks/useVeritasDAO';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../config/contracts';
import { FaucetModal } from '../components/FaucetModal';

interface RegisterPageProps {
  onNavigate: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { address, isConnected } = useAccount();
  const { isRegistered, formattedTokenBalance, tokenBalance, writeContractAsync, refetchAll } = useVeritasDAO();

  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      setTxHash(null);

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.dao,
        abi: CONTRACT_ABIS.dao,
        functionName: 'registerVoter',
      });

      setTxHash(hash);
      setTimeout(() => {
        refetchAll();
      }, 3000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMsg(err?.shortMessage || err?.message || 'Failed to complete registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      {/* Page Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
          <UserPlus className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Voter Onboarding Portal</h1>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Register once to establish your cryptographic voter eligibility across all sequential VeritasDAO elections.
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="p-8 bg-dark-card border border-dark-border rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* State 1: Already Registered */}
        {isRegistered ? (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">You Are Already Registered</h3>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                Your wallet address is active in the VeritasDAO voter roster. You do not need to register again for any future elections.
              </p>
            </div>

            <div className="p-4 bg-dark-surface rounded-2xl border border-dark-border max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Registered Wallet:</span>
                <span className="font-mono text-gray-200">{address ? `${address.slice(0, 10)}...${address.slice(-8)}` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Governance Token Balance:</span>
                <span className="font-semibold text-emerald-400 font-mono">{formattedTokenBalance} VRT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Voting Power:</span>
                <span className="font-semibold text-white font-mono">{formattedTokenBalance} Weight</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('elections')}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-glow-subtle cursor-pointer"
              >
                <span>Browse Active Elections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsFaucetOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 rounded-xl transition-all cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span>Claim Faucet Tokens</span>
              </button>
            </div>
          </div>
        ) : (
          /* State 2: Not Registered */
          <div className="space-y-6">
            <div className="p-4 bg-dark-surface rounded-2xl border border-dark-border space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Connected Wallet:</span>
                <span className="font-mono text-gray-200">
                  {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Not Connected'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Governance Balance:</span>
                <span className="font-mono text-emerald-400 font-semibold">{formattedTokenBalance} VRT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Registration Fee:</span>
                <span className="text-white font-semibold">Free (Gas only on Bohr Testnet)</span>
              </div>
            </div>

            {/* Token Balance Notice */}
            {(!tokenBalance || tokenBalance === 0n) && (
              <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-300">No Governance Tokens Found</p>
                  <p className="text-gray-400">
                    You can register now, but to cast a weighted vote in elections, you will need at least some $VRT$ tokens. Claim free tokens via the faucet below!
                  </p>
                  <button
                    onClick={() => setIsFaucetOpen(true)}
                    className="inline-flex items-center gap-1 mt-2 text-emerald-400 font-semibold underline hover:text-emerald-300"
                  >
                    <span>Claim 100 VRT Testnet Faucet</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Transaction Success */}
            {txHash && (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-start gap-3 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-emerald-300">Registration Transaction Submitted!</p>
                  <p className="text-gray-300">Your one-time voter registration is confirmed on Bohr Testnet.</p>
                  <a
                    href={`https://scan.bohr.life/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-400 underline hover:text-emerald-300"
                  >
                    <span>View on BohrScan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Transaction Error */}
            {errorMsg && (
              <div className="p-4 bg-red-950/50 border border-red-500/30 rounded-2xl flex items-start gap-3 text-xs text-red-200">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-300">Registration Failed</p>
                  <p className="text-red-400/90">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              disabled={!isConnected || isLoading}
              onClick={handleRegister}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl transition-all shadow-glow-emerald cursor-pointer active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Confirming On-Chain Registration...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Complete One-Time Registration</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <FaucetModal isOpen={isFaucetOpen} onClose={() => setIsFaucetOpen(false)} />
    </div>
  );
};

