import { useState, useCallback, useEffect } from 'react';
import { basenameService, BasenameRegistrationResult } from '../lib/basenameService';
import { useAccount, useWalletClient } from 'wagmi';

export interface UseBasenameRegistrationReturn {
  isRegistering: boolean;
  isChecking: boolean;
  isCheckingExisting: boolean;
  error: string | null;
  transactionHash: string | null;
  existingBaseName: string | null;
  hasExistingBaseName: boolean;
  checkAvailability: (basename: string) => Promise<boolean>;
  checkExistingBaseName: (walletAddress: string) => Promise<{ hasBaseName: boolean; baseName?: string }>;
  registerBasename: (basename: string) => Promise<BasenameRegistrationResult>;
  validateBasename: (basename: string) => { valid: boolean; error?: string };
  clearError: () => void;
}

export const useBasenameRegistration = (): UseBasenameRegistrationReturn => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [existingBaseName, setExistingBaseName] = useState<string | null>(null);
  const [hasExistingBaseName, setHasExistingBaseName] = useState(false);
  
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Provide viem wallet client to the service when available
  useEffect(() => {
    basenameService.setViemWalletClient(walletClient ?? null);
  }, [walletClient]);

  const checkAvailability = useCallback(async (basename: string): Promise<boolean> => {
    setIsChecking(true);
    setError(null);
    
    try {
      const isAvailable = await basenameService.checkAvailability(basename);
      return isAvailable;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check availability';
      setError(errorMessage);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const registerBasename = useCallback(async (basename: string): Promise<BasenameRegistrationResult> => {
    setIsRegistering(true);
    setError(null);
    setTransactionHash(null);
    
    try {
      // Note: In a real implementation, you would need to set up the CDP wallet
      // For now, this will return an error indicating wallet setup is needed
      if (!address) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      const result = await basenameService.registerBasename(basename);
      
      if (result.success && result.transactionHash) {
        setTransactionHash(result.transactionHash);
      }
      
      if (!result.success && result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsRegistering(false);
    }
  }, [address]);

  const validateBasename = useCallback((basename: string) => {
    return basenameService.validateBasename(basename);
  }, []);

  const checkExistingBaseName = useCallback(async (walletAddress: string) => {
    setIsCheckingExisting(true);
    setError(null);
    
    try {
      const result = await basenameService.checkExistingBaseName(walletAddress);
      setHasExistingBaseName(result.hasBaseName);
      setExistingBaseName(result.baseName || null);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check existing Base Name';
      setError(errorMessage);
      return { hasBaseName: false };
    } finally {
      setIsCheckingExisting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
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
  };
};
