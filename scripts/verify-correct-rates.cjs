const { ethers } = require("hardhat");

async function main() {
  console.log("🧮 Verifying correct reward rates...");
  
  const STAKING_ADDRESS = "0xF4bF0776790FA56ea60387F799665276f5417E09";
  
  try {
    const stakingContract = await ethers.getContractAt("StudyStaking", STAKING_ADDRESS);
    
    console.log("📊 Testing reward rates for 1 STUDY token:\n");
    
    // Test all three pools
    for (let poolId = 0; poolId <= 2; poolId++) {
      const poolInfo = await stakingContract.getPoolInfo(poolId);
      const rewardRate = poolInfo.rewardRate;
      
      // Calculate what 1 STUDY token would earn in different time periods
      const oneToken = ethers.parseEther("1");
      
      // 1 hour
      const hourlyRewards = (oneToken * rewardRate * BigInt(3600)) / ethers.parseEther("1");
      const hourlyRewardsEth = parseFloat(ethers.formatEther(hourlyRewards));
      
      // 1 day
      const dailyRewards = hourlyRewards * BigInt(24);
      const dailyRewardsEth = parseFloat(ethers.formatEther(dailyRewards));
      
      // 1 year
      const annualRewards = dailyRewards * BigInt(365);
      const annualRewardsEth = parseFloat(ethers.formatEther(annualRewards));
      
      // Calculate actual APY
      const apy = annualRewardsEth * 100;
      
      const poolNames = ["Short Term (7 days)", "Medium Term (30 days)", "Long Term (90 days)"];
      const expectedAPYs = [12, 15, 20];
      
      console.log(`🏊 Pool ${poolId} - ${poolNames[poolId]}:`);
      console.log(`- Reward Rate: ${ethers.formatEther(rewardRate)} STUDY per second`);
      console.log(`- Hourly Rewards: ${hourlyRewardsEth.toFixed(8)} STUDY`);
      console.log(`- Daily Rewards: ${dailyRewardsEth.toFixed(8)} STUDY`);
      console.log(`- Annual Rewards: ${annualRewardsEth.toFixed(8)} STUDY`);
      console.log(`- APY: ${apy.toFixed(2)}%`);
      console.log(`- Expected APY: ${expectedAPYs[poolId]}%`);
      console.log(`- Correct? ${apy.toFixed(0) === expectedAPYs[poolId].toString() ? "✅ Yes" : "❌ No"}`);
      console.log("");
    }
    
    // Show what 1 STUDY would earn over the full duration
    console.log("⏰ REWARDS FOR FULL STAKING PERIOD (1 STUDY):");
    console.log("=============================================\n");
    
    const durations = [7, 30, 90]; // days
    
    for (let poolId = 0; poolId <= 2; poolId++) {
      const poolInfo = await stakingContract.getPoolInfo(poolId);
      const rewardRate = poolInfo.rewardRate;
      
      const oneToken = ethers.parseEther("1");
      const durationSeconds = BigInt(durations[poolId] * 24 * 3600);
      
      const totalRewards = (oneToken * rewardRate * durationSeconds) / ethers.parseEther("1");
      const totalRewardsEth = parseFloat(ethers.formatEther(totalRewards));
      
      const poolNames = ["Short Term", "Medium Term", "Long Term"];
      const expectedAPYs = [12, 15, 20];
      
      console.log(`${poolNames[poolId]} (${durations[poolId]} days):`);
      console.log(`- Total Rewards: ${totalRewardsEth.toFixed(8)} STUDY`);
      console.log(`- ROI: ${(totalRewardsEth * 100).toFixed(4)}%`);
      console.log(`- Effective APY: ${(totalRewardsEth * 365 / durations[poolId] * 100).toFixed(2)}%`);
      console.log("");
    }
    
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
