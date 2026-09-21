import React from 'react';
import { ShieldCheck, ExternalLink, Globe, Cpu, Lock } from 'lucide-react';
import { CONTRACT_ADDRESSES } from '../config/contracts';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-dark-surface border-t border-dark-border py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Veritas<span className="text-emerald-400">DAO</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              Transparent On-Chain Governance & Sequential Election Platform.
              Register once, hold governance tokens, vote with token weight, and preserve immutable historical records on Bohr Testnet.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400/90 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Network: Bohr Testnet (Chain ID 968)</span>
            </div>
          </div>

          {/* Smart Contracts */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              Smart Contracts
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>
                <a
                  href={`https://scan.bohr.life/address/${CONTRACT_ADDRESSES.dao}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <span>VeritasDAO Core</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href={`https://scan.bohr.life/address/${CONTRACT_ADDRESSES.token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <span>Veritas Token (VRT)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://scan.bohr.life/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <span>Bohr Explorer</span>
                  <Globe className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Governance Rules */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Governance Rules
            </h4>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• Register Once Model</li>
              <li>• Token Balance Voting Weight</li>
              <li>• Isolated Candidate Sets</li>
              <li>• Deterministic Tie Resolution</li>
              <li>• Immutable Election Archive</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-dark-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 VeritasDAO. Verified On-Chain Governance.</p>
          <div className="flex items-center gap-4">
            <span>Solidity 0.8.28</span>
            <span>•</span>
            <span>Foundry</span>
            <span>•</span>
            <span>Viem & Wagmi v2</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

