import { ethers } from "hardhat";

// Your wallet address
const WALLET_ADDRESS = "0xAe7b6ED9A70568d2f0C9FcdD73ee5d2A3dFf4cC5";

// Contract addresses
const CONTRACT_ADDRESSES = {
  StudyToken: "0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6",
};

async function main() {
  console.log("🔍 Checking wallet balance...");
  console.log(`📍 Wallet: ${WALLET_ADDRESS}`);

  try {
    // Check ETH balance
    const ethBalance = await ethers.provider.getBalance(WALLET_ADDRESS);
    const ethBalanceFormatted = ethers.formatEther(ethBalance);
    
    console.log("\n💰 ETH Balance (Base Sepolia):");
    console.log(`   Raw Balance: ${ethBalance.toString()} wei`);
    console.log(`   Formatted Balance: ${ethBalanceFormatted} ETH`);
    
    // Check if sufficient for gas (minimum 0.001 ETH)
    const minRequired = ethers.parseEther("0.001");
    if (ethBalance < minRequired) {
      console.log("⚠️  WARNING: Insufficient ETH for gas fees!");
      console.log("   You need at least 0.001 ETH for transactions");
      console.log("   Get Base Sepolia ETH from: https://bridge.base.org/deposit");
    } else {
      console.log("✅ Sufficient ETH for gas fees");
    }

    // Check STUDY token balance
    const StudyToken = await ethers.getContractFactory("StudyToken");
    const studyToken = StudyToken.attach(CONTRACT_ADDRESSES.StudyToken);
    
    const tokenBalance = await studyToken.balanceOf(WALLET_ADDRESS);
    const tokenBalanceFormatted = ethers.formatEther(tokenBalance);
    
    console.log("\n📊 STUDY Token Balance:");
    console.log(`   Raw Balance: ${tokenBalance.toString()} wei`);
    console.log(`   Formatted Balance: ${tokenBalanceFormatted} STUDY`);

    // Check network info
    const network = await ethers.provider.getNetwork();
    console.log(`\n🔗 Network: ${network.name} (Chain ID: ${network.chainId})`);

  } catch (error) {
    console.error("❌ Error checking balances:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
