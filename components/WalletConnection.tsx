import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import {
  Copy,
  Check,
  Wallet,
  AlertCircle,
  ExternalLink,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const WalletConnection: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);

  const handleConnect = () => {
    connect({ connector: injected() });
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

  const openExplorer = () => {
    if (address) {
      window.open(`https://sepolia.basescan.org/address/${address}`, "_blank");
    }
  };

  if (!isConnected) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-2xl p-8 mb-8 shadow-lg">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <Wallet className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Connect your wallet to unlock the full potential of AI Study Nexus
              and start earning rewards
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
              <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Secure
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Your keys, your crypto
              </p>
            </div>
            <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Fast
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Instant transactions
              </p>
            </div>
            <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
              <Globe className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Decentralized
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                No intermediaries
              </p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleConnect}
              disabled={isPending}
              className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet size={20} />
                  Connect MetaMask Wallet
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Sparkles size={14} />
              <span>Powered by Base Sepolia Testnet</span>
              <Sparkles size={14} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 border border-green-200/50 dark:border-green-800/50 rounded-2xl p-6 mb-8 shadow-lg">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-24 h-24 bg-green-500 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <div>
                <h3 className="font-bold text-green-700 dark:text-green-300 text-lg">
                  Wallet Connected
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono bg-white/50 dark:bg-black/20 px-3 py-1 rounded-lg border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400">
                    {formatAddress(address!)}
                  </span>
                  <button
                    onClick={handleCopyAddress}
                    className="group p-2 hover:bg-green-100 dark:hover:bg-green-800/50 rounded-lg transition-all duration-200"
                    title="Copy full address"
                  >
                    {copied ? (
                      <Check
                        size={16}
                        className="text-green-600 dark:text-green-400"
                      />
                    ) : (
                      <Copy
                        size={16}
                        className="text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform"
                      />
                    )}
                  </button>
                  <button
                    onClick={openExplorer}
                    className="group p-2 hover:bg-green-100 dark:hover:bg-green-800/50 rounded-lg transition-all duration-200"
                    title="View on BaseScan"
                  >
                    <ExternalLink
                      size={16}
                      className="text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => disconnect()}
            className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
          >
            <span className="group-hover:hidden">Connected</span>
            <span className="hidden group-hover:inline">Disconnect</span>
            <ArrowRight
              size={14}
              className="group-hover:rotate-180 transition-transform"
            />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-green-600 dark:text-green-400">
          <div className="flex items-center gap-1">
            <Shield size={12} />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={12} />
            <span>Ready</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe size={12} />
            <span>Base Sepolia</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnection;
