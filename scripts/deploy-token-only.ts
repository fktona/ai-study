import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying StudyToken with distribution functions...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  try {
    // Deploy StudyToken
    console.log("\n📝 Deploying StudyToken...");
    const StudyToken = await ethers.getContractFactory("StudyToken");
    const studyToken = await StudyToken.deploy();
    await studyToken.waitForDeployment();
    
    const tokenAddress = await studyToken.getAddress();
    console.log("✅ StudyToken deployed to:", tokenAddress);

    // Verify deployment
    const name = await studyToken.name();
    const symbol = await studyToken.symbol();
    const totalSupply = await studyToken.totalSupply();
    const decimals = await studyToken.decimals();

    console.log("\n📊 Token Details:");
    console.log(`   Name: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);
    console.log(`   Decimals: ${decimals}`);

    // Test the new distribution functions
    console.log("\n🧪 Testing distribution functions...");
    
    // Check if the functions exist
    try {
      const contractInterface = studyToken.interface;
      const distributeFunction = contractInterface.getFunction("distributeTokens");
      const distributeCustomFunction = contractInterface.getFunction("distributeTokensCustom");
      
      console.log("✅ distributeTokens function found");
      console.log("✅ distributeTokensCustom function found");
      
      console.log("\n🎉 StudyToken with distribution functions deployed successfully!");
      console.log("📝 Update your contracts.ts file with this address:", tokenAddress);
      
    } catch (error) {
      console.log("❌ Distribution functions not found in deployed contract");
      console.log("Error:", error);
    }

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
