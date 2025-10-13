const { ethers } = require("hardhat");

// New fixed contract address
const SHOP_ADDRESS = "0x0f3E353B65eFEe59551fEa9689B77C74C1E7423c";
const TOKEN_ADDRESS = "0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6";

async function testFixedPurchase() {
  console.log("🧪 Testing FIXED token purchase...");
  
  try {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Buyer address:", deployer.address);

    // Connect to contracts
    const StudyToken = await ethers.getContractFactory("StudyToken");
    const studyToken = StudyToken.attach(TOKEN_ADDRESS);

    const StudyTokenShop = await ethers.getContractFactory("StudyTokenShop");
    const shop = StudyTokenShop.attach(SHOP_ADDRESS);

    // Check balances before purchase
    const buyerBalanceBefore = await studyToken.balanceOf(deployer.address);
    const shopBalanceBefore = await studyToken.balanceOf(SHOP_ADDRESS);
    
    console.log("\n📊 Balances Before Purchase:");
    console.log(`   Buyer: ${ethers.formatEther(buyerBalanceBefore)} STUDY`);
    console.log(`   Shop: ${ethers.formatEther(shopBalanceBefore)} STUDY`);

    // Get current price from shop
    const priceInfo = await shop.getPriceInfo();
    console.log("\n💰 Current Price Info:");
    console.log(`   Price: ${ethers.formatEther(priceInfo[0])} ETH per token`);
    console.log(`   Tokens per ETH: ${priceInfo[1].toString()}`);

    // Test quote first
    const purchaseAmount = ethers.parseEther("0.001");
    const quote = await shop.getQuote(purchaseAmount);
    console.log(`\n📋 Quote for ${ethers.formatEther(purchaseAmount)} ETH:`);
    console.log(`   Expected tokens: ${ethers.formatEther(quote)} STUDY`);

    // Test purchase with 0.001 ETH
    console.log(`\n🛒 Attempting to buy tokens with ${ethers.formatEther(purchaseAmount)} ETH...`);

    // Execute purchase
    const tx = await shop.buyTokens({ value: purchaseAmount });
    console.log(`   Transaction hash: ${tx.hash}`);
    
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log(`✅ Purchase completed! Gas used: ${receipt?.gasUsed.toString()}`);

    // Check balances after purchase
    const buyerBalanceAfter = await studyToken.balanceOf(deployer.address);
    const shopBalanceAfter = await studyToken.balanceOf(SHOP_ADDRESS);
    
    console.log("\n📊 Balances After Purchase:");
    console.log(`   Buyer: ${ethers.formatEther(buyerBalanceAfter)} STUDY`);
    console.log(`   Shop: ${ethers.formatEther(shopBalanceAfter)} STUDY`);

    const tokensReceived = buyerBalanceAfter - buyerBalanceBefore;
    console.log(`\n🎉 Tokens Received: ${ethers.formatEther(tokensReceived)} STUDY`);
    console.log(`🎉 Expected: ${ethers.formatEther(quote)} STUDY`);
    
    if (tokensReceived.toString() === quote.toString()) {
      console.log("✅ SUCCESS: Received exactly the quoted amount!");
    } else {
      console.log("❌ MISMATCH: Received different amount than quoted");
    }

  } catch (error) {
    console.error("❌ Error during token purchase:", error);
  }
}

testFixedPurchase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
