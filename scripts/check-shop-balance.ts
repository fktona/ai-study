import { ethers } from "hardhat";

// Contract addresses
const CONTRACT_ADDRESSES = {
  StudyToken: "0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6",
  StudyTokenShop: "0x0f3E353B65eFEe59551fEa9689B77C74C1E7423c",
};

async function main() {
  console.log("🔍 Checking StudyTokenShop contract balances...");

  try {
    // Connect to contracts
    const StudyToken = await ethers.getContractFactory("StudyToken");
    const studyToken = StudyToken.attach(CONTRACT_ADDRESSES.StudyToken);

    // Check StudyTokenShop's STUDY token balance
    const shopBalance = await studyToken.balanceOf(CONTRACT_ADDRESSES.StudyTokenShop);
    const shopBalanceFormatted = ethers.formatEther(shopBalance);

    console.log("📊 StudyTokenShop Balance:");
    console.log(`   Raw Balance: ${shopBalance.toString()} wei`);
    console.log(`   Formatted Balance: ${shopBalanceFormatted} STUDY`);
    console.log(`   Contract Address: ${CONTRACT_ADDRESSES.StudyTokenShop}`);

    // Check if shop has enough tokens (at least 1000 tokens)
    const minRequired = ethers.parseEther("1000");
    if (shopBalance < minRequired) {
      console.log("⚠️  WARNING: Shop has insufficient STUDY tokens!");
      console.log(`   Required: ${ethers.formatEther(minRequired)} STUDY`);
      console.log(`   Available: ${shopBalanceFormatted} STUDY`);
      console.log("   You need to transfer STUDY tokens to the shop contract.");
    } else {
      console.log("✅ Shop has sufficient STUDY tokens for purchases.");
    }

    // Check shop contract's ETH balance
    const ethBalance = await ethers.provider.getBalance(CONTRACT_ADDRESSES.StudyTokenShop);
    console.log("\n💰 StudyTokenShop ETH Balance:");
    console.log(`   Balance: ${ethers.formatEther(ethBalance)} ETH`);

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
