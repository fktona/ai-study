const { ethers } = require("hardhat");

async function main() {
  console.log("💰 Funding new StudyStaking contract with STUDY tokens...");
  
  // Contract addresses
  const STUDY_TOKEN_ADDRESS = "0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6";
  const NEW_STAKING_ADDRESS = "0xaaBf5C87f51AE2D2Cd9562FBB1F7546968927424";
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  // Get contract instances
  const studyToken = await ethers.getContractAt("StudyToken", STUDY_TOKEN_ADDRESS);
  
  // Check deployer's token balance
  const deployerBalance = await studyToken.balanceOf(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(deployerBalance), "STUDY");
  
  // Check new staking contract's current balance
  const stakingBalance = await studyToken.balanceOf(NEW_STAKING_ADDRESS);
  console.log("New staking contract balance before:", ethers.formatEther(stakingBalance), "STUDY");
  
  // Amount to transfer (50,000 tokens for rewards)
  const transferAmount = ethers.parseEther("50000");
  console.log("Transferring:", ethers.formatEther(transferAmount), "STUDY");
  
  // Check if deployer has enough tokens
  if (deployerBalance < transferAmount) {
    console.error("❌ Insufficient balance! Deployer has:", ethers.formatEther(deployerBalance), "STUDY");
    return;
  }
  
  // Transfer tokens to new staking contract
  console.log("🔄 Transferring tokens to new staking contract...");
  const tx = await studyToken.transfer(NEW_STAKING_ADDRESS, transferAmount);
  console.log("Transaction hash:", tx.hash);
  
  console.log("⏳ Waiting for confirmation...");
  await tx.wait();
  
  // Check staking contract's balance after transfer
  const newStakingBalance = await studyToken.balanceOf(NEW_STAKING_ADDRESS);
  console.log("✅ Transfer completed!");
  console.log("📊 New staking contract balance after transfer:", ethers.formatEther(newStakingBalance), "STUDY");
  
  // Verify the transfer worked
  const expectedBalance = stakingBalance + transferAmount;
  if (newStakingBalance === expectedBalance) {
    console.log("✅ Transfer verification successful!");
  } else {
    console.error("❌ Transfer verification failed!");
  }
  
  // Test the fixed contract
  console.log("\n🧪 Testing the fixed contract...");
  const stakingContract = await ethers.getContractAt("StudyStaking", NEW_STAKING_ADDRESS);
  
  try {
    // Test all three pools
    for (let poolId = 0; poolId <= 2; poolId++) {
      const poolInfo = await stakingContract.getPoolInfo(poolId);
      const rewardRate = poolInfo.rewardRate;
      const rewardRateEth = ethers.formatEther(rewardRate);
      
      // Calculate APY
      const oneToken = ethers.parseEther("1");
      const annualRewards = (oneToken * rewardRate * BigInt(365 * 24 * 3600)) / ethers.parseEther("1");
      const apy = parseFloat(ethers.formatEther(annualRewards)) * 100;
      
      const poolNames = ["Short Term (7 days)", "Medium Term (30 days)", "Long Term (90 days)"];
      console.log(`\n🏊 Pool ${poolId} - ${poolNames[poolId]}:`);
      console.log(`- Reward Rate: ${rewardRateEth} STUDY per second`);
      console.log(`- APY: ${apy.toFixed(2)}%`);
      console.log(`- Is Active: ${poolInfo.isActive}`);
    }
    
    console.log("\n🎯 Fixed StudyStaking contract is now ready with correct APYs!");
    
  } catch (error) {
    console.error("❌ Error testing contract:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
