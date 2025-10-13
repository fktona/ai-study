import React, { useState, useCallback, useRef } from 'react';
import { Search, Loader2, Check, ArrowRight, ExternalLink, X, AlertTriangle } from 'lucide-react';

interface CreateProfileNameScreenProps {
  onProfileCreated: (bns: string) => void;
}

type NameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';
type ScreenState = 'naming' | 'minting' | 'success';

const CreateProfileNameScreen: React.FC<CreateProfileNameScreenProps> = ({ onProfileCreated }) => {
  const [name, setName] = useState('');
  const [nameStatus, setNameStatus] = useState<NameStatus>('idle');
  const [screenState, setScreenState] = useState<ScreenState>('naming');
  const debounceTimeout = useRef<number | null>(null);

  const checkAvailability = useCallback((currentName: string) => {
    // Simulate API call, e.g., common names are taken
    if (['test', 'user', 'admin', 'base'].includes(currentName.toLowerCase())) {
      setNameStatus('taken');
    } else {
      setNameStatus('available');
    }
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setName(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (!value) {
      setNameStatus('idle');
      return;
    }

    if (value.length < 3) {
      setNameStatus('invalid');
      return;
    }
    
    setNameStatus('checking');
    debounceTimeout.current = window.setTimeout(() => {
      checkAvailability(value);
    }, 500); // 500ms debounce
  };

  const handleMint = () => {
    setScreenState('minting');
    setTimeout(() => {
      setScreenState('success');
    }, 2000); // Simulate minting time
  };

  const handleContinue = () => {
    onProfileCreated(name);
  };
  
  const renderStatusIcon = () => {
    switch(nameStatus) {
      case 'checking': return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
      case 'available': return <Check className="w-5 h-5 text-green-500" />;
      case 'taken': return <X className="w-5 h-5 text-red-500" />;
      case 'invalid': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return null;
    }
  };
  
  const renderNamingScreen = () => (
    <>
      <header className="text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">Claim Your Identity</h1>
        <p className="text-slate-500 dark:text-sky-200 mt-2 text-lg">Create a unique Base Name for your profile.</p>
      </header>

      <div className="w-full">
        <label htmlFor="bns-name" className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-2">
          Choose your name
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              id="bns-name"
              value={name}
              onChange={handleNameChange}
              placeholder="yourname"
              autoComplete="off"
              className="w-full bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/20 rounded-lg pl-4 pr-10 py-3 text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              {renderStatusIcon()}
            </div>
          </div>
          <span className="text-lg font-semibold text-slate-400 dark:text-gray-500">.base</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-2 h-4">
            {nameStatus === 'invalid' && 'Name must be at least 3 characters long.'}
            {nameStatus === 'taken' && <span className="text-red-500">'{name}.base' is already taken. Try another.</span>}
            {nameStatus === 'available' && <span className="text-green-500">'{name}.base' is available!</span>}
        </p>
      </div>

      <div className="w-full flex flex-col items-center gap-3">
        <button
          onClick={handleMint}
          disabled={nameStatus !== 'available'}
          className="w-full max-w-xs flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Claim Name & Mint NFT
        </button>
      </div>
    </>
  );

  const renderMintingScreen = () => (
     <div className="flex flex-col items-center gap-6 text-center">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
        <h2 className="text-2xl font-bold">Minting your Base Name...</h2>
        <p className="text-slate-500 dark:text-gray-300">
            We're securely registering <span className="font-bold text-blue-400">{name}.base</span> on the blockchain and creating your unique NFT credential.
        </p>
    </div>
  );

  const renderSuccessScreen = () => (
    <>
        <header className="text-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-500">Success!</h1>
            <p className="text-slate-500 dark:text-sky-200 mt-2 text-lg">Welcome to the Nexus, <span className="font-bold text-white">{name}.base</span></p>
        </header>

        <div className="bg-slate-50 dark:bg-black/20 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 w-full max-w-sm mx-auto group transform transition-transform hover:-translate-y-1">
            <img src={`https://placehold.co/400x400/155ff4/ffffff?text=${name}.base`} alt={`${name}.base NFT`} className="w-full h-48 object-cover" />
            <div className="p-4">
            <h3 className="font-bold text-md">{name}.base</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Your unique Base Name Service (BNS) credential.</p>
            <a href="https://opensea.io/collection/base-introduced" target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300 hover:bg-sky-500/20 dark:hover:bg-sky-500/40 font-semibold py-2 px-4 rounded-lg transition-colors">
                <ExternalLink size={16} /> View on OpenSea
            </a>
            </div>
        </div>

         <button
            onClick={handleContinue}
            className="w-full max-w-xs flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300"
        >
            Continue <ArrowRight size={18} />
        </button>
    </>
  );

  return (
    <div className="w-full max-w-2xl bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-white/10 flex flex-col items-center text-center gap-8 animate-fade-in">
      {screenState === 'naming' && renderNamingScreen()}
      {screenState === 'minting' && renderMintingScreen()}
      {screenState === 'success' && renderSuccessScreen()}
    </div>
  );
};

export default CreateProfileNameScreen;
