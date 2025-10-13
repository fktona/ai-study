import React, { useState } from "react";
import { X, Send, Copy, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useContracts } from "../context/ContractContext";
import { useAccount } from "wagmi";
import { formatEther, parseEther } from "viem";

interface P2PTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const P2PTransferModal: React.FC<P2PTransferModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { tokenBalance, tokenSymbol, transferTokens } = useContracts();
  const { address } = useAccount();

  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const isValidAmount = (amount: string) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= parseFloat(tokenBalance);
  };

  const handleTransfer = async () => {
    if (!isValidAddress(recipientAddress)) {
      setError("Please enter a valid wallet address");
      return;
    }

    if (!isValidAmount(amount)) {
      setError(
        "Please enter a valid amount (greater than 0 and not exceeding your balance)"
      );
      return;
    }

    if (recipientAddress.toLowerCase() === address?.toLowerCase()) {
      setError("Cannot send tokens to yourself");
      return;
    }

    setIsLoading(true);
    setError("");
    setTransactionHash("");

    try {
      console.log("Starting transfer:", {
        recipientAddress,
        amount,
        tokenBalance,
      });
      const hash = await transferTokens(recipientAddress, amount);
      setTransactionHash(hash);

      // Reset form
      setRecipientAddress("");
      setAmount("");

      console.log("Transfer successful:", hash);
    } catch (err: any) {
      console.error("Transfer failed:", err);
      setError(err.message || "Transfer failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(transactionHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleClose = () => {
    setRecipientAddress("");
    setAmount("");
    setError("");
    setTransactionHash("");
    setCopied(false);
    onClose();
  };

  const handleMaxAmount = () => {
    setAmount(tokenBalance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-500" />
            P2P Token Transfer
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success Message */}
          {transactionHash && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    Transfer Successful!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    Your tokens have been sent successfully.
                  </p>
                </div>
              </div>

              <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/40 rounded-md">
                <p className="text-xs text-green-700 dark:text-green-300 mb-2">
                  Transaction Hash:
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded border flex-1 break-all">
                    {transactionHash}
                  </code>
                  <button
                    onClick={handleCopyHash}
                    className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                    title="Copy hash"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-200">
                    Transfer Failed
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Balance Info */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Available Balance
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {parseFloat(tokenBalance).toLocaleString()} {tokenSymbol}
            </p>
          </div>

          {/* Recipient Address */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Recipient Wallet Address
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              disabled={isLoading}
            />
            {recipientAddress && !isValidAddress(recipientAddress) && (
              <p className="text-xs text-red-500">
                Please enter a valid Ethereum address
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Amount to Send
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.000001"
                min="0"
                className="w-full px-4 py-3 pr-20 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={handleMaxAmount}
                  className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                  disabled={isLoading}
                >
                  MAX
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {tokenSymbol}
                </span>
              </div>
            </div>
            {amount && !isValidAmount(amount) && (
              <p className="text-xs text-red-500">
                Invalid amount. Must be greater than 0 and not exceed your
                balance.
              </p>
            )}
          </div>

          {/* Transfer Summary */}
          {recipientAddress &&
            amount &&
            isValidAddress(recipientAddress) &&
            isValidAmount(amount) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Transfer Summary
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">
                      Amount:
                    </span>
                    <span className="font-medium text-blue-900 dark:text-blue-200">
                      {parseFloat(amount).toLocaleString()} {tokenSymbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">
                      Recipient:
                    </span>
                    <span className="font-medium text-blue-900 dark:text-blue-200 font-mono text-xs">
                      {recipientAddress.slice(0, 6)}...
                      {recipientAddress.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">
                      Your Balance After:
                    </span>
                    <span className="font-medium text-blue-900 dark:text-blue-200">
                      {(
                        parseFloat(tokenBalance) - parseFloat(amount)
                      ).toLocaleString()}{" "}
                      {tokenSymbol}
                    </span>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            disabled={isLoading}
          >
            {transactionHash ? "Close" : "Cancel"}
          </button>
          <button
            onClick={handleTransfer}
            disabled={
              isLoading ||
              !recipientAddress ||
              !amount ||
              !isValidAddress(recipientAddress) ||
              !isValidAmount(amount) ||
              recipientAddress.toLowerCase() === address?.toLowerCase()
            }
            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Tokens
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default P2PTransferModal;
