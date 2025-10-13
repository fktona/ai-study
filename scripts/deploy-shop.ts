import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying StudyTokenShop...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  if (balance < 0.01) {
    throw new Error("Not enough ETH for deployment");
  }

  // Deploy StudyTokenShop
  const StudyTokenShop = await ethers.getContractFactory("StudyTokenShop");
  const studyTokenShop = await StudyTokenShop.deploy("0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6"); // Your deployed StudyToken address
  
  await studyTokenShop.waitForDeployment();
  const shopAddress = await studyTokenShop.getAddress();

  console.log("✅ StudyTokenShop deployed to:", shopAddress);

  // Get deployment info
  const deploymentInfo = {
    network: "baseSepolia",
    shopAddress: shopAddress,
    tokenAddress: "0x168642d941b4405f628300433Bd8cAb617F4D0d1",
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    gasUsed: (await studyTokenShop.deploymentTransaction()?.wait())?.gasUsed?.toString(),
  };

  console.log("\n📋 Deployment Summary:");
  console.log("================================");
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`Shop Contract: ${deploymentInfo.shopAddress}`);
  console.log(`Token Contract: ${deploymentInfo.tokenAddress}`);
  console.log(`Deployer: ${deploymentInfo.deployer}`);
  console.log(`Deployment Time: ${deploymentInfo.deploymentTime}`);
  console.log(`Gas Used: ${deploymentInfo.gasUsed}`);
  console.log("================================");

  // Test the shop
  console.log("\n🧪 Testing Shop Configuration:");
  const priceInfo = await studyTokenShop.getPriceInfo();
  console.log(`Current Price: ${ethers.formatEther(priceInfo.price)} ETH per token`);
  console.log(`Tokens per ETH: ${ethers.formatEther(priceInfo.tokensPerEth)}`);
  console.log(`Daily Volume: ${ethers.formatEther(priceInfo.dailyVol)} ETH`);
  console.log(`Daily Purchases: ${priceInfo.dailyPurchasesCount}`);
  console.log(`Time until reset: ${priceInfo.timeUntilReset} seconds`);

  // Save deployment info
  const fs = require('fs');
  const deploymentData = {
    ...deploymentInfo,
    contracts: {
      StudyTokenShop: {
        address: shopAddress,
        abi: StudyTokenShop.interface.fragments
      }
    }
  };

  fs.writeFileSync(
    `deployments/baseSepolia-shop-${Date.now()}.json`,
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Update your frontend with the new shop address");
  console.log("2. Test token purchases");
  console.log("3. Monitor price adjustments");
  console.log("4. Set up analytics tracking");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
