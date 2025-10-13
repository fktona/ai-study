import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying StudySubscription contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  try {
    // Deploy StudySubscription
    console.log("\n🎫 Deploying StudySubscription...");
    const StudySubscription = await ethers.getContractFactory("StudySubscription");
    const subscriptionTokenAddress = "0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6"; // StudyToken address
    const studySubscription = await StudySubscription.deploy(subscriptionTokenAddress);
    await studySubscription.waitForDeployment();
    
    const address = await studySubscription.getAddress();
    console.log("✅ StudySubscription deployed to:", address);

    console.log("\n🎉 StudySubscription deployed successfully!");
    console.log("📝 Update your contracts.ts file with this address:", address);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
