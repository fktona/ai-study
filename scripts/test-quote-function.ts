import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing getQuote function directly...");

  try {
    const CONTRACT_ADDRESSES = {
      StudyTokenShop: "0x5E7dBf091CA3742a9ad92EC67397f444cCbCc66E",
    };

    const StudyTokenShop = await ethers.getContractFactory("StudyTokenShop");
    const shop = StudyTokenShop.attach(CONTRACT_ADDRESSES.StudyTokenShop);

    // Test different amounts
    const testAmounts = [
      "0.001",   // 0.001 ETH
      "0.01",    // 0.01 ETH
      "0.1",     // 0.1 ETH
    ];

    for (const amount of testAmounts) {
      console.log(`\n📊 Testing ${amount} ETH:`);
      
      // Convert to wei
      const ethInWei = ethers.parseEther(amount);
      console.log(`   ETH in wei: ${ethInWei.toString()}`);
      
      // Get quote from contract
      const quote = await shop.getQuote(ethInWei);
      console.log(`   Contract quote (wei): ${quote.toString()}`);
      console.log(`   Contract quote (formatted): ${ethers.formatEther(quote)}`);
      
      // Manual calculation
      const priceInfo = await shop.getPriceInfo();
      const currentPrice = priceInfo[0];
      const manualQuote = ethInWei / currentPrice;
      console.log(`   Manual quote: ${manualQuote.toString()}`);
      console.log(`   Manual quote (formatted): ${ethers.formatEther(manualQuote)}`);
      
      // Check if they match
      const matches = quote.toString() === manualQuote.toString();
      console.log(`   Quotes match: ${matches ? "✅" : "❌"}`);
    }

    // Check current price
    const priceInfo = await shop.getPriceInfo();
    console.log(`\n💰 Current Price Info:`);
    console.log(`   Price: ${ethers.formatEther(priceInfo[0])} ETH per token`);
    console.log(`   Price in wei: ${priceInfo[0].toString()}`);

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
