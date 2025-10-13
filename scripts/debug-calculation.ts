import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Debugging token calculation...");

  try {
    // Test calculation
    const ethAmount = ethers.parseEther("0.001"); // 0.001 ETH
    const currentPrice = ethers.parseEther("0.0001"); // 0.0001 ETH per token
    
    console.log("📊 Values:");
    console.log(`   ETH Amount: ${ethAmount.toString()} wei (${ethers.formatEther(ethAmount)} ETH)`);
    console.log(`   Current Price: ${currentPrice.toString()} wei (${ethers.formatEther(currentPrice)} ETH)`);
    
    // Calculate token amount
    const tokenAmount = ethAmount / currentPrice;
    console.log(`   Token Amount: ${tokenAmount.toString()} tokens`);
    
    // Check if this matches what the contract calculates
    const CONTRACT_ADDRESSES = {
      StudyTokenShop: "0x398C5d5eF90010A6441eD343C6C696d761827f27",
    };
    
    const StudyTokenShop = await ethers.getContractFactory("StudyTokenShop");
    const shop = StudyTokenShop.attach(CONTRACT_ADDRESSES.StudyTokenShop);
    
    // Get quote from contract
    const quote = await shop.getQuote(ethAmount);
    console.log(`   Contract Quote: ${quote.toString()} tokens`);
    
    // Check shop balance
    const StudyToken = await ethers.getContractFactory("StudyToken");
    const studyToken = StudyToken.attach("0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6");
    const shopBalance = await studyToken.balanceOf(CONTRACT_ADDRESSES.StudyTokenShop);
    
    console.log("\n🏪 Shop Info:");
    console.log(`   Shop Balance: ${shopBalance.toString()} wei (${ethers.formatEther(shopBalance)} tokens)`);
    console.log(`   Required: ${tokenAmount.toString()} tokens`);
    console.log(`   Has Enough: ${shopBalance >= tokenAmount ? "YES" : "NO"}`);
    
    if (shopBalance < tokenAmount) {
      console.log(`❌ Insufficient: Need ${tokenAmount.toString()}, Have ${shopBalance.toString()}`);
    } else {
      console.log(`✅ Sufficient: Have ${shopBalance.toString()}, Need ${tokenAmount.toString()}`);
    }

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
