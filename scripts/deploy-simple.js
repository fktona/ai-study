const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment to Base Sepolia testnet...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy StudyToken
  console.log("\n📝 Deploying StudyToken...");
  const StudyToken = await ethers.getContractFactory("StudyToken");
  const studyToken = await StudyToken.deploy();
  await studyToken.waitForDeployment();
  console.log("✅ StudyToken deployed to:", await studyToken.getAddress());

  // Deploy StudyAchievements
  console.log("\n🏆 Deploying StudyAchievements...");
  const StudyAchievements = await ethers.getContractFactory("StudyAchievements");
  const studyAchievements = await StudyAchievements.deploy("https://api.studynexus.com/nft/");
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

  console.log("\n📋 Deployment Summary:");
  console.log("======================");
  console.log(`Network: baseSepolia`);
  console.log(`Chain ID: 84532`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Block Explorer: https://sepolia.basescan.org`);
  console.log("\nContract Addresses:");
  console.log(`StudyToken: ${await studyToken.getAddress()}`);
  console.log(`StudyAchievements: ${await studyAchievements.getAddress()}`);
  console.log(`StudyStaking: ${await studyStaking.getAddress()}`);
  console.log(`StudySubscription: ${await studySubscription.getAddress()}`);
  console.log(`SessionManager: ${await sessionManager.getAddress()}`);
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Copy the contract addresses above");
  console.log("2. Update lib/contracts.ts with the new addresses");
  console.log("3. Test the enhanced features!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
