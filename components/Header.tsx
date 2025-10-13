import React, { useState, useRef, useEffect } from "react";
import { UserProfile, AppState } from "../types";
import {
  LogOut,
  User as UserIcon,
  Users,
  History,
  Menu,
  X,
  Repeat,
  GraduationCap,
  Crown,
  BarChartHorizontal,
  Store,
  PlusCircle,
  LayoutDashboard,
  ChevronDown,
  Copy,
  Check,
  Wallet,
  Trophy,
} from "lucide-react";
import ThemeToggleButton from "./ThemeToggleButton";
import { useContracts } from "../context/ContractContext";
import { useAccount, useDisconnect } from "wagmi";

interface HeaderProps {
  userProfile: UserProfile;
  onDisconnect: () => void;
  onNavigate: (state: AppState) => void;
  onOpenP2PModal: () => void;
}

const DropdownItem = ({
  state,
  icon: Icon,
  label,
  onNavigate,
}: {
  state: AppState;
  icon: React.ElementType;
  label: string;
  onNavigate: (state: AppState) => void;
}) => (
  <button
    onClick={() => onNavigate(state)}
    className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-white/10 text-sm text-slate-700 dark:text-gray-200 transition-colors"
  >
    <Icon size={18} className="text-slate-500 dark:text-gray-400" /> {label}
  </button>
);

const Header: React.FC<HeaderProps> = ({
  userProfile,
  onDisconnect,
  onNavigate,
  onOpenP2PModal,
}) => {
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { tokenBalance, tokenSymbol } = useContracts();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (state: AppState) => {
    onNavigate(state);
    setProfileMenuOpen(false);
  };

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 dark:bg-black/30 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo */}
          <div
            onClick={() => handleNavigate(AppState.DASHBOARD)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <GraduationCap className="text-blue-500" size={28} />
            <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 hidden sm:block">
              Nexus
            </span>
          </div>

          {/* Center: New Session CTA */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => handleNavigate(AppState.SETUP)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold py-2.5 px-5 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300"
            >
              <PlusCircle size={20} />
              <span className="hidden md:inline">New Session</span>
            </button>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-2">
            {/* Wallet Address Display */}
            {isConnected && address && (
              <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-white/10 rounded-lg px-3 py-1.5">
                <Wallet
                  size={14}
                  className="text-slate-500 dark:text-gray-400"
                />
                <span className="text-sm font-mono text-slate-700 dark:text-gray-300">
                  {formatAddress(address)}
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-white/20 rounded transition-colors"
                  title="Copy full address"
                >
                  {copied ? (
                    <Check
                      size={12}
                      className="text-green-600 dark:text-green-400"
                    />
                  ) : (
                    <Copy
                      size={12}
                      className="text-slate-500 dark:text-gray-400"
                    />
                  )}
                </button>
              </div>
            )}

            <ThemeToggleButton />

            <div ref={profileMenuRef} className="relative">
              <button
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors"
              >
                <img
                  src={userProfile.profilePictureUrl}
                  alt="Profile"
                  className="w-9 h-9 rounded-full border-2 border-slate-200 dark:border-white/20"
                />
                {userProfile.subscription === "premium" && (
                  <Crown
                    size={16}
                    className="text-amber-400 -ml-3 mt-5 absolute"
                  />
                )}
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-slate-200 dark:border-white/10 z-20 animate-fade-in-down overflow-hidden">
                  <div className="p-4 border-b border-slate-200 dark:border-white/10">
                    <p className="font-semibold text-sm">{userProfile.bns}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      {parseFloat(tokenBalance).toLocaleString()} {tokenSymbol}
                    </p>
                    {address && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-gray-400">
                          Wallet:
                        </span>
                        <span className="text-xs font-mono text-slate-600 dark:text-gray-300">
                          {formatAddress(address)}
                        </span>
                        <button
                          onClick={handleCopyAddress}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-white/20 rounded transition-colors"
                          title="Copy full address"
                        >
                          {copied ? (
                            <Check
                              size={10}
                              className="text-green-600 dark:text-green-400"
                            />
                          ) : (
                            <Copy
                              size={10}
                              className="text-slate-500 dark:text-gray-400"
                            />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  <nav className="py-2">
                    <DropdownItem
                      state={AppState.DASHBOARD}
                      icon={LayoutDashboard}
                      label="Study Hub"
                      onNavigate={handleNavigate}
                    />
                    <DropdownItem
                      state={AppState.PROFILE}
                      icon={UserIcon}
                      label="My Profile"
                      onNavigate={handleNavigate}
                    />
                    <DropdownItem
                      state={AppState.HISTORY}
                      icon={History}
                      label="Session History"
                      onNavigate={handleNavigate}
                    />
                  </nav>
                  <div className="py-2 border-t border-slate-200 dark:border-white/10">
                    <DropdownItem
                      state={AppState.MARKETPLACE}
                      icon={Store}
                      label="Marketplace"
                      onNavigate={handleNavigate}
                    />
                    <DropdownItem
                      state={AppState.TOKEN_SHOP}
                      icon={PlusCircle}
                      label="Token Shop"
                      onNavigate={handleNavigate}
                    />
                    <DropdownItem
                      state={AppState.STAKING}
                      icon={BarChartHorizontal}
                      label="Staking"
                      onNavigate={handleNavigate}
                    />
                    <DropdownItem
                      state={AppState.REWARD_DASHBOARD}
                      icon={Trophy}
                      label="Reward Dashboard"
                      onNavigate={handleNavigate}
                    />
                    <DropdownItem
                      state={AppState.COMMUNITY}
                      icon={Users}
                      label="Community"
                      onNavigate={handleNavigate}
                    />
                  </div>
                  <div className="py-2 border-t border-slate-200 dark:border-white/10">
                    <button
                      onClick={onOpenP2PModal}
                      className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-white/10 text-sm text-slate-700 dark:text-gray-200 transition-colors"
                    >
                      <Repeat
                        size={18}
                        className="text-slate-500 dark:text-gray-400"
                      />{" "}
                      P2P Conversion
                    </button>
                    <button
                      onClick={onDisconnect}
                      className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={18} /> Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
