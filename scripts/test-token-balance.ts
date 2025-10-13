import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Testing Token Balance Fetch...");

  // Test address - you can change this to any address you want to test
  const testAddress = "0x168642d941b4405f628300433Bd8cAb617F4D0d1"; // Your deployed token contract address

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);

  try {
    // Get the deployed StudyToken contract
    const StudyToken = await ethers.getContractFactory("StudyToken");
    const studyTokenAddress = "0x168642d941b4405f628300433Bd8cAb617F4D0d1"; // Your deployed token address
    const studyToken = StudyToken.attach(studyTokenAddress);

    console.log("\n📋 Contract Information:");
    console.log("Token Address:", studyTokenAddress);
    console.log("Test Address:", testAddress);

    // Fetch token information
    const tokenName = await studyToken.name();
    const tokenSymbol = await studyToken.symbol();
    const tokenDecimals = await studyToken.decimals();
    const totalSupply = await studyToken.totalSupply();

    console.log("\n📊 Token Details:");
    console.log("Name:", tokenName);
    console.log("Symbol:", tokenSymbol);
    console.log("Decimals:", tokenDecimals);
    console.log("Total Supply:", ethers.formatEther(totalSupply), tokenSymbol);

    // Fetch balance for test address
    console.log("\n💰 Balance Check:");
    const balance = await studyToken.balanceOf(testAddress);
    const formattedBalance = ethers.formatEther(balance);

    console.log("Raw Balance (wei):", balance.toString());
    console.log("Formatted Balance:", formattedBalance, tokenSymbol);

    // Fetch deployer balance for comparison
    const deployerBalance = await studyToken.balanceOf(deployer.address);
    const formattedDeployerBalance = ethers.formatEther(deployerBalance);

    console.log("\n👤 Deployer Balance:");
    console.log("Address:", deployer.address);
    console.log("Balance:", formattedDeployerBalance, tokenSymbol);

    // Check if address has any balance
    if (balance > 0) {
      console.log("\n✅ Address has STUDY tokens!");
    } else {
      console.log("\n❌ Address has no STUDY tokens.");
    }

    // Fetch additional token info if available
    console.log("\n🔍 Additional Information:");
    
    try {
      // Check if user has study rewards
      const studyRewards = await studyToken.getUserStudyRewards(testAddress);
      console.log("Study Rewards:", ethers.formatEther(studyRewards), tokenSymbol);

      // Check last reward claim
      const lastClaim = await studyToken.getUserLastRewardClaim(testAddress);
      if (lastClaim > 0) {
        const claimDate = new Date(Number(lastClaim) * 1000);
        console.log("Last Reward Claim:", claimDate.toISOString());
      } else {
        console.log("Last Reward Claim: Never");
      }
    } catch (error) {
      console.log("Additional info not available:", (error as Error).message);
    }

    // Test balance formatting with different amounts
    console.log("\n🧮 Balance Formatting Examples:");
    const testAmounts = [
      ethers.parseEther("1"),      // 1 token
      ethers.parseEther("0.5"),    // 0.5 tokens
      ethers.parseEther("100"),    // 100 tokens
      ethers.parseEther("0.001"),  // 0.001 tokens
    ];

    testAmounts.forEach((amount, index) => {
      const formatted = ethers.formatEther(amount);
      console.log(`Example ${index + 1}: ${formatted} ${tokenSymbol}`);
    });

    console.log("\n🎉 Token balance test completed successfully!");

  } catch (error) {
    console.error("❌ Error fetching token balance:", error);
    
    if ((error as Error).message.includes("call revert exception")) {
      console.log("\n💡 Possible issues:");
      console.log("- Invalid contract address");
      console.log("- Contract not deployed");
      console.log("- Network connection issue");
    }
  }
}

// Helper function to test multiple addresses
async function testMultipleAddresses() {
  console.log("\n🔍 Testing Multiple Addresses...");
  
  const testAddresses = [
    "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Example 1
    "0x1234567890123456789012345678901234567890", // Example 2
    // Add more addresses as needed
  ];

  const StudyToken = await ethers.getContractFactory("StudyToken");
  const studyTokenAddress = "0x168642d941b4405f628300433Bd8cAb617F4D0d1";
  const studyToken = StudyToken.attach(studyTokenAddress);

  for (const address of testAddresses) {
    try {
      const balance = await studyToken.balanceOf(address);
      const formattedBalance = ethers.formatEther(balance);
      
      console.log(`\n📍 Address: ${address}`);
      console.log(`Balance: ${formattedBalance} STUDY`);
      
      if (balance > 0) {
        console.log("✅ Has tokens");
      } else {
        console.log("❌ No tokens");
      }
    } catch (error) {
      console.log(`\n📍 Address: ${address}`);
      console.log(`❌ Error: ${(error as Error).message}`);
    }
  }
}

// Run the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

// Uncomment to test multiple addresses
// testMultipleAddresses();
