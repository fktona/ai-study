
import React, { useState, useMemo } from 'react';
import { X, Repeat, Loader2, CheckCircle } from 'lucide-react';

interface P2PModalProps {
    isOpen: boolean;
    onClose: () => void;
    userBalance: number;
    onConvert: (amount: number) => void;
}

const CONVERSION_RATE = 0.05; // 1 $STUDY = $0.05 USD

const P2PModal: React.FC<P2PModalProps> = ({ isOpen, onClose, userBalance, onConvert }) => {
    const [amount, setAmount] = useState('');
    const [withdrawalDetails, setWithdrawalDetails] = useState('');
    const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
    const [error, setError] = useState('');

    const numericAmount = parseFloat(amount) || 0;
    const usdValue = useMemo(() => (numericAmount * CONVERSION_RATE).toFixed(2), [numericAmount]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setAmount(value);
            if (parseFloat(value) > userBalance) {
                setError('Amount exceeds your balance.');
            } else {
                setError('');
            }
        }
    };

    const handleSetMax = () => {
        setAmount(String(userBalance));
        setError('');
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (numericAmount <= 0 || numericAmount > userBalance || !withdrawalDetails.trim()) {
            setError('Please fill all fields correctly.');
            return;
        }
        setStatus('processing');
        setError('');
        // Simulate API call
        setTimeout(() => {
            onConvert(numericAmount);
            setStatus('success');
            setTimeout(() => {
                handleClose();
            }, 2500);
        }, 1500);
    };
    
    const handleClose = () => {
        setAmount('');
        setWithdrawalDetails('');
        setStatus('idle');
        setError('');
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col animate-fade-in">
                <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-500">P2P Currency Conversion</h2>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10">
                        <X size={20} />
                    </button>
                </header>

                {status === 'success' ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                        <h3 className="text-2xl font-bold">Conversion Successful!</h3>
                        <p className="text-slate-600 dark:text-gray-300">
                            You have successfully converted {numericAmount.toLocaleString()} $STUDY to ${usdValue}. The funds are on their way.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                        <div>
                            <div className="flex justify-between items-baseline">
                                <label htmlFor="amount" className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-1">
                                    $STUDY Amount to Convert
                                </label>
                                <span className="text-xs text-slate-500 dark:text-gray-400">
                                    Balance: {userBalance.toLocaleString()}
                                </span>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="amount"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    placeholder="0.0"
                                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/20 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition pr-16"
                                />
                                <button
                                    type="button"
                                    onClick={handleSetMax}
                                    className="absolute inset-y-0 right-0 my-1.5 mr-1.5 px-2 text-xs font-semibold text-blue-600 dark:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-md"
                                >
                                    MAX
                                </button>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 h-5">
                                You will receive: <span className="font-semibold text-emerald-600 dark:text-emerald-400">${usdValue} USD</span>
                            </p>
                        </div>
                        <div>
                            <label htmlFor="withdrawal-details" className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-1">
                                Withdrawal Details (e.g., Bank Account, PayPal)
                            </label>
                            <input
                                type="text"
                                id="withdrawal-details"
                                value={withdrawalDetails}
                                onChange={(e) => setWithdrawalDetails(e.target.value)}
                                placeholder="Enter your account info"
                                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/20 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        
                        <p className="text-xs text-slate-400 dark:text-gray-500 text-center">
                            Conversion rate: 1 $STUDY = ${CONVERSION_RATE} USD. Transactions are processed by a third-party P2P provider.
                        </p>

                        <button
                            type="submit"
                            disabled={status === 'processing' || !!error || numericAmount <= 0 || !withdrawalDetails.trim()}
                            className="mt-2 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'processing' ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} /> Processing...
                                </>
                            ) : (
                                <>
                                    <Repeat size={18} /> Confirm Conversion
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default P2PModal;
