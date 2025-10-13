import { ethers } from "hardhat";

// Contract addresses
const CONTRACT_ADDRESSES = {
  StudyToken: "0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6",
  StudyTokenShop: "0x0f3E353B65eFEe59551fEa9689B77C74C1E7423c",
};

// The wallet that's having issues
const BUYER_WALLET = "0xAe7b6ED9A70568d2f0C9FcdD73ee5d2A3dFf4cC5";

async function main() {
  console.log("🧪 Testing purchase for specific wallet...");
  console.log(`Buyer wallet: ${BUYER_WALLET}`);

  try {
    // Connect to contracts
    const StudyToken = await ethers.getContractFactory("StudyToken");
    const studyToken = StudyToken.attach(CONTRACT_ADDRESSES.StudyToken);

    const StudyTokenShop = await ethers.getContractFactory("StudyTokenShop");
    const shop = StudyTokenShop.attach(CONTRACT_ADDRESSES.StudyTokenShop);

    // Check balances before
    const buyerBalanceBefore = await studyToken.balanceOf(BUYER_WALLET);
    const shopBalanceBefore = await studyToken.balanceOf(CONTRACT_ADDRESSES.StudyTokenShop);
    
    console.log("\n📊 Balances Before Purchase:");
    console.log(`   Buyer: ${ethers.formatEther(buyerBalanceBefore)} STUDY`);
    console.log(`   Shop: ${ethers.formatEther(shopBalanceBefore)} STUDY`);

    // Get current price
    const priceInfo = await shop.getPriceInfo();
    console.log(`\n💰 Current Price: ${ethers.formatEther(priceInfo[0])} ETH per token`);

    // Test with small amount first
    const purchaseAmount = ethers.parseEther("0.01"); // 0.01 ETH
    console.log(`\n🛒 Testing purchase of ${ethers.formatEther(purchaseAmount)} ETH...`);

    // Get quote
    const quote = await shop.getQuote(purchaseAmount);
    console.log(`   Expected tokens: ${quote.toString()}`);

    // Check if shop has enough tokens
    if (shopBalanceBefore < quote) {
      console.log("❌ Shop doesn't have enough tokens!");
      return;
    }

    console.log("✅ Shop has sufficient tokens");
    console.log("💡 The transaction should work from command line");
    console.log("🔍 If frontend is not working, it might be a frontend issue");

    // Check if buyer has enough ETH
    const buyerEthBalance = await ethers.provider.getBalance(BUYER_WALLET);
    console.log(`\n💰 Buyer ETH Balance: ${ethers.formatEther(buyerEthBalance)} ETH`);
    
    if (buyerEthBalance < purchaseAmount) {
      console.log("❌ Buyer doesn't have enough ETH!");
    } else {
      console.log("✅ Buyer has sufficient ETH");
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
