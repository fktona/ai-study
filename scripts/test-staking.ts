import { ethers } from "hardhat";
// Contract addresses (hardcoded to avoid module resolution issues)
const CONTRACT_ADDRESSES = {
  baseSepolia: {
    StudyToken: "0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6",
    StudyStaking: "0xe96FdfecFCB50330C873E714f882b90c40621C33",
  }
};

async function main() {
  console.log("🧪 Testing StudyStaking contract...");

  try {
    const [deployer] = await ethers.getSigners();
    console.log(`Using deployer: ${deployer.address}`);

    // Connect to contracts
    const StudyToken = await ethers.getContractFactory("StudyToken");
    const studyToken = StudyToken.attach(CONTRACT_ADDRESSES.baseSepolia.StudyToken);

    const StudyStaking = await ethers.getContractFactory("StudyStaking");
    const staking = StudyStaking.attach(CONTRACT_ADDRESSES.baseSepolia.StudyStaking);

    console.log("\n📊 Contract Addresses:");
    console.log(`   StudyToken: ${CONTRACT_ADDRESSES.baseSepolia.StudyToken}`);
    console.log(`   StudyStaking: ${CONTRACT_ADDRESSES.baseSepolia.StudyStaking}`);

    // Check if contracts are deployed
    try {
      const tokenSymbol = await studyToken.symbol();
      console.log(`   StudyToken Symbol: ${tokenSymbol}`);
    } catch (error) {
      console.log("❌ StudyToken contract not accessible");
    }

    try {
      // Try to call a simple function on the staking contract
      const pool0Info = await staking.getPoolInfo(0);
      console.log(`✅ StudyStaking contract accessible`);
      console.log(`   Pool 0 Info:`, pool0Info);
    } catch (error) {
      console.log("❌ StudyStaking contract not accessible:", error);
      return;
    }

    // Check user's token balance
    const tokenBalance = await studyToken.balanceOf(deployer.address);
    console.log(`\n💰 Token Balance: ${ethers.formatEther(tokenBalance)} STUDY`);

    // Check user's staking info for pool 0
    const userStake = await staking.getUserStake(deployer.address, 0);
    console.log(`\n🎯 User Stake (Pool 0):`);
    console.log(`   Amount: ${ethers.formatEther(userStake.amount)} STUDY`);
    console.log(`   Reward Debt: ${ethers.formatEther(userStake.rewardDebt)} STUDY`);
    console.log(`   Last Stake Time: ${userStake.lastStakeTime}`);
    console.log(`   Total Rewards Claimed: ${ethers.formatEther(userStake.totalRewardsClaimed)} STUDY`);

    // Check pending rewards
    const pendingRewards = await staking.getPendingRewards(deployer.address, 0);
    console.log(`   Pending Rewards: ${ethers.formatEther(pendingRewards)} STUDY`);

    console.log("\n✅ StudyStaking contract is working correctly!");

  } catch (error) {
    console.error("❌ Error testing staking:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
