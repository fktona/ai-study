import { ethers } from "hardhat";

// Configuration - Update these values as needed
const CONFIG = {
  // Your deployed StudyToken contract address
  TOKEN_ADDRESS: "0x168642d941b4405f628300433Bd8cAb617F4D0d1",
  
  // Addresses to check - Add the addresses you want to test here
  ADDRESSES_TO_CHECK: [
    "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Example address 1
    "0x1234567890123456789012345678901234567890", // Example address 2
    // Add more addresses here
  ]
};

async function checkBalance(address: string) {
  try {
    console.log(`\n🔍 Checking balance for: ${address}`);
    
    // Get the StudyToken contract
    const StudyToken = await ethers.getContractFactory("StudyToken");
    const studyToken = StudyToken.attach(CONFIG.TOKEN_ADDRESS);
    
    // Get token info
    const [name, symbol, decimals] = await Promise.all([
      studyToken.name(),
      studyToken.symbol(),
      studyToken.decimals()
    ]);
    
    // Get balance
    const balance = await studyToken.balanceOf(address);
    const formattedBalance = ethers.formatEther(balance);
    
    // Get additional info if available
    let studyRewards = "0";
    let lastClaim = "Never";
    
    try {
      const rewards = await studyToken.getUserStudyRewards(address);
      studyRewards = ethers.formatEther(rewards);
      
      const claimTime = await studyToken.getUserLastRewardClaim(address);
      if (claimTime > 0) {
        lastClaim = new Date(Number(claimTime) * 1000).toISOString();
      }
    } catch (error) {
      // Additional info not available for this address
    }
    
    console.log(`📊 Token: ${name} (${symbol})`);
    console.log(`💰 Balance: ${formattedBalance} ${symbol}`);
    console.log(`🎓 Study Rewards: ${studyRewards} ${symbol}`);
    console.log(`📅 Last Claim: ${lastClaim}`);
    
    if (balance > 0) {
      console.log(`✅ Address has STUDY tokens!`);
    } else {
      console.log(`❌ Address has no STUDY tokens.`);
    }
    
    return {
      address,
      balance: formattedBalance,
      hasTokens: balance > 0,
      studyRewards,
      lastClaim
    };
    
  } catch (error) {
    console.log(`❌ Error checking ${address}: ${(error as Error).message}`);
    return {
      address,
      error: (error as Error).message
    };
  }
}

async function main() {
  console.log("🚀 STUDY Token Balance Checker");
  console.log("================================");
  console.log(`Token Contract: ${CONFIG.TOKEN_ADDRESS}`);
  console.log(`Network: Base Sepolia`);
  console.log(`Addresses to check: ${CONFIG.ADDRESSES_TO_CHECK.length}`);
  
  const results = [];
  
  for (const address of CONFIG.ADDRESSES_TO_CHECK) {
    const result = await checkBalance(address);
    results.push(result);
  }
  
  // Summary
  console.log("\n📋 SUMMARY");
  console.log("===========");
  
  const addressesWithTokens = results.filter(r => r.hasTokens);
  const addressesWithoutTokens = results.filter(r => !r.hasTokens && !r.error);
  const addressesWithErrors = results.filter(r => r.error);
  
  console.log(`✅ Addresses with tokens: ${addressesWithTokens.length}`);
  console.log(`❌ Addresses without tokens: ${addressesWithoutTokens.length}`);
  console.log(`⚠️  Addresses with errors: ${addressesWithErrors.length}`);
  
  if (addressesWithTokens.length > 0) {
    console.log("\n💰 ADDRESSES WITH TOKENS:");
    addressesWithTokens.forEach(r => {
      console.log(`  ${r.address}: ${r.balance} STUDY`);
    });
  }
  
  if (addressesWithErrors.length > 0) {
    console.log("\n⚠️  ADDRESSES WITH ERRORS:");
    addressesWithErrors.forEach(r => {
      console.log(`  ${r.address}: ${r.error}`);
    });
  }
  
  console.log("\n🎉 Balance check completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
