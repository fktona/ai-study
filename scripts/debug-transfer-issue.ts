import { ethers } from "hardhat";

// Contract addresses
const CONTRACT_ADDRESSES = {
  StudyToken: "0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6",
  StudyTokenShop: "0x0f3E353B65eFEe59551fEa9689B77C74C1E7423c",
};

async function main() {
  console.log("🔍 Debugging transfer issue...");

  try {
    // Connect to contracts
    const StudyToken = await ethers.getContractFactory("StudyToken");
    const studyToken = StudyToken.attach(CONTRACT_ADDRESSES.StudyToken);

    const StudyTokenShop = await ethers.getContractFactory("StudyTokenShop");
    const shop = StudyTokenShop.attach(CONTRACT_ADDRESSES.StudyTokenShop);

    // Get current price
    const currentPrice = await shop.currentPrice();
    console.log(`Current price: ${ethers.formatEther(currentPrice)} ETH`);

    // Test calculation
    const ethAmount = ethers.parseEther("0.001");
    const expectedTokens = ethAmount / currentPrice;
    console.log(`\n🧮 Math Check:`);
    console.log(`   ETH Amount: ${ethAmount.toString()} wei`);
    console.log(`   Current Price: ${currentPrice.toString()} wei`);
    console.log(`   Expected Tokens: ${expectedTokens.toString()}`);
    console.log(`   Expected Tokens (formatted): ${ethers.formatEther(expectedTokens)}`);

    // Check shop balance
    const shopBalance = await studyToken.balanceOf(CONTRACT_ADDRESSES.StudyTokenShop);
    console.log(`\n🏪 Shop Balance: ${ethers.formatEther(shopBalance)} STUDY`);

    // Check if shop has enough tokens
    if (shopBalance >= expectedTokens) {
      console.log("✅ Shop has sufficient tokens");
    } else {
      console.log("❌ Shop has insufficient tokens!");
    }

    // Test direct transfer from shop to a test address
    const [deployer] = await ethers.getSigners();
    const testAmount = ethers.parseEther("1"); // 1 token
    
    console.log(`\n🧪 Testing direct transfer of 1 token...`);
    console.log(`   From: Shop (${CONTRACT_ADDRESSES.StudyTokenShop})`);
    console.log(`   To: Deployer (${deployer.address})`);
    console.log(`   Amount: 1 STUDY`);

    // Check if shop can transfer (it should have transfer permissions)
    const deployerBalanceBefore = await studyToken.balanceOf(deployer.address);
    console.log(`   Deployer balance before: ${ethers.formatEther(deployerBalanceBefore)} STUDY`);

    if (shopBalance >= testAmount) {
      console.log("✅ Would be able to transfer 1 token");
    } else {
      console.log("❌ Shop doesn't have 1 token to transfer");
    }

    // Check the shop's StudyToken address
    const shopTokenAddress = await shop.studyToken();
    console.log(`\n🔗 Shop's StudyToken Address: ${shopTokenAddress}`);
    console.log(`   Expected: ${CONTRACT_ADDRESSES.StudyToken}`);
    console.log(`   Match: ${shopTokenAddress.toLowerCase() === CONTRACT_ADDRESSES.StudyToken.toLowerCase() ? "✅" : "❌"}`);

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
