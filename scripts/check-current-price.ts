import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Checking current price details...");

  try {
    const CONTRACT_ADDRESSES = {
      StudyTokenShop: "0x5E7dBf091CA3742a9ad92EC67397f444cCbCc66E",
    };

    const StudyTokenShop = await ethers.getContractFactory("StudyTokenShop");
    const shop = StudyTokenShop.attach(CONTRACT_ADDRESSES.StudyTokenShop);

    // Get detailed price info
    const priceInfo = await shop.getPriceInfo();
    console.log("\n📊 Current Price Details:");
    console.log(`   Price: ${ethers.formatEther(priceInfo[0])} ETH per token`);
    console.log(`   Tokens per ETH: ${priceInfo[1].toString()}`);
    console.log(`   Daily Volume: ${ethers.formatEther(priceInfo[2])} ETH`);
    console.log(`   Daily Purchases: ${priceInfo[3].toString()}`);
    console.log(`   Time until reset: ${priceInfo[4].toString()} seconds`);

    // Test different purchase amounts
    console.log("\n🧪 Testing different purchase amounts:");
    
    const testAmounts = [
      ethers.parseEther("0.001"),   // 0.001 ETH
      ethers.parseEther("0.01"),    // 0.01 ETH  
      ethers.parseEther("0.1"),     // 0.1 ETH
      ethers.parseEther("1.0"),     // 1 ETH
    ];

    for (const amount of testAmounts) {
      try {
        const quote = await shop.getQuote(amount);
        const tokensExpected = amount / priceInfo[0];
        console.log(`   ${ethers.formatEther(amount)} ETH → ${quote.toString()} tokens (expected: ${tokensExpected.toString()})`);
      } catch (error) {
        console.log(`   ${ethers.formatEther(amount)} ETH → Error getting quote`);
      }
    }

    // Check if price is too high
    const minPurchase = priceInfo[0]; // Minimum to get 1 token
    console.log(`\n💡 Minimum ETH for 1 token: ${ethers.formatEther(minPurchase)} ETH`);
    
    if (minPurchase > ethers.parseEther("0.01")) {
      console.log("⚠️  WARNING: Price is very high! Small purchases will get 0 tokens due to rounding.");
      console.log("💡 Try purchasing at least 0.01 ETH to get meaningful tokens.");
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
