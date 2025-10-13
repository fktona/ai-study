import { ethers } from "hardhat";

// Contract addresses (update these after redeployment)
const CONTRACT_ADDRESSES = {
  StudyToken: "0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6", // Updated with new deployment
};

async function main() {
  console.log("🚀 Starting token distribution...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Connect to the StudyToken contract
  const StudyToken = await ethers.getContractFactory("StudyToken");
  const studyToken = StudyToken.attach(CONTRACT_ADDRESSES.StudyToken);

  // Example: Distribute 1000 tokens to multiple addresses
  const recipients = [
    "0xAe7b6ED9A70568d2f0C9FcdD73ee5d2A3dFf4cC5", // Example address 1
    "0x6FCDEa3EBc59df5b97C1ae31093aF81b7a2A6848", // Example address 2
    // Add more addresses here...
  ];

  const amountPerRecipient = ethers.parseEther("1000"); // 1000 tokens
  const totalAmount = amountPerRecipient * BigInt(recipients.length);

  console.log(`📊 Distribution Details:`);
  console.log(`   Recipients: ${recipients.length}`);
  console.log(`   Amount per recipient: ${ethers.formatEther(amountPerRecipient)} STUDY`);
  console.log(`   Total amount: ${ethers.formatEther(totalAmount)} STUDY`);

  // Check deployer balance
  const deployerBalance = await studyToken.balanceOf(deployer.address);
  console.log(`   Deployer balance: ${ethers.formatEther(deployerBalance)} STUDY`);

  if (deployerBalance < totalAmount) {
    console.error("❌ Insufficient balance for distribution!");
    console.error(`   Required: ${ethers.formatEther(totalAmount)} STUDY`);
    console.error(`   Available: ${ethers.formatEther(deployerBalance)} STUDY`);
    return;
  }

  try {
    // Execute the distribution
    console.log("\n🔄 Executing distribution...");
    const tx = await studyToken.distributeTokens(recipients, amountPerRecipient);
    
    console.log(`📝 Transaction hash: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log(`✅ Distribution completed!`);
    console.log(`   Gas used: ${receipt?.gasUsed.toString()}`);
    
    // Log the event
    const event = receipt?.logs.find((log: any) => {
      try {
        const parsed = studyToken.interface.parseLog(log);
        return parsed?.name === "BatchDistribution";
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = studyToken.interface.parseLog(event);
      console.log(`📢 Event: ${parsed?.name}`);
      console.log(`   Recipient count: ${parsed?.args[0]}`);
      console.log(`   Amount per recipient: ${ethers.formatEther(parsed?.args[1])} STUDY`);
      console.log(`   Total amount: ${ethers.formatEther(parsed?.args[2])} STUDY`);
    }

  } catch (error) {
    console.error("❌ Distribution failed:", error);
  }
}

// Helper function to distribute with custom amounts
async function distributeCustomAmounts() {
  console.log("\n🎯 Custom Amount Distribution Example:");
  
  const [deployer] = await ethers.getSigners();
  const StudyToken = await ethers.getContractFactory("StudyToken");
  const studyToken = StudyToken.attach(CONTRACT_ADDRESSES.StudyToken);

  const recipients = [
    "0x742d35Cc6634C0532925a3b8D3Ac4E8aE4D2A5b4",
    "0x8ba1f109551bD432803012645Hac136c7c4C8B4",
    "0x1234567890123456789012345678901234567890",
  ];

  const amounts = [
    ethers.parseEther("500"),  // 500 tokens
    ethers.parseEther("1000"), // 1000 tokens
    ethers.parseEther("1500"), // 1500 tokens
  ];

  console.log(`📊 Custom Distribution Details:`);
  for (let i = 0; i < recipients.length; i++) {
    console.log(`   ${recipients[i]}: ${ethers.formatEther(amounts[i])} STUDY`);
  }

  try {
    const tx = await studyToken.distributeTokensCustom(recipients, amounts);
    console.log(`📝 Transaction hash: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ Custom distribution completed!`);
    
  } catch (error) {
    console.error("❌ Custom distribution failed:", error);
  }
}

// Run the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
