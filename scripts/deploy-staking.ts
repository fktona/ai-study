import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying StudyStaking contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  try {
    // Deploy StudyStaking
    console.log("\n💰 Deploying StudyStaking...");
    const StudyStaking = await ethers.getContractFactory("StudyStaking");
    const stakingTokenAddress = "0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6"; // StudyToken address
    const studyStaking = await StudyStaking.deploy(stakingTokenAddress);
    await studyStaking.waitForDeployment();
    
    const address = await studyStaking.getAddress();
    console.log("✅ StudyStaking deployed to:", address);

    console.log("\n🎉 StudyStaking deployed successfully!");
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
