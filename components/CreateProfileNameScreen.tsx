import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Search,
  Loader2,
  Check,
  ArrowRight,
  ExternalLink,
  X,
  AlertTriangle,
  SkipForward,
} from "lucide-react";
import { useBasenameRegistration } from "../hooks/useBasenameRegistration";
import { useAccount } from "wagmi";

interface CreateProfileNameScreenProps {
  onProfileCreated: (bns: string) => void;
}

type NameStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "invalid"
  | "error";
type ScreenState =
  | "checking-existing"
  | "existing-found"
  | "naming"
  | "minting"
  | "success"
  | "error";

const CreateProfileNameScreen: React.FC<CreateProfileNameScreenProps> = ({
  onProfileCreated,
}) => {
  const [name, setName] = useState("");
  const [nameStatus, setNameStatus] = useState<NameStatus>("idle");
  const [screenState, setScreenState] =
    useState<ScreenState>("checking-existing");
  const debounceTimeout = useRef<number | null>(null);

  const { address } = useAccount();
  const {
    isRegistering,
    isChecking,
    isCheckingExisting,
    error,
    transactionHash,
    existingBaseName,
    hasExistingBaseName,
    checkAvailability,
    checkExistingBaseName,
    registerBasename,
    validateBasename,
    clearError,
  } = useBasenameRegistration();

  // Check for existing Base Name when component mounts
  useEffect(() => {
    const checkForExistingBaseName = async () => {
      if (address) {
        setScreenState("checking-existing");
        const result = await checkExistingBaseName(address);
        if (result.hasBaseName) {
          setScreenState("existing-found");
        } else {
          setScreenState("naming");
        }
      } else {
        setScreenState("naming");
      }
    };

    checkForExistingBaseName();
  }, [address, checkExistingBaseName]);

  const handleCheckAvailability = useCallback(
    async (currentName: string) => {
      try {
        const fullName = `${currentName}.base.eth`;
        const validation = validateBasename(fullName);

        if (!validation.valid) {
          setNameStatus("invalid");
          return;
        }

        setNameStatus("checking");
        const isAvailable = await checkAvailability(fullName);

        if (isAvailable) {
          setNameStatus("available");
        } else {
          setNameStatus("taken");
        }
      } catch (error) {
        setNameStatus("error");
        console.error("Error checking basename availability:", error);
      }
    },
    [checkAvailability, validateBasename]
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setName(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (!value) {
      setNameStatus("idle");
      return;
    }

    if (value.length < 3) {
      setNameStatus("invalid");
      return;
    }

    setNameStatus("checking");
    debounceTimeout.current = window.setTimeout(() => {
      handleCheckAvailability(value);
    }, 500); // 500ms debounce
  };

  const handleMint = async () => {
    setScreenState("minting");
    clearError();

    try {
      const fullName = `${name}.base.eth`;
      const result = await registerBasename(fullName);

      if (result.success) {
        setScreenState("success");
      } else {
        setScreenState("error");
      }
    } catch (error) {
      setScreenState("error");
      console.error("Error registering basename:", error);
    }
  };

  const handleContinue = () => {
    onProfileCreated(`${name}.base.eth`);
  };

  const handleUseExisting = () => {
    if (existingBaseName) {
      onProfileCreated(existingBaseName);
    }
  };

  const handleCreateNew = () => {
    setScreenState("naming");
  };

  const handleSkip = () => {
    onProfileCreated("");
  };

  const handleRetry = () => {
    setScreenState("naming");
    clearError();
  };

  const renderStatusIcon = () => {
    switch (nameStatus) {
      case "checking":
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
      case "available":
        return <Check className="w-5 h-5 text-green-500" />;
      case "taken":
        return <X className="w-5 h-5 text-red-500" />;
      case "invalid":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const renderCheckingExistingScreen = () => (
    <div className="flex flex-col items-center gap-6 text-center">
      <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
      <h2 className="text-2xl font-bold">Checking for existing Base Name...</h2>
      <p className="text-slate-500 dark:text-gray-300">
        We're checking if you already own a Base Name for this wallet.
      </p>
    </div>
  );

  const renderExistingFoundScreen = () => (
    <>
      <header className="text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
          Base Name Found!
        </h1>
        <p className="text-slate-500 dark:text-sky-200 mt-2 text-lg">
          You already own a Base Name
        </p>
      </header>

      <div className="bg-slate-50 dark:bg-black/20 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 w-full max-w-sm mx-auto group transform transition-transform hover:-translate-y-1">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="font-bold text-lg text-green-600 dark:text-green-400 mb-2">
            {existingBaseName}
          </h3>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">
            Your existing Base Name is ready to use
          </p>
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-3">
        <button
          onClick={handleUseExisting}
          className="w-full max-w-xs flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300"
        >
          Use {existingBaseName} <ArrowRight size={18} />
        </button>
        <button
          onClick={handleCreateNew}
          className="w-full max-w-xs flex items-center justify-center gap-2 bg-slate-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300"
        >
          Create New Name <SkipForward size={18} />
        </button>
      </div>
    </>
  );

  const renderNamingScreen = () => (
    <>
      <header className="text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
          Claim Your Identity
        </h1>
        <p className="text-slate-500 dark:text-sky-200 mt-2 text-lg">
          Create a unique Base Name for your profile.
        </p>
      </header>

      <div className="w-full">
        <label
          htmlFor="bns-name"
          className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-2"
        >
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
          <span className="text-lg font-semibold text-slate-400 dark:text-gray-500">
            .base
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-2 h-4">
          {nameStatus === "invalid" &&
            "Name must be at least 3 characters long."}
          {nameStatus === "taken" && (
            <span className="text-red-500">
              '{name}.base.eth' is already taken. Try another.
            </span>
          )}
          {nameStatus === "available" && (
            <span className="text-green-500">
              '{name}.base.eth' is available!
            </span>
          )}
          {nameStatus === "error" && (
            <span className="text-red-500">
              {error || "Error checking availability"}
            </span>
          )}
        </p>
      </div>

      <div className="w-full flex flex-col items-center gap-3">
        <button
          onClick={handleMint}
          disabled={nameStatus !== "available"}
          className="w-full max-w-xs flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Claim Name & Mint NFT
        </button>
        <button
          onClick={handleSkip}
          className="w-full max-w-xs flex items-center justify-center gap-2 bg-slate-600/10 text-slate-700 dark:text-gray-200 dark:bg-white/10 hover:bg-slate-600/20 dark:hover:bg-white/20 font-semibold py-3 px-6 rounded-full transition-all"
        >
          Skip for now <SkipForward size={18} />
        </button>
      </div>
    </>
  );

  const renderMintingScreen = () => (
    <div className="flex flex-col items-center gap-6 text-center">
      <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
      <h2 className="text-2xl font-bold">Registering your Base Name...</h2>
      <p className="text-slate-500 dark:text-gray-300">
        We're securely registering{" "}
        <span className="font-bold text-blue-400">{name}.base.eth</span> on the
        blockchain and creating your unique NFT credential.
      </p>
    </div>
  );

  const renderSuccessScreen = () => (
    <>
      <header className="text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-500">
          Success!
        </h1>
        <p className="text-slate-500 dark:text-sky-200 mt-2 text-lg">
          Welcome to the Nexus,{" "}
          <span className="font-bold text-white">{name}.base.eth</span>
        </p>
      </header>

      <div className="bg-slate-50 dark:bg-black/20 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 w-full max-w-sm mx-auto group transform transition-transform hover:-translate-y-1">
        <img
          src={`https://placehold.co/400x400/155ff4/ffffff?text=${name}.base.eth`}
          alt={`${name}.base.eth NFT`}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="font-bold text-md">{name}.base.eth</h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Your unique Base Name Service (BNS) credential.
          </p>
          {transactionHash && (
            <a
              href={`https://sepolia.basescan.org/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300 hover:bg-sky-500/20 dark:hover:bg-sky-500/40 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <ExternalLink size={16} /> View Transaction
            </a>
          )}
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

  const renderErrorScreen = () => (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
        <X className="w-8 h-8 text-red-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-red-500">Registration Failed</h2>
        <p className="text-slate-500 dark:text-gray-300 mt-2">
          {error || "Something went wrong while registering your basename."}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleRetry}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={handleRetry}
          className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
        >
          Choose Different Name
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-2xl bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-white/10 flex flex-col items-center text-center gap-8 animate-fade-in">
      {screenState === "checking-existing" && renderCheckingExistingScreen()}
      {screenState === "existing-found" && renderExistingFoundScreen()}
      {screenState === "naming" && renderNamingScreen()}
      {screenState === "minting" && renderMintingScreen()}
      {screenState === "success" && renderSuccessScreen()}
      {screenState === "error" && renderErrorScreen()}
    </div>
  );
};

export default CreateProfileNameScreen;
