const { ethers } = require("hardhat");

// New fixed contract address
const SHOP_ADDRESS = "0x0f3E353B65eFEe59551fEa9689B77C74C1E7423c";

async function testNewShop() {
  console.log("🧪 Testing NEW shop contract...");
  
  try {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Buyer address:", deployer.address);

    // Connect to shop contract
    const StudyTokenShop = await ethers.getContractFactory("StudyTokenShop");
    const shop = StudyTokenShop.attach(SHOP_ADDRESS);

    // Get current price from shop
    const priceInfo = await shop.getPriceInfo();
    console.log("\n💰 Current Price Info:");
    console.log(`   Price: ${ethers.formatEther(priceInfo[0])} ETH per token`);
    console.log(`   Tokens per ETH: ${priceInfo[1].toString()}`);

    // Test quote for 0.001 ETH
    const purchaseAmount = ethers.parseEther("0.001");
    const quote = await shop.getQuote(purchaseAmount);
    console.log(`\n📋 Quote for ${ethers.formatEther(purchaseAmount)} ETH:`);
    console.log(`   Expected tokens: ${ethers.formatEther(quote)} STUDY`);
    console.log(`   Raw quote (wei): ${quote.toString()}`);

    // Manual calculation for verification
    const manualCalculation = purchaseAmount / priceInfo[0];
    console.log(`\n🧮 Manual calculation:`);
    console.log(`   ETH amount: ${purchaseAmount.toString()} wei`);
    console.log(`   Price: ${priceInfo[0].toString()} wei`);
    console.log(`   Division: ${purchaseAmount.toString()} / ${priceInfo[0].toString()} = ${manualCalculation.toString()}`);
    console.log(`   Manual result: ${ethers.formatEther(manualCalculation * ethers.parseEther("1"))} STUDY`);

    // Check if quotes match
    if (quote.toString() === manualCalculation.toString()) {
      console.log("✅ SUCCESS: Quote calculation is correct!");
    } else {
      console.log("❌ MISMATCH: Quote calculation differs from manual calculation");
      console.log(`   Quote: ${quote.toString()}`);
      console.log(`   Manual: ${manualCalculation.toString()}`);
    }

  } catch (error) {
    console.error("❌ Error testing shop:", error);
  }
}

testNewShop()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
