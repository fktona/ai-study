require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying remaining contracts...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy StudySubscription
  console.log("\n🎫 Deploying StudySubscription...");
  const StudySubscription = await ethers.getContractFactory("StudySubscription");
  const studySubscription = await StudySubscription.deploy("0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6"); // StudyToken address
  await studySubscription.waitForDeployment();
  console.log("✅ StudySubscription deployed to:", await studySubscription.getAddress());

  // Deploy SessionManager
  console.log("\n📚 Deploying SessionManager...");
  const SessionManager = await ethers.getContractFactory("SessionManager");
  const sessionManager = await SessionManager.deploy("0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6"); // StudyToken address
  await sessionManager.waitForDeployment();
  console.log("✅ SessionManager deployed to:", await sessionManager.getAddress());

  console.log("\n📋 Final Deployment Summary:");
  console.log("============================");
  console.log(`StudyToken: 0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6`);
  console.log(`StudyAchievements: 0xb70a8e8e36077B95a87047b084A869473DB09846`);
  console.log(`StudyStaking: 0xe96FdfecFCB50330C873E714f882b90c40621C33`);
  console.log(`StudySubscription: ${await studySubscription.getAddress()}`);
  console.log(`SessionManager: ${await sessionManager.getAddress()}`);
  
  console.log("\n🎉 All contracts deployed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
