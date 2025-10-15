import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import { encodeFunctionData, namehash, type Address } from "viem";
import type { WalletClient } from "viem";
import { normalize } from "viem/ens";

// Base Sepolia contract addresses for Base Names
export const BASENAME_CONTRACTS = {
  // Base Sepolia Registrar Controller Contract Address
  registrarController: "0x4cCb0BB02FCABA27e82a56646E81d8c5bC4119a5",
  // Base Sepolia L2 Resolver Contract Address  
  l2Resolver: "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD",
};

// Base Sepolia regex for validating basenames
export const baseNameRegex = /\.base\.eth$/;

// L2 Resolver ABI for setting address and name
export const l2ResolverABI = [
  {
    inputs: [
      { internalType: "bytes32", name: "node", type: "bytes32" },
      { internalType: "address", name: "a", type: "address" },
    ],
    name: "setAddr",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "node", type: "bytes32" },
      { internalType: "string", name: "newName", type: "string" },
    ],
    name: "setName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Registrar Controller ABI for registering basenames
export const registrarABI = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "duration",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "resolver",
            type: "address",
          },
          {
            internalType: "bytes[]",
            name: "data",
            type: "bytes[]",
          },
          {
            internalType: "bool",
            name: "reverseRecord",
            type: "bool",
          },
        ],
        internalType: "struct RegistrarController.RegisterRequest",
        name: "request",
        type: "tuple",
      },
    ],
    name: "register",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

export interface BasenameRegistrationResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export class BasenameService {
  private wallet: Wallet | null = null;
  private walletClient: (WalletClient & { account?: { address: Address } }) | null = null;

  constructor() {
    // Configure CDP SDK
    this.initializeSDK();
  }

  private initializeSDK() {
    try {
      // Configure CDP SDK - you'll need to set up your API key
      // For now, we'll handle the configuration in the register method
      console.log("BasenameService initialized");
    } catch (error) {
      console.error("Failed to initialize BasenameService:", error);
    }
  }

  /**
   * Set the wallet instance for basename registration
   */
  setWallet(wallet: Wallet) {
    this.wallet = wallet;
  }

  /**
   * Set a viem wallet client (wagmi) as fallback when CDP Wallet isn't used
   */
  setViemWalletClient(walletClient: WalletClient | null) {
    // Augment with optional account typing for convenience
    this.walletClient = (walletClient as any) ?? null;
  }

  /**
   * Check if a basename is available
   */
  async checkAvailability(baseName: string): Promise<boolean> {
    try {
      // For now, we'll implement a simple check
      // In a real implementation, you'd query the registrar contract
      const commonNames = ['test', 'user', 'admin', 'base', 'coinbase', 'ethereum'];
      const nameWithoutSuffix = baseName.replace(baseNameRegex, '').toLowerCase();
      
      return !commonNames.includes(nameWithoutSuffix);
    } catch (error) {
      console.error("Error checking basename availability:", error);
      return false;
    }
  }

  /**
   * Check if the connected wallet already owns a Base Name
   */
  async checkExistingBaseName(walletAddress: string): Promise<{ hasBaseName: boolean; baseName?: string }> {
    try {
      if (!this.wallet) {
        return { hasBaseName: false };
      }

      // In a real implementation, you would:
      // 1. Query the reverse resolver to get the name for the address
      // 2. Check if the name ends with .base.eth
      // 3. Verify ownership through the registrar contract
      
      // For now, we'll simulate this check
      // You would implement actual contract calls here
      console.log(`Checking for existing Base Name for address: ${walletAddress}`);
      
      // Simulate: return false for now (no existing Base Name)
      // In production, implement actual reverse resolution
      return { hasBaseName: false };
    } catch (error) {
      console.error("Error checking existing Base Name:", error);
      return { hasBaseName: false };
    }
  }

  /**
   * Get the Base Name owned by the connected wallet
   */
  async getOwnedBaseName(walletAddress: string): Promise<string | null> {
    try {
      const result = await this.checkExistingBaseName(walletAddress);
      return result.baseName || null;
    } catch (error) {
      console.error("Error getting owned Base Name:", error);
      return null;
    }
  }

  /**
   * Create register contract method arguments
   */
  private createRegisterContractMethodArgs(baseName: string, addressId: string) {
    const addressData = encodeFunctionData({
      abi: l2ResolverABI,
      functionName: "setAddr",
      args: [namehash(normalize(baseName)), addressId],
    });
    
    const nameData = encodeFunctionData({
      abi: l2ResolverABI,
      functionName: "setName",
      args: [namehash(normalize(baseName)), baseName],
    });

    const registerArgs = {
      request: [
        baseName.replace(baseNameRegex, ""),
        addressId,
        "31557600", // 1 year duration
        BASENAME_CONTRACTS.l2Resolver,
        [addressData, nameData],
        true, // reverseRecord
      ],
    };

    return registerArgs;
  }

  /**
   * Register a basename using CDP SDK
   */
  async registerBasename(baseName: string): Promise<BasenameRegistrationResult> {
    try {
      // Validate basename format
      if (!baseNameRegex.test(baseName)) {
        return {
          success: false,
          error: "Invalid basename format. Must end with .base.eth",
        };
      }

      // Prefer CDP Wallet if configured
      if (this.wallet) {
        const defaultAddress = await this.wallet.getDefaultAddress();
        const addressId = defaultAddress.getId();
        const registerArgs = this.createRegisterContractMethodArgs(baseName, addressId);

        const contractInvocation = await this.wallet.invokeContract({
          contractAddress: BASENAME_CONTRACTS.registrarController,
          method: "register",
          abi: registrarABI,
          args: registerArgs,
          amount: 0.002,
          assetId: Coinbase.assets.Eth,
        });

        await contractInvocation.wait();
        const txHash = await (contractInvocation as any).getTransactionHash?.();
        return { success: true, transactionHash: txHash };
      }

      // Fallback to viem WalletClient (wagmi-connected EOA)
      if (this.walletClient && this.walletClient.account?.address) {
        const eoaAddress = this.walletClient.account.address as Address;
        const registerArgs = this.createRegisterContractMethodArgs(baseName, eoaAddress);

        // viem writeContract expects args array, not named object
        const argsTuple = [registerArgs.request] as any;

        const txHash = await (this.walletClient as WalletClient).writeContract({
          abi: registrarABI as any,
          address: BASENAME_CONTRACTS.registrarController as Address,
          functionName: "register",
          args: argsTuple,
          value: BigInt(Math.floor(0.002 * 1e18)),
        } as any);

        return { success: true, transactionHash: txHash as string };
      }

      return {
        success: false,
        error: "Wallet not initialized. Connect a wallet to continue.",
      };
    } catch (error) {
      console.error("Error registering basename:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Validate basename format
   */
  validateBasename(baseName: string): { valid: boolean; error?: string } {
    if (!baseName) {
      return { valid: false, error: "Basename is required" };
    }

    if (!baseNameRegex.test(baseName)) {
      return { valid: false, error: "Basename must end with .base.eth" };
    }

    const nameWithoutSuffix = baseName.replace(baseNameRegex, "");
    
    if (nameWithoutSuffix.length < 3) {
      return { valid: false, error: "Basename must be at least 3 characters long" };
    }

    if (nameWithoutSuffix.length > 63) {
      return { valid: false, error: "Basename must be less than 64 characters long" };
    }

    // Check for valid characters (alphanumeric and hyphens)
    if (!/^[a-z0-9-]+$/i.test(nameWithoutSuffix)) {
      return { valid: false, error: "Basename can only contain letters, numbers, and hyphens" };
    }

    // Check it doesn't start or end with hyphen
    if (nameWithoutSuffix.startsWith("-") || nameWithoutSuffix.endsWith("-")) {
      return { valid: false, error: "Basename cannot start or end with a hyphen" };
    }

    return { valid: true };
  }
}

// Export a singleton instance
export const basenameService = new BasenameService();
