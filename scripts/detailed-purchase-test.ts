import { ethers } from "hardhat";

// Contract addresses
const CONTRACT_ADDRESSES = {
  StudyToken: "0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6",
  StudyTokenShop: "0x0f3E353B65eFEe59551fEa9689B77C74C1E7423c",
};

async function main() {
  console.log("🧪 Detailed purchase test...");

  try {
    const [deployer] = await ethers.getSigners();
    console.log(`Using deployer: ${deployer.address}`);

    // Connect to contracts
    const StudyToken = await ethers.getContractFactory("StudyToken");
    const studyToken = StudyToken.attach(CONTRACT_ADDRESSES.StudyToken);

    const StudyTokenShop = await ethers.getContractFactory("StudyTokenShop");
    const shop = StudyTokenShop.attach(CONTRACT_ADDRESSES.StudyTokenShop);

    // Get balances before
    const buyerBalanceBefore = await studyToken.balanceOf(deployer.address);
    const shopBalanceBefore = await studyToken.balanceOf(CONTRACT_ADDRESSES.StudyTokenShop);
    
    console.log("\n📊 Balances Before:");
    console.log(`   Buyer: ${buyerBalanceBefore.toString()} wei (${ethers.formatEther(buyerBalanceBefore)} STUDY)`);
    console.log(`   Shop: ${shopBalanceBefore.toString()} wei (${ethers.formatEther(shopBalanceBefore)} STUDY)`);

    // Get current price
    const currentPrice = await shop.currentPrice();
    console.log(`\n💰 Current Price: ${currentPrice.toString()} wei (${ethers.formatEther(currentPrice)} ETH)`);

    // Calculate expected tokens
    const purchaseAmount = ethers.parseEther("0.001"); // 0.001 ETH
    const expectedTokens = purchaseAmount / currentPrice;
    console.log(`\n🧮 Calculation:`);
    console.log(`   ETH Amount: ${purchaseAmount.toString()} wei`);
    console.log(`   Expected Tokens: ${expectedTokens.toString()} tokens`);
    console.log(`   Expected Tokens (wei): ${(expectedTokens * BigInt(10**18)).toString()} wei`);

    // Get quote from contract
    const contractQuote = await shop.getQuote(purchaseAmount);
    console.log(`   Contract Quote: ${contractQuote.toString()} tokens`);

    // Check if quotes match
    if (contractQuote.toString() === expectedTokens.toString()) {
      console.log("✅ Quotes match!");
    } else {
      console.log("❌ Quotes don't match!");
    }

    // Check if shop has enough tokens
    if (shopBalanceBefore >= contractQuote) {
      console.log("✅ Shop has sufficient tokens");
    } else {
      console.log("❌ Shop has insufficient tokens!");
      return;
    }

    // Perform purchase
    console.log(`\n🛒 Purchasing tokens...`);
    const tx = await shop.buyTokens({ value: purchaseAmount });
    console.log(`   Transaction hash: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`   Gas used: ${receipt?.gasUsed.toString()}`);

    // Get balances after
    const buyerBalanceAfter = await studyToken.balanceOf(deployer.address);
    const shopBalanceAfter = await studyToken.balanceOf(CONTRACT_ADDRESSES.StudyTokenShop);
    
    console.log("\n📊 Balances After:");
    console.log(`   Buyer: ${buyerBalanceAfter.toString()} wei (${ethers.formatEther(buyerBalanceAfter)} STUDY)`);
    console.log(`   Shop: ${shopBalanceAfter.toString()} wei (${ethers.formatEther(shopBalanceAfter)} STUDY)`);

    // Calculate actual tokens received
    const tokensReceived = buyerBalanceAfter - buyerBalanceBefore;
    const tokensTransferred = shopBalanceBefore - shopBalanceAfter;
    
    console.log("\n🎯 Results:");
    console.log(`   Tokens received by buyer: ${tokensReceived.toString()} wei`);
    console.log(`   Tokens transferred from shop: ${tokensTransferred.toString()} wei`);
    console.log(`   Expected tokens: ${contractQuote.toString()} wei`);
    
    if (tokensReceived.toString() === contractQuote.toString()) {
      console.log("✅ SUCCESS: Buyer received correct amount!");
    } else {
      console.log("❌ FAILURE: Buyer did not receive correct amount!");
      console.log(`   Difference: ${(contractQuote - tokensReceived).toString()} wei`);
    }

    if (tokensReceived.toString() === tokensTransferred.toString()) {
      console.log("✅ Transfer amounts match");
    } else {
      console.log("❌ Transfer amounts don't match!");
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
