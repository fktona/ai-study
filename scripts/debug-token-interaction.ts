import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Debugging StudyToken interaction with shop...");

  try {
    const CONTRACT_ADDRESSES = {
      StudyToken: "0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6",
      StudyTokenShop: "0x0f3E353B65eFEe59551fEa9689B77C74C1E7423c",
    };

    // Connect to contracts
    const StudyToken = await ethers.getContractFactory("StudyToken");
    const studyToken = StudyToken.attach(CONTRACT_ADDRESSES.StudyToken);

    const StudyTokenShop = await ethers.getContractFactory("StudyTokenShop");
    const shop = StudyTokenShop.attach(CONTRACT_ADDRESSES.StudyTokenShop);

    // Check if shop contract can call StudyToken functions
    console.log("🔗 Testing contract interactions...");

    // 1. Check shop's token balance (direct call)
    const shopBalance = await studyToken.balanceOf(CONTRACT_ADDRESSES.StudyTokenShop);
    console.log(`   Shop Balance (direct): ${ethers.formatEther(shopBalance)} STUDY`);

    // 2. Check what the shop contract thinks its balance is
    // We need to simulate the balanceOf call from within the shop contract
    console.log("\n🧪 Simulating buyTokens function...");

    // Try to simulate the exact conditions in buyTokens
    const ethAmount = ethers.parseEther("0.001");
    const currentPrice = ethers.parseEther("0.0001");
    const tokenAmount = ethAmount / currentPrice;

    console.log(`   ETH Amount: ${ethers.formatEther(ethAmount)} ETH`);
    console.log(`   Token Amount: ${tokenAmount.toString()} tokens`);

    // Check if the shop contract has the right StudyToken address
    const shopTokenAddress = await shop.studyToken();
    console.log(`   Shop's StudyToken address: ${shopTokenAddress}`);
    console.log(`   Expected address: ${CONTRACT_ADDRESSES.StudyToken}`);
    console.log(`   Addresses match: ${shopTokenAddress.toLowerCase() === CONTRACT_ADDRESSES.StudyToken.toLowerCase() ? "YES" : "NO"}`);

    // Try to call balanceOf from the shop's perspective
    console.log("\n🔍 Testing balanceOf from shop's perspective...");
    
    // Direct balance check
    const balanceFromShop = await studyToken.balanceOf(CONTRACT_ADDRESSES.StudyTokenShop);
    console.log(`   Balance from shop's perspective: ${ethers.formatEther(balanceFromShop)} STUDY`);

    // Check the shop's owner
    const shopOwner = await shop.owner();
    console.log(`\n👤 Shop Owner: ${shopOwner}`);

    // Check if there are any access control issues
    console.log("\n🔒 Access Control Check:");
    const [deployer] = await ethers.getSigners();
    console.log(`   Deployer: ${deployer.address}`);
    console.log(`   Shop Owner: ${shopOwner}`);
    console.log(`   Is deployer the owner: ${deployer.address.toLowerCase() === shopOwner.toLowerCase() ? "YES" : "NO"}`);

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
