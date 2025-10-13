import React, { useState } from 'react';
import { UserProfile, NFTCredential } from '../types';
import { OFFICIAL_NFT_MINT_FEE, MOCK_NFTS } from '../constants';
import { Save, X, Camera, ShieldCheck, CheckCircle, Layers } from 'lucide-react';

interface NFTCardProps {
  nft: NFTCredential;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft }) => (
  <div className={`bg-slate-50 dark:bg-white/5 rounded-lg overflow-hidden border ${nft.isOfficial ? 'border-sky-400' : 'border-slate-200 dark:border-white/10'} group transform transition-transform hover:-translate-y-1 relative`}>
    {nft.isOfficial && (
        <div className="absolute top-2 right-2 bg-sky-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 flex items-center gap-1">
            <CheckCircle size={14}/> Official
        </div>
    )}
    <img src={nft.imageUrl} alt={nft.name} className="w-full h-32 object-cover" />
    <div className="p-3">
      <h3 className="font-bold text-sm truncate">{nft.name}</h3>
      <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 line-clamp-2">{nft.description}</p>
    </div>
  </div>
);

interface ProfileScreenProps {
  userProfile: UserProfile;
  nfts: NFTCredential[];
  onSave: (updatedProfile: UserProfile) => void;
  onCancel: () => void;
  onMintNFT: (nft: NFTCredential, fee: number) => boolean;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ userProfile, nfts, onSave, onCancel, onMintNFT }) => {
  const [editedProfile, setEditedProfile] = useState<UserProfile>(userProfile);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const officialNFTId = 'nft-official-1';
  const hasMintedOfficialNFT = nfts.some(nft => nft.id === officialNFTId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({ ...prev, [name]: name === 'year' ? parseInt(value) || 0 : value }));
  };
  
  const handlePictureChange = () => {
    const newId = Math.random().toString(36).substring(7);
    setEditedProfile(prev => ({
      ...prev,
      profilePictureUrl: `https://i.pravatar.cc/150?u=${newId}`
    }));
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }

  const handleSave = () => {
    onSave(editedProfile);
    showNotification('success', 'Profile saved successfully!');
  };
  
  const handleMintOfficialNFT = () => {
    const officialNFT = MOCK_NFTS.find(nft => nft.id === officialNFTId);
    if(officialNFT) {
        const success = onMintNFT(officialNFT, OFFICIAL_NFT_MINT_FEE);
        if (success) {
            showNotification('success', 'Official credential minted successfully!');
        } else {
            showNotification('error', 'Minting failed. Check your $STUDY balance.');
        }
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-white/10 flex flex-col gap-6 animate-fade-in">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">Edit Your Profile</h1>
        <p className="text-slate-500 dark:text-sky-200 mt-1">Personalize your student identity.</p>
      </header>

      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative group flex-shrink-0">
          <img src={editedProfile.profilePictureUrl} alt="Profile" className="w-32 h-32 rounded-full border-4 border-slate-200 dark:border-white/20 shadow-lg"/>
          <button 
            onClick={handlePictureChange}
            className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Change profile picture"
          >
            <Camera className="text-white" size={32}/>
          </button>
        </div>
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="school" className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-1">School</label>
              <input type="text" id="school" name="school" value={editedProfile.school || ''} onChange={handleInputChange} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/20 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
            </div>
            <div>
              <label htmlFor="major" className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-1">Major / Area of Study</label>
              <input type="text" id="major" name="major" value={editedProfile.major || ''} onChange={handleInputChange} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/20 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
            </div>
            <div className="sm:col-span-2">
               <label htmlFor="year" className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-1">Year of Study</label>
               <input type="number" id="year" name="year" value={editedProfile.year || ''} onChange={handleInputChange} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/20 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
            </div>
        </div>
      </div>

       <div className="flex justify-center items-center gap-4 mt-2">
        <button onClick={onCancel} className="flex items-center gap-2 bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-full transition">
            <X size={18}/> Cancel
        </button>
        <button onClick={handleSave} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:scale-105 text-white font-bold py-2 px-6 rounded-full transition-transform transform">
            <Save size={18}/> Save Changes
        </button>
      </div>
      
      <div className="pt-6 border-t border-slate-200 dark:border-white/10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Layers className="text-blue-500"/> My Credentials</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nfts.map(nft => <NFTCard key={nft.id} nft={nft} />)}
            {nfts.length === 0 && <p className="col-span-full text-center text-sm text-slate-500 dark:text-gray-400">Your minted NFTs will appear here.</p>}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 dark:border-white/10">
        <h2 className="text-xl font-semibold mb-4">Official Verification</h2>
        <div className="bg-slate-50 dark:bg-black/20 p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <h3 className="font-bold text-lg flex items-center gap-2"><ShieldCheck className="text-sky-500" /> Mint Verifiable Achievements</h3>
                <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Mint an official, on-chain NFT to certify course completions.</p>
            </div>
            {hasMintedOfficialNFT ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 dark:bg-emerald-500/20 py-2 px-4 rounded-full">
                    <CheckCircle size={18}/> Credential Minted
                </div>
            ) : (
                <button 
                    onClick={handleMintOfficialNFT}
                    disabled={userProfile.balance < OFFICIAL_NFT_MINT_FEE}
                    className="flex-shrink-0 bg-sky-500 text-white font-bold py-2 px-5 rounded-full shadow-md hover:bg-sky-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    Mint for {OFFICIAL_NFT_MINT_FEE} $STUDY
                </button>
            )}
        </div>
      </div>

      {notification && (
          <div className={`fixed bottom-5 right-5 ${notification.type === 'success' ? 'bg-green-600/90' : 'bg-red-600/90'} backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in`}>
              {notification.message}
          </div>
      )}
    </div>
  );
};

export default ProfileScreen;