const { ethers } = require("hardhat");

async function main() {
  console.log("🔄 Simple Token Transfer Test...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using deployer account:", deployer.address);

  // Contract address
  const STUDY_TOKEN_ADDRESS = "0x168642d941b4405f628300433Bd8cAb617F4D0d1";

  // Get the StudyToken contract
  const StudyToken = await ethers.getContractFactory("StudyToken");
  const studyToken = StudyToken.attach(STUDY_TOKEN_ADDRESS);

  // Test recipient address (you can change this)
  const recipientAddress = "0x1234567890123456789012345678901234567890";
  const amount = ethers.parseEther("10"); // Send 10 tokens

  console.log("\n📋 Transfer Details:");
  console.log("From:", deployer.address);
  console.log("To:", recipientAddress);
  console.log("Amount: 10 STUDY tokens");

  // Check balances before
  console.log("\n🔍 Checking balances before transfer...");
  const senderBalance = await studyToken.balanceOf(deployer.address);
  const receiverBalance = await studyToken.balanceOf(recipientAddress);
  
  console.log(`Sender balance: ${ethers.formatEther(senderBalance)} STUDY tokens`);
  console.log(`Receiver balance: ${ethers.formatEther(receiverBalance)} STUDY tokens`);

  // Check if sender has enough balance
  if (senderBalance < amount) {
    console.log("❌ Insufficient balance!");
    return;
  }

  console.log("\n🚀 Executing transfer...");
  
  try {
    // Execute transfer
    const tx = await studyToken.transfer(recipientAddress, amount);
    console.log("Transaction hash:", tx.hash);
    
    // Wait for confirmation
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log("✅ Transfer successful!");
      
      // Check balances after
      console.log("\n🔍 Checking balances after transfer...");
      const newSenderBalance = await studyToken.balanceOf(deployer.address);
      const newReceiverBalance = await studyToken.balanceOf(recipientAddress);
      
      console.log(`Sender balance: ${ethers.formatEther(newSenderBalance)} STUDY tokens`);
      console.log(`Receiver balance: ${ethers.formatEther(newReceiverBalance)} STUDY tokens`);
      
      console.log("\n📊 Transfer Summary:");
      console.log(`Amount transferred: 10 STUDY tokens`);
      console.log(`Gas used: ${receipt.gasUsed.toString()}`);
      
    } else {
      console.log("❌ Transfer failed!");
    }
    
  } catch (error) {
    console.error("❌ Transfer error:", error);
  }
}

main()
  .then(() => {
    console.log("\n🎉 Test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
