import { ethers } from "hardhat";

// Contract addresses (hardcoded to avoid module resolution issues)
const CONTRACT_ADDRESSES = {
  baseSepolia: {
    StudyToken: "0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6",
    StudyStaking: "0xe96FdfecFCB50330C873E714f882b90c40621C33",
  }
};

async function main() {
  console.log("🧪 Testing complete staking flow...");

  try {
    const [deployer] = await ethers.getSigners();
    console.log(`Using deployer: ${deployer.address}`);

    // Connect to contracts
    const StudyToken = await ethers.getContractFactory("StudyToken");
    const studyToken = StudyToken.attach(CONTRACT_ADDRESSES.baseSepolia.StudyToken);

    const StudyStaking = await ethers.getContractFactory("StudyStaking");
    const staking = StudyStaking.attach(CONTRACT_ADDRESSES.baseSepolia.StudyStaking);

    // Check initial balances
    const initialTokenBalance = await studyToken.balanceOf(deployer.address);
    console.log(`\n💰 Initial Token Balance: ${ethers.formatEther(initialTokenBalance)} STUDY`);

    // Check if user needs to approve the staking contract
    const allowance = await studyToken.allowance(deployer.address, CONTRACT_ADDRESSES.baseSepolia.StudyStaking);
    console.log(`🔐 Current Allowance: ${ethers.formatEther(allowance)} STUDY`);

    if (allowance < ethers.parseEther("10")) {
      console.log(`\n🔓 Approving staking contract...`);
      const approveTx = await studyToken.approve(CONTRACT_ADDRESSES.baseSepolia.StudyStaking, ethers.parseEther("1000"));
      await approveTx.wait();
      console.log(`✅ Approved 1000 STUDY for staking`);
    }

    // Test staking 10 STUDY tokens in pool 0 (short-term)
    const stakeAmount = ethers.parseEther("10");
    console.log(`\n🎯 Staking ${ethers.formatEther(stakeAmount)} STUDY in Pool 0...`);
    
    const stakeTx = await staking.stake(0, stakeAmount);
    console.log(`   Transaction hash: ${stakeTx.hash}`);
    await stakeTx.wait();
    console.log(`✅ Staking successful!`);

    // Check updated balances
    const newTokenBalance = await studyToken.balanceOf(deployer.address);
    console.log(`\n📊 Updated Token Balance: ${ethers.formatEther(newTokenBalance)} STUDY`);

    // Check staking info
    const userStake = await staking.getUserStake(deployer.address, 0);
    console.log(`\n🎯 User Stake Info:`);
    console.log(`   Staked Amount: ${ethers.formatEther(userStake.amount)} STUDY`);
    console.log(`   Last Stake Time: ${userStake.lastStakeTime}`);

    // Check pending rewards
    const pendingRewards = await staking.getPendingRewards(deployer.address, 0);
    console.log(`   Pending Rewards: ${ethers.formatEther(pendingRewards)} STUDY`);

    console.log(`\n✅ Staking flow test completed successfully!`);

  } catch (error) {
    console.error("❌ Error in staking flow:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

