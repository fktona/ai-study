import { ethers } from "hardhat";

// Contract addresses
const CONTRACT_ADDRESSES = {
  StudyToken: "0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6",
  StudyTokenShop: "0x0f3E353B65eFEe59551fEa9689B77C74C1E7423c",
};

async function main() {
  console.log("🧪 Testing token purchase directly...");

  try {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Buyer address:", deployer.address);

    // Connect to contracts
    const StudyToken = await ethers.getContractFactory("StudyToken");
    const studyToken = StudyToken.attach(CONTRACT_ADDRESSES.StudyToken);

    const StudyTokenShop = await ethers.getContractFactory("StudyTokenShop");
    const shop = StudyTokenShop.attach(CONTRACT_ADDRESSES.StudyTokenShop);

    // Check balances before purchase
    const buyerBalanceBefore = await studyToken.balanceOf(deployer.address);
    const shopBalanceBefore = await studyToken.balanceOf(CONTRACT_ADDRESSES.StudyTokenShop);
    
    console.log("\n📊 Balances Before Purchase:");
    console.log(`   Buyer: ${ethers.formatEther(buyerBalanceBefore)} STUDY`);
    console.log(`   Shop: ${ethers.formatEther(shopBalanceBefore)} STUDY`);

    // Check ETH balance
    const ethBalance = await ethers.provider.getBalance(deployer.address);
    console.log(`   Buyer ETH: ${ethers.formatEther(ethBalance)} ETH`);

    // Get current price from shop
    const priceInfo = await shop.getPriceInfo();
    console.log("\n💰 Current Price Info:");
    console.log(`   Price: ${ethers.formatEther(priceInfo[0])} ETH per token`);
    console.log(`   Tokens per ETH: ${priceInfo[1].toString()}`);

    // Test purchase with 0.001 ETH
    const purchaseAmount = ethers.parseEther("0.001");
    console.log(`\n🛒 Attempting to buy tokens with ${ethers.formatEther(purchaseAmount)} ETH...`);

    // Estimate gas first
    try {
      const gasEstimate = await shop.buyTokens.estimateGas({ value: purchaseAmount });
      console.log(`   Gas estimate: ${gasEstimate.toString()}`);
    } catch (gasError) {
      console.error("❌ Gas estimation failed:", gasError);
      return;
    }

    // Execute purchase
    const tx = await shop.buyTokens({ value: purchaseAmount });
    console.log(`   Transaction hash: ${tx.hash}`);
    
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log(`✅ Purchase completed! Gas used: ${receipt?.gasUsed.toString()}`);

    // Check balances after purchase
    const buyerBalanceAfter = await studyToken.balanceOf(deployer.address);
    const shopBalanceAfter = await studyToken.balanceOf(CONTRACT_ADDRESSES.StudyTokenShop);
    
    console.log("\n📊 Balances After Purchase:");
    console.log(`   Buyer: ${ethers.formatEther(buyerBalanceAfter)} STUDY`);
    console.log(`   Shop: ${ethers.formatEther(shopBalanceAfter)} STUDY`);

    const tokensReceived = buyerBalanceAfter - buyerBalanceBefore;
    console.log(`\n🎉 Tokens Received: ${ethers.formatEther(tokensReceived)} STUDY`);

  } catch (error) {
    console.error("❌ Error during token purchase:", error);
    
    // Try to get more specific error info
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
