import React, { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useStudyToken } from "../hooks/useStudyToken";
import {
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { parseEther, formatEther } from "viem";
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from "@/lib/contracts";

// Contract configuration
const SHOP_ADDRESS = CONTRACT_ADDRESSES.baseSepolia.StudyTokenShop;
const SHOP_ABI = CONTRACT_ABIS.StudyTokenShop;

interface TokenShopProps {
  onNavigateBack?: () => void;
}

const TokenShop: React.FC<TokenShopProps> = ({ onNavigateBack }) => {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { balance } = useStudyToken();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Log when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && hash) {
      console.log("✅ Transaction confirmed:", hash);
      console.log("🎉 Purchase successful!");
      // Show success message
      setPurchaseSuccess(true);
      // Hide success message after 5 seconds
      setTimeout(() => setPurchaseSuccess(false), 5000);
    }
  }, [isConfirmed, hash]);

  const [ethAmount, setEthAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [ethPriceLoading, setEthPriceLoading] = useState(true);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Read price info from contract
  const { data: priceInfo, refetch: refetchPrice } = useReadContract({
    address: SHOP_ADDRESS as `0x${string}`,
    abi: SHOP_ABI,
    functionName: "getPriceInfo",
  });

  // Parse price info from array format
  const parsedPriceInfo = priceInfo
    ? {
        price: priceInfo[0],
        tokensPerEth: priceInfo[1],
        dailyVol: priceInfo[2],
        dailyPurchasesCount: priceInfo[3],
        timeUntilReset: priceInfo[4],
      }
    : null;

  // Read quote for current amount
  const { data: quote } = useReadContract({
    address: SHOP_ADDRESS as `0x${string}`,
    abi: SHOP_ABI,
    functionName: "getQuote",
    args: ethAmount ? [parseEther(ethAmount)] : undefined,
  });

  // Manual calculation as fallback
  const manualQuote =
    parsedPriceInfo && ethAmount
      ? parseFloat(ethAmount) / parseFloat(formatEther(parsedPriceInfo.price))
      : 0;

  console.log("Quote debug:", {
    ethAmount,
    quote,
    quoteType: typeof quote,
    quoteString: quote?.toString(),
    parsedPriceInfo,
    manualQuote,
  });

  console.log("Manual quote calculation:", {
    ethAmount: parseFloat(ethAmount || "0"),
    tokenPrice: parseFloat(formatEther(parsedPriceInfo?.price || 0n)),
    manualQuote,
  });

  // Fetch ETH price
  const fetchEthPrice = async () => {
    try {
      setEthPriceLoading(true);
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const data = await response.json();
      setEthPrice(data.ethereum.usd);
    } catch (error) {
      console.error("Error fetching ETH price:", error);
    } finally {
      setEthPriceLoading(false);
    }
  };

  // Auto-refresh price info every 30 seconds
  useEffect(() => {
    fetchEthPrice();
    const interval = setInterval(() => {
      refetchPrice();
      fetchEthPrice();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchPrice]);

  const handleBuyTokens = async () => {
    if (!ethAmount || !address) return;

    try {
      setIsLoading(true);
      console.log("Attempting to buy tokens:", {
        ethAmount,
        value: parseEther(ethAmount).toString(),
        contractAddress: SHOP_ADDRESS,
        userAddress: address,
        expectedTokens: quote?.toString(),
      });

      const result = await writeContract({
        address: SHOP_ADDRESS as `0x${string}`,
        abi: SHOP_ABI,
        functionName: "buyTokens",
        value: parseEther(ethAmount),
      } as any);

      console.log("Purchase transaction sent:", result);
    } catch (err: any) {
      console.error("Error buying tokens:", err);
      console.error("Error details:", {
        message: err.message,
        code: err.code,
        reason: err.reason,
        data: err.data,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: bigint) => {
    const hours = Math.floor(Number(seconds) / 3600);
    const minutes = Math.floor((Number(seconds) % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Calculate USD values
  const calculateUsdValue = (ethAmount: number) => {
    if (!ethPrice) return null;
    return ethAmount * ethPrice;
  };

  const formatUsd = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getPriceTrend = () => {
    if (!parsedPriceInfo) return null;
    const volume = Number(parsedPriceInfo.dailyVol);
    if (volume >= 50) return "up";
    if (volume <= 5) return "down";
    return "stable";
  };

  const priceTrend = getPriceTrend();

  if (!isConnected) {
    return (
      <div className="w-full max-w-4xl bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-200 dark:border-white/10 flex flex-col gap-6 animate-fade-in">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Wallet Not Connected
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Please connect your wallet to purchase STUDY tokens
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-200 dark:border-white/10 flex flex-col gap-6 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center gap-3">
            <ShoppingCart className="text-blue-500" />
            Token Shop
          </h1>
          <p className="text-slate-500 dark:text-sky-200 mt-1">
            Buy STUDY tokens with Base ETH at market-driven prices
          </p>
        </div>
        {onNavigateBack && (
          <button
            onClick={onNavigateBack}
            className="flex items-center gap-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            ← Back
          </button>
        )}
      </header>

      {/* Price Information */}
      {parsedPriceInfo ? (
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                Current Price
              </span>
              {priceTrend === "up" && (
                <TrendingUp className="w-4 h-4 text-green-500" />
              )}
              {priceTrend === "down" && (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {parsedPriceInfo ? formatEther(parsedPriceInfo.price) : "0.000"}{" "}
              ETH
            </p>
            {ethPrice && parsedPriceInfo && (
              <p className="text-lg font-semibold text-blue-500 dark:text-blue-300">
                {formatUsd(
                  calculateUsdValue(
                    parseFloat(formatEther(parsedPriceInfo.price))
                  )!
                )}
              </p>
            )}
            {ethPriceLoading && (
              <p className="text-sm text-blue-400 dark:text-blue-500">
                <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                Loading USD price...
              </p>
            )}
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {parsedPriceInfo ? parsedPriceInfo.tokensPerEth.toString() : "0"}{" "}
              STUDY per ETH
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-green-700 dark:text-green-300">
                Daily Volume
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {parsedPriceInfo
                ? formatEther(parsedPriceInfo.dailyVol)
                : "0.000"}{" "}
              ETH
            </p>
            {ethPrice && parsedPriceInfo && (
              <p className="text-lg font-semibold text-green-500 dark:text-green-300">
                {formatUsd(
                  calculateUsdValue(
                    parseFloat(formatEther(parsedPriceInfo.dailyVol))
                  )!
                )}
              </p>
            )}
            <p className="text-sm text-green-600 dark:text-green-400">
              {parsedPriceInfo
                ? parsedPriceInfo.dailyPurchasesCount.toString()
                : "0"}{" "}
              purchases today
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <span className="font-semibold text-purple-700 dark:text-purple-300">
                Price Reset
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {parsedPriceInfo
                ? formatTime(parsedPriceInfo.timeUntilReset)
                : "0h 0m"}
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Until next adjustment
            </p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 p-4 rounded-xl border border-slate-200 dark:border-slate-800/30">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Loading Price Info...
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
              ...
            </p>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 p-4 rounded-xl border border-slate-200 dark:border-slate-800/30">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Loading Volume...
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
              ...
            </p>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 p-4 rounded-xl border border-slate-200 dark:border-slate-800/30">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Loading Reset Time...
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
              ...
            </p>
          </div>
        </div>
      )}

      {/* Purchase Form */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 p-6 rounded-xl border border-slate-200 dark:border-slate-800/30">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Purchase STUDY Tokens
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="ethAmount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Amount to Spend (ETH)
            </label>
            <div className="relative">
              <input
                type="number"
                id="ethAmount"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="0.01"
                step="0.001"
                min="0.001"
                className="w-full bg-white dark:bg-black/20 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <span className="absolute right-3 top-3 text-sm text-gray-500 dark:text-gray-400">
                ETH
              </span>
            </div>
          </div>

          {(quote || manualQuote) && ethAmount && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800/30">
              {parseFloat(ethAmount) < 0.01 && (
                <div className="mb-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded text-yellow-800 dark:text-yellow-200 text-sm">
                  ⚠️ Small amounts may result in fewer tokens due to rounding.
                  Try 0.01 ETH or more for better value.
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  You will receive:
                </span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {quote && BigInt(quote.toString()) > 0n
                    ? formatEther(quote.toString())
                    : manualQuote.toFixed(0)}{" "}
                  STUDY
                </span>
              </div>
              {ethPrice && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-blue-500 dark:text-blue-400">
                    Cost:
                  </span>
                  <span className="text-lg font-semibold text-blue-500 dark:text-blue-300">
                    {formatUsd(parseFloat(ethAmount) * ethPrice)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  Rate:
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  1 ETH ={" "}
                  {parsedPriceInfo
                    ? parsedPriceInfo.tokensPerEth.toString()
                    : "0"}{" "}
                  STUDY
                </span>
              </div>

              {/* Debug info - remove in production */}
              <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                <div>
                  Contract Quote:{" "}
                  {quote ? formatEther(quote.toString()) : "N/A"} tokens
                </div>
                <div>Manual Quote: {manualQuote.toFixed(0)} tokens</div>
                <div>ETH Amount: {ethAmount}</div>
                <div>
                  Token Price:{" "}
                  {parsedPriceInfo ? formatEther(parsedPriceInfo.price) : "N/A"}{" "}
                  ETH
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleBuyTokens}
            disabled={
              !ethAmount ||
              parseFloat(ethAmount) < 0.001 ||
              isLoading ||
              isPending ||
              isConfirming
            }
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isLoading || isPending || isConfirming ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isPending
                  ? "Confirming..."
                  : isConfirming
                  ? "Processing..."
                  : "Buying..."}
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Buy STUDY Tokens
              </>
            )}
          </button>

          {isConfirmed && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-700 dark:text-green-300 font-semibold">
                  Purchase successful! Your tokens have been added to your
                  wallet.
                </span>
              </div>
              {hash && (
                <div className="text-sm text-green-600 dark:text-green-400">
                  Transaction:
                  <a
                    href={`https://sepolia.basescan.org/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 underline hover:text-green-800 dark:hover:text-green-300"
                  >
                    {hash.slice(0, 10)}...{hash.slice(-8)}
                  </a>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800/30 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 dark:text-red-300">
                Error: {error.message}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Information Panel */}
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/30">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">
              Dynamic Pricing Information
            </h3>
            <ul className="text-sm text-amber-600 dark:text-amber-400 space-y-1">
              <li>• Prices adjust automatically based on daily demand</li>
              <li>• High volume (≥50 ETH) increases price by 10%</li>
              <li>• Low volume (≤5 ETH) decreases price by 10%</li>
              <li>• Prices reset daily with slight overnight decay</li>
              <li>• Minimum purchase: 0.001 ETH</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenShop;
