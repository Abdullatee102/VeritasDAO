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
      <header className="sticky top-0 z-40 w-full bg-[#0B0F17]/95 backdrop-blur-md border-b border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
            {/* Brand Logo */}
            <div
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0 select-none"
            >
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1">
                  Veritas<span className="text-emerald-400">DAO</span>
                </span>
                <span className="hidden xs:inline-block text-[9px] sm:text-[10px] uppercase tracking-widest text-emerald-400/80 font-semibold font-mono">
                  Governance & Elections
                </span>
              </div>
            </div>

            {/* Desktop Navigation (large screens & laptops) */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs lg:text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'text-white bg-emerald-950/80 border border-emerald-500/40 shadow-sm'
                        : item.isSpecial
                        ? 'text-amber-300 hover:text-white bg-amber-950/40 border border-amber-500/30 hover:bg-amber-900/40'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : item.isSpecial ? 'text-amber-400' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 text-[9px] font-semibold text-emerald-300 bg-emerald-950 border border-emerald-500/30 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Faucet Trigger (Visible on tablet & desktop, hidden on tiny mobile) */}
              <button
                onClick={() => setIsFaucetOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 rounded-xl hover:bg-emerald-900/60 hover:border-emerald-400/50 transition-all cursor-pointer active:scale-95"
                title="Get Free Testnet VRT"
              >
                <Coins className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden lg:inline">Faucet</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/20 rounded font-mono text-emerald-200">
                  {formattedTokenBalance} VRT
                </span>
              </button>

              {/* Wallet Button */}
              <WalletButton />

              {/* Mobile / Tablet Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Menu"
                className="xl:hidden p-2 text-gray-300 hover:text-white bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl transition-colors cursor-pointer active:scale-95"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Drawer Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#0B0F17]/98 border-b border-gray-800 px-4 pt-3 pb-5 space-y-2 animate-fadeIn shadow-2xl">
            {/* Quick Faucet Claim in Drawer for Mobile Users */}
            <button
              onClick={() => {
                setIsFaucetOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 rounded-xl active:bg-emerald-900/80 transition-colors mb-2"
            >
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>Claim Testnet $VRT Faucet</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 rounded font-mono text-emerald-200 font-bold">
                {formattedTokenBalance} VRT
              </span>
            </button>

            {/* Nav Items List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'text-white bg-emerald-950/80 border border-emerald-500/40 shadow-sm'
                        : item.isSpecial
                        ? 'text-amber-300 bg-amber-950/40 border border-amber-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/60 bg-gray-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : item.isSpecial ? 'text-amber-400' : 'text-gray-400'}`} />
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
            </div>
          </div>
        )}
      </header>

      {/* Faucet Modal */}
      <FaucetModal isOpen={isFaucetOpen} onClose={() => setIsFaucetOpen(false)} />
    </>
  );
};
