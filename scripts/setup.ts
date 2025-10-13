import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🔧 Setting up initial contract configurations...\n");

  // Load deployment addresses
  const deploymentsDir = path.join(__dirname, "../deployments");
  const deploymentFile = path.join(deploymentsDir, "baseSepolia.json");
  
  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Deployment file not found. Please run deploy.ts first.");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contracts = deploymentInfo.contracts;

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Setting up contracts with account:", deployer.address);

  // Setup StudyToken
  console.log("\n📝 Setting up StudyToken...");
  const studyToken = await ethers.getContractAt("StudyToken", contracts.StudyToken);
  
  // Mint initial tokens to deployer for testing
  const initialMintAmount = ethers.parseEther("10000"); // 10,000 tokens
  const mintTx = await studyToken.mintStudyReward(deployer.address, initialMintAmount);
  await mintTx.wait();
  console.log("✅ Minted 10,000 STUDY tokens to deployer");

  // Setup StudyAchievements
  console.log("\n🏆 Setting up StudyAchievements...");
  const studyAchievements = await ethers.getContractAt("StudyAchievements", contracts.StudyAchievements);
  
  // Skip NFT minting for now - this requires owner permissions
  console.log("✅ StudyAchievements contract ready for use");

  // Setup StudyStaking
  console.log("\n💰 Setting up StudyStaking...");
  const studyStaking = await ethers.getContractAt("StudyStaking", contracts.StudyStaking);
  
  // Approve staking contract to spend tokens
  const approveTx = await studyToken.approve(await studyStaking.getAddress(), ethers.parseEther("1000"));
  await approveTx.wait();
  console.log("✅ Approved staking contract to spend tokens");

  // Stake some tokens for testing
  const stakeAmount = ethers.parseEther("100");
  const stakeTx = await studyStaking.stake(0, stakeAmount); // Stake in short-term pool
  await stakeTx.wait();
  console.log(`✅ Staked ${ethers.formatEther(stakeAmount)} tokens in short-term pool`);

  // Setup StudySubscription
  console.log("\n🎫 Setting up StudySubscription...");
  const studySubscription = await ethers.getContractAt("StudySubscription", contracts.StudySubscription);
  
  // Approve subscription contract to spend tokens
  const approveSubscriptionTx = await studyToken.approve(await studySubscription.getAddress(), ethers.parseEther("100"));
  await approveSubscriptionTx.wait();
  console.log("✅ Approved subscription contract to spend tokens");

  // Purchase a premium monthly subscription for testing
  const purchaseSubscriptionTx = await studySubscription.purchasePremiumMonthly(deployer.address);
  await purchaseSubscriptionTx.wait();
  console.log("✅ Purchased premium monthly subscription");

  console.log("\n📊 Setup Summary:");
  console.log("==================");
  
  // Get token balance
  const tokenBalance = await studyToken.balanceOf(deployer.address);
  console.log(`StudyToken Balance: ${ethers.formatEther(tokenBalance)} STUDY`);
  
  // Get NFT count
  const nftCount = await studyAchievements.balanceOf(deployer.address);
  console.log(`Achievement NFTs: ${nftCount.toString()}`);
  
  // Get staking info
  const userStake = await studyStaking.getUserStake(deployer.address, 0);
  console.log(`Staked Amount: ${ethers.formatEther(userStake.amount)} STUDY`);
  
  // Get subscription info
  const subscription = await studySubscription.getUserSubscription(deployer.address);
  console.log(`Subscription Tier: ${subscription.tier}`);
  console.log(`Subscription Active: ${subscription.isActive}`);
  console.log(`Subscription Ends: ${new Date(subscription.endTime * 1000).toLocaleString()}`);

  console.log("\n🎉 Setup completed successfully!");
  console.log("\nContract addresses for frontend integration:");
  console.log(`STUDY_TOKEN_ADDRESS: ${contracts.StudyToken}`);
  console.log(`STUDY_ACHIEVEMENTS_ADDRESS: ${contracts.StudyAchievements}`);
  console.log(`STUDY_STAKING_ADDRESS: ${contracts.StudyStaking}`);
  console.log(`STUDY_SUBSCRIPTION_ADDRESS: ${contracts.StudySubscription}`);
  
  console.log("\nBase Sepolia Testnet Details:");
  console.log(`Chain ID: 84532`);
  console.log(`RPC URL: https://sepolia.base.org`);
  console.log(`Block Explorer: https://sepolia.basescan.org`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  });

