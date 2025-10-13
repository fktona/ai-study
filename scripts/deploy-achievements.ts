import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying StudyAchievements contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  try {
    // Deploy StudyAchievements
    console.log("\n🏆 Deploying StudyAchievements...");
    const StudyAchievements = await ethers.getContractFactory("StudyAchievements");
    const baseURI = "ipfs://QmPlaceholderHash/achievements/"; // IPFS placeholder base URI for NFT metadata
    const studyAchievements = await StudyAchievements.deploy(baseURI);
    await studyAchievements.waitForDeployment();
    
    const address = await studyAchievements.getAddress();
    console.log("✅ StudyAchievements deployed to:", address);

    // Verify deployment
    const name = await studyAchievements.name();
    const symbol = await studyAchievements.symbol();

    console.log("\n📊 Contract Details:");
    console.log(`   Name: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    
    console.log("\n🎉 StudyAchievements deployed successfully!");
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
