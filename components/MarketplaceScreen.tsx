import React, { useState } from 'react';
import { UserProfile, MarketplaceItem } from '../types';
import { MOCK_MARKETPLACE_ITEMS, MARKETPLACE_PLATFORM_FEE } from '../constants';
import { ShoppingCart, CheckCircle, XCircle, X as IconX, Info } from 'lucide-react';

interface PurchaseConfirmationModalProps {
    item: MarketplaceItem;
    onConfirm: () => void;
    onCancel: () => void;
}

const PurchaseConfirmationModal: React.FC<PurchaseConfirmationModalProps> = ({ item, onConfirm, onCancel }) => {
    const platformFee = item.price * MARKETPLACE_PLATFORM_FEE;
    const creatorPayout = item.price - platformFee;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col animate-fade-in">
                <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
                    <h2 className="text-xl font-bold">Confirm Purchase</h2>
                    <button onClick={onCancel} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10"><IconX size={20} /></button>
                </header>
                <div className="p-6 flex flex-col gap-4">
                    <p>You are about to purchase <strong className="text-sky-500">{item.name}</strong> from <strong className="font-mono">{item.creatorBns}</strong>.</p>
                    <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-lg border border-slate-200 dark:border-white/10 space-y-2 text-sm">
                        <div className="flex justify-between"><span>Item Price:</span> <span className="font-semibold">{item.price.toLocaleString()} $STUDY</span></div>
                        <div className="flex justify-between text-slate-500 dark:text-gray-400"><span>Platform Fee ({MARKETPLACE_PLATFORM_FEE * 100}%):</span> <span>{platformFee.toLocaleString()} $STUDY</span></div>
                        <hr className="border-slate-200 dark:border-white/10"/>
                        <div className="flex justify-between font-bold"><span>Total Cost:</span> <span>{item.price.toLocaleString()} $STUDY</span></div>
                    </div>
                     <p className="text-xs text-slate-500 dark:text-gray-400 flex items-start gap-2">
                        <Info size={18} className="flex-shrink-0 mt-0.5"/>
                        <span>Upon confirmation, <strong className="text-emerald-500">{creatorPayout.toLocaleString()} $STUDY</strong> will be sent to the creator. This transaction is final.</span>
                    </p>
                    <button onClick={onConfirm} className="w-full bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300">
                        Confirm & Pay
                    </button>
                </div>
            </div>
        </div>
    );
};


interface MarketplaceItemCardProps {
    item: MarketplaceItem;
    onBuy: (item: MarketplaceItem) => void;
    userBalance: number;
}

const MarketplaceItemCard: React.FC<MarketplaceItemCardProps> = ({ item, onBuy, userBalance }) => {
    const canAfford = userBalance >= item.price;
    return (
        <div className="bg-white dark:bg-white/5 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col">
            <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover"/>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-xs text-slate-500 dark:text-gray-300">by {item.creatorBns}</p>
                <p className="text-sm text-slate-600 dark:text-gray-400 mt-2 flex-grow">{item.description}</p>
                 <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-1 rounded">
                    Creator receives {item.creatorRoyaltyPercent}% of sale price
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <span className="font-bold text-xl text-sky-600 dark:text-sky-400">{item.price} <span className="text-sm text-slate-500 dark:text-gray-300">$STUDY</span></span>
                    <button 
                        onClick={() => onBuy(item)} 
                        disabled={!canAfford}
                        className="flex items-center gap-2 bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-sky-600 transform transition-all duration-200 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 hover:scale-105"
                    >
                        <ShoppingCart size={16} /> Buy
                    </button>
                </div>
            </div>
        </div>
    );
};


interface MarketplaceScreenProps {
  userProfile: UserProfile;
  onUpdateBalance: (newBalance: number) => void;
}

const MarketplaceScreen: React.FC<MarketplaceScreenProps> = ({ userProfile, onUpdateBalance }) => {
    const [items] = useState<MarketplaceItem[]>(MOCK_MARKETPLACE_ITEMS);
    const [purchaseStatus, setPurchaseStatus] = useState<{ status: 'success' | 'fail' | null, message: string }>({ status: null, message: '' });
    const [itemToConfirm, setItemToConfirm] = useState<MarketplaceItem | null>(null);

    const handleBuyRequest = (item: MarketplaceItem) => {
        if (userProfile.balance >= item.price) {
            setItemToConfirm(item);
        } else {
             setPurchaseStatus({ status: 'fail', message: 'Insufficient funds.' });
             setTimeout(() => setPurchaseStatus({ status: null, message: '' }), 3000);
        }
    };

    const handleConfirmPurchase = () => {
        if (!itemToConfirm) return;
        
        onUpdateBalance(userProfile.balance - itemToConfirm.price);
        setPurchaseStatus({ status: 'success', message: `Successfully purchased "${itemToConfirm.name}"!` });
        setItemToConfirm(null);
        setTimeout(() => setPurchaseStatus({ status: null, message: '' }), 3000);
    }

    return (
        <>
        <div className="w-full max-w-7xl bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-200 dark:border-white/10 flex flex-col gap-6 animate-fade-in">
            <header className="text-center">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">Student Marketplace</h1>
                <p className="text-slate-500 dark:text-sky-200 mt-2">Trade study materials and tools using your $STUDY tokens.</p>
            </header>

            {purchaseStatus.status && (
                <div className={`p-3 rounded-lg flex items-center justify-center gap-2 text-white ${purchaseStatus.status === 'success' ? 'bg-green-500/90' : 'bg-red-500/90'}`}>
                    {purchaseStatus.status === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    {purchaseStatus.message}
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                    <MarketplaceItemCard key={item.id} item={item} onBuy={handleBuyRequest} userBalance={userProfile.balance} />
                ))}
            </div>
        </div>
        {itemToConfirm && (
            <PurchaseConfirmationModal 
                item={itemToConfirm}
                onConfirm={handleConfirmPurchase}
                onCancel={() => setItemToConfirm(null)}
            />
        )}
        </>
    );
};

export default MarketplaceScreen;