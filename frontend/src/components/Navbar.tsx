import React, { useState } from 'react';
import { ShieldCheck, Vote, History, BarChart3, Activity, UserPlus, Coins, Menu, X, Crown, LayoutDashboard, Compass } from 'lucide-react';
import { WalletButton } from './WalletButton';
import { FaucetModal } from './FaucetModal';
import { useVeritasDAO } from '../hooks/useVeritasDAO';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { isRegistered, formattedTokenBalance, isChairman } = useVeritasDAO();
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'register', label: 'Register', icon: UserPlus, badge: isRegistered ? 'Active' : undefined },
    { id: 'elections', label: 'Elections', icon: Vote },
    { id: 'history', label: 'History', icon: History },
    { id: 'governance', label: 'Governance', icon: BarChart3 },
    { id: 'activity', label: 'Activity', icon: Activity },
    ...(isChairman ? [{ id: 'chairman', label: 'Chairman Hub', icon: Crown, isSpecial: true }] : []),
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-dark-bg/90 backdrop-blur-md border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-glow-subtle group-hover:scale-105 transition-all">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  Veritas<span className="text-emerald-400">DAO</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-emerald-500/80 font-semibold font-mono">
                  Governance & Elections
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'text-white bg-emerald-950/80 border border-emerald-500/30 shadow-glow-subtle'
                        : item.isSpecial
                        ? 'text-amber-300 hover:text-white bg-amber-950/40 border border-amber-500/30 hover:bg-amber-900/40'
                        : 'text-gray-300 hover:text-white hover:bg-dark-hover'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : item.isSpecial ? 'text-amber-400' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 bg-emerald-950 border border-emerald-500/30 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Faucet Trigger */}
              <button
                onClick={() => setIsFaucetOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 rounded-xl hover:bg-emerald-900/50 hover:border-emerald-400/50 transition-all cursor-pointer"
                title="Get Free Testnet VRT"
              >
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>Faucet</span>
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-emerald-500/20 rounded font-mono text-emerald-200">
                  {formattedTokenBalance} VRT
                </span>
              </button>

              {/* Wallet Button */}
              <WalletButton />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white bg-dark-card border border-dark-border rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-dark-surface border-b border-dark-border px-4 py-4 space-y-2 animate-fadeIn">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white bg-emerald-950/80 border border-emerald-500/40'
                      : 'text-gray-300 hover:bg-dark-hover'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-300 bg-emerald-950 border border-emerald-500/30 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
            <button
              onClick={() => {
                setIsFaucetOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 rounded-xl"
            >
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>Claim Testnet VRT ({formattedTokenBalance} VRT)</span>
            </button>
          </div>
        )}
      </header>

      {/* Faucet Modal */}
      <FaucetModal isOpen={isFaucetOpen} onClose={() => setIsFaucetOpen(false)} />
    </>
  );
};

