import React, { useState } from "react";
import {
  Wallet,
  ArrowRight,
  Shield,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { MetaMaskIcon, CoinbaseIcon } from "./icons/icons";
import { useConnect, useAccount } from "wagmi";
import { injected } from "wagmi/connectors";

interface ConnectWalletScreenProps {
  onConnect: (address: string) => void;
}

const ConnectWalletScreen: React.FC<ConnectWalletScreenProps> = ({
  onConnect,
}) => {
  const { connect, connectors, isPending, error } = useConnect();
  const { address, isConnected } = useAccount();
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle successful connection
  React.useEffect(() => {
    if (isConnected && address) {
      onConnect(address);
    }
  }, [isConnected, address, onConnect]);

  const handleConnect = async (connector?: any) => {
    try {
      setIsConnecting(true);
      const targetConnector = connector || injected();
      await connect({ connector: targetConnector });
    } catch (err) {
      console.error("Connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const getWalletIcon = (connectorName: string) => {
    switch (connectorName) {
      case "MetaMask":
        return <MetaMaskIcon className="w-8 h-8" />;
      case "Coinbase Wallet":
        return <CoinbaseIcon className="w-8 h-8" />;
      default:
        return <Wallet className="w-8 h-8" />;
    }
  };

  const getWalletDescription = (connectorName: string) => {
    switch (connectorName) {
      case "MetaMask":
        return "Popular browser wallet";
      case "Coinbase Wallet":
        return "Base ecosystem wallet";
      default:
        return "Connect your wallet";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Connect Wallet
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Choose your wallet to access AI Study Nexus
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm">AI-powered tutoring</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm">Earn tokens for studying</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm">NFT achievements</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  Connection Failed
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {error.message}
                </p>
              </div>
            </div>
          )}

          {/* Wallet Options Grid */}
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => handleConnect(connector)}
                disabled={isPending || isConnecting}
                className="group bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-700 rounded-xl p-6 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 bg-white dark:bg-slate-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  {getWalletIcon(connector.name)}
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {connector.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {getWalletDescription(connector.name)}
                  </div>
                </div>
                {isPending || isConnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                )}
              </button>
            ))}
          </div>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your wallet connection is secure. We never access your private
                keys.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600/50">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Base Sepolia</span>
              <button
                onClick={() =>
                  window.open("https://bridge.base.org/deposit", "_blank")
                }
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectWalletScreen;
