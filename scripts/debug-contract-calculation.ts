import { ethers } from "hardhat";

// Contract addresses
const CONTRACT_ADDRESSES = {
  StudyToken: "0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6",
  StudyTokenShop: "0x0f3E353B65eFEe59551fEa9689B77C74C1E7423c",
};

async function main() {
  console.log("🔍 Debugging contract calculation...");

  try {
    const [deployer] = await ethers.getSigners();
    
    // Connect to contracts
    const StudyToken = await ethers.getContractFactory("StudyToken");
    const studyToken = StudyToken.attach(CONTRACT_ADDRESSES.StudyToken);

    const StudyTokenShop = await ethers.getContractFactory("StudyTokenShop");
    const shop = StudyTokenShop.attach(CONTRACT_ADDRESSES.StudyTokenShop);

    // Get current price
    const currentPrice = await shop.currentPrice();
    console.log(`\n💰 Current Price:`);
    console.log(`   Price: ${currentPrice.toString()} wei`);
    console.log(`   Price (ETH): ${ethers.formatEther(currentPrice)} ETH`);

    // Test with 0.001 ETH (same as frontend)
    const ethAmount = ethers.parseEther("0.001");
    console.log(`\n🧮 Calculation for ${ethers.formatEther(ethAmount)} ETH:`);
    console.log(`   ETH Amount: ${ethAmount.toString()} wei`);
    console.log(`   Current Price: ${currentPrice.toString()} wei`);
    
    // Calculate token amount (same as contract)
    const tokenAmount = ethAmount / currentPrice;
    console.log(`   Token Amount: ${tokenAmount.toString()}`);
    
    // Check if this matches what the contract would calculate
    const contractQuote = await shop.getQuote(ethAmount);
    console.log(`   Contract Quote: ${contractQuote.toString()}`);
    
    if (tokenAmount.toString() === contractQuote.toString()) {
      console.log("✅ Calculation matches contract");
    } else {
      console.log("❌ Calculation doesn't match contract");
    }

    // Check what the token amount represents in STUDY tokens
    console.log(`\n🎯 Token Amount Analysis:`);
    console.log(`   Raw token amount: ${tokenAmount.toString()}`);
    console.log(`   As formatted: ${ethers.formatEther(tokenAmount)}`);
    console.log(`   This means: ${tokenAmount.toString()} wei of STUDY tokens`);
    
    // Check if this is the issue - are we treating wei as tokens?
    const actualTokens = tokenAmount / BigInt(10**18);
    console.log(`   Actual STUDY tokens: ${actualTokens.toString()}`);
    
    if (actualTokens > 0) {
      console.log("✅ This would transfer actual STUDY tokens");
    } else {
      console.log("❌ This would transfer essentially zero STUDY tokens");
      console.log("💡 The issue is that we're dividing wei by wei, but STUDY tokens also have 18 decimals!");
    }

    // The correct calculation should be:
    // tokenAmount = (msg.value * 1e18) / currentPrice
    const correctTokenAmount = (ethAmount * BigInt(10**18)) / currentPrice;
    console.log(`\n🔧 Correct calculation:`);
    console.log(`   Correct token amount: ${correctTokenAmount.toString()} wei`);
    console.log(`   Correct STUDY tokens: ${ethers.formatEther(correctTokenAmount)} STUDY`);

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
