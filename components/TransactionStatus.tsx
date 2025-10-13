import React from "react";
import { CheckCircle, AlertCircle, Loader2, XCircle } from "lucide-react";

interface TransactionStatusProps {
  isPending?: boolean;
  isConfirming?: boolean;
  isConfirmed?: boolean;
  error?: Error | null;
  hash?: string;
  successMessage?: string;
  pendingMessage?: string;
  confirmingMessage?: string;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({
  isPending = false,
  isConfirming = false,
  isConfirmed = false,
  error = null,
  hash,
  successMessage = "Transaction confirmed!",
  pendingMessage = "Please confirm transaction in your wallet",
  confirmingMessage = "Transaction is being confirmed...",
}) => {
  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
        <XCircle className="w-5 h-5 text-red-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">Transaction Failed</p>
          <p className="text-xs text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">{successMessage}</p>
          {hash && (
            <a
              href={`https://sepolia.basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:text-green-800 underline"
            >
              View on BaseScan
            </a>
          )}
        </div>
      </div>
    );
  }

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-800">
            {confirmingMessage}
          </p>
          {hash && (
            <a
              href={`https://sepolia.basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              View on BaseScan
            </a>
          )}
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-yellow-600" />
        <p className="text-sm font-medium text-yellow-800">{pendingMessage}</p>
      </div>
    );
  }

  return null;
};

export default TransactionStatus;
