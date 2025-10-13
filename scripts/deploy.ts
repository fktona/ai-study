import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Starting deployment to Base Sepolia testnet...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy StudyToken
  console.log("\n📝 Deploying StudyToken...");
  const StudyToken = await ethers.getContractFactory("StudyToken");
  const studyToken = await StudyToken.deploy();
  await studyToken.waitForDeployment();
  console.log("✅ StudyToken deployed to:", await studyToken.getAddress());

  // Deploy StudyAchievements
  console.log("\n🏆 Deploying StudyAchievements...");
  const StudyAchievements = await ethers.getContractFactory("StudyAchievements");
  const studyAchievements = await StudyAchievements.deploy("https://gateway.pinata.cloud/ipfs/");
  await studyAchievements.waitForDeployment();
  console.log("✅ StudyAchievements deployed to:", await studyAchievements.getAddress());

  // Deploy StudyStaking
  console.log("\n💰 Deploying StudyStaking...");
  const StudyStaking = await ethers.getContractFactory("StudyStaking");
  const studyStaking = await StudyStaking.deploy(await studyToken.getAddress());
  await studyStaking.waitForDeployment();
  console.log("✅ StudyStaking deployed to:", await studyStaking.getAddress());

  // Deploy StudySubscription
  console.log("\n🎫 Deploying StudySubscription...");
  const StudySubscription = await ethers.getContractFactory("StudySubscription");
  const studySubscription = await StudySubscription.deploy(await studyToken.getAddress());
  await studySubscription.waitForDeployment();
  console.log("✅ StudySubscription deployed to:", await studySubscription.getAddress());

  // Deploy SessionManager
  console.log("\n📚 Deploying SessionManager...");
  const SessionManager = await ethers.getContractFactory("SessionManager");
  const sessionManager = await SessionManager.deploy(await studyToken.getAddress());
  await sessionManager.waitForDeployment();
  console.log("✅ SessionManager deployed to:", await sessionManager.getAddress());

  // Save deployment addresses
  const deploymentInfo = {
    network: "baseSepolia",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      StudyToken: await studyToken.getAddress(),
      StudyAchievements: await studyAchievements.getAddress(),
      StudyStaking: await studyStaking.getAddress(),
      StudySubscription: await studySubscription.getAddress(),
      SessionManager: await sessionManager.getAddress(),
    },
    // Base Sepolia testnet details
    chainId: 84532,
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
  };

  // Write deployment info to file
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const deploymentFile = path.join(deploymentsDir, "baseSepolia.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n📋 Deployment Summary:");
  console.log("======================");
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`Chain ID: ${deploymentInfo.chainId}`);
  console.log(`Deployer: ${deploymentInfo.deployer}`);
  console.log(`Block Explorer: ${deploymentInfo.blockExplorer}`);
  console.log("\nContract Addresses:");
  console.log(`StudyToken: ${await studyToken.getAddress()}`);
  console.log(`StudyAchievements: ${await studyAchievements.getAddress()}`);
  console.log(`StudyStaking: ${await studyStaking.getAddress()}`);
  console.log(`StudySubscription: ${await studySubscription.getAddress()}`);
  console.log(`SessionManager: ${await sessionManager.getAddress()}`);
  
  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Verify contracts on BaseScan");
  console.log("2. Update frontend with contract addresses");
  console.log("3. Set up initial token distribution");
  console.log("4. Test contract interactions");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });