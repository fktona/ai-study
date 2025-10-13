import { ethers } from "hardhat";

// Contract addresses - Base Sepolia Testnet
const CONTRACT_ADDRESSES = {
  baseSepolia: {
    StudyToken: "0x168642d941b4405f628300433Bd8cAb617F4D0d1",
  },
};

async function main() {
  console.log("🔄 Testing Token Transfer...");

  // Get user input for sender and receiver
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, resolve);
    });
  };

  try {
    // Get receiver address and amount
    const receiverAddress = await question("Enter receiver wallet address: ");
    const amount = await question("Enter amount to transfer (e.g., 100): ");

    // Use deployer as sender
    const [deployer] = await ethers.getSigners();
    const fromAddress = deployer.address;

    console.log("\n📋 Transfer Details:");
    console.log("Sender:", fromAddress);
    console.log("Receiver:", receiverAddress);
    console.log("Amount:", amount, "STUDY tokens");

    // Get the StudyToken contract instance
    const StudyToken = await ethers.getContractFactory("StudyToken");
    const studyToken = StudyToken.attach(CONTRACT_ADDRESSES.baseSepolia.StudyToken) as any;

    console.log("\n🔍 Checking balances before transfer...");

    // Check sender balance
    const senderBalance = await studyToken.balanceOf(fromAddress);
    const senderFormattedBalance = ethers.formatUnits(senderBalance, 18);
    console.log(`Sender balance: ${senderFormattedBalance} STUDY tokens`);

    // Check receiver balance
    const receiverBalance = await studyToken.balanceOf(receiverAddress);
    const receiverFormattedBalance = ethers.formatUnits(receiverBalance, 18);
    console.log(`Receiver balance: ${receiverFormattedBalance} STUDY tokens`);

    // Validate amount
    const transferAmount = ethers.parseEther(amount);
    if (senderBalance < transferAmount) {
      console.log("❌ Error: Insufficient balance!");
      console.log(`Required: ${amount} STUDY tokens`);
      console.log(`Available: ${senderFormattedBalance} STUDY tokens`);
      rl.close();
      return;
    }

    // Confirm transfer
    const confirm = await question(`\nConfirm transfer of ${amount} STUDY tokens? (y/N): `);
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log("❌ Transfer cancelled by user.");
      rl.close();
      return;
    }

    console.log("\n🚀 Executing transfer...");

    // Execute the transfer using deployer account
    const tx = await studyToken.transfer(receiverAddress, transferAmount);
    console.log("Transaction submitted:", tx.hash);

    // Wait for confirmation
    console.log("⏳ Waiting for transaction confirmation...");
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      console.log("✅ Transfer successful!");
      console.log("Transaction hash:", receipt.hash);
      console.log("Gas used:", receipt.gasUsed.toString());

      // Check balances after transfer
      console.log("\n🔍 Checking balances after transfer...");
      
      const newSenderBalance = await studyToken.balanceOf(fromAddress);
      const newReceiverBalance = await studyToken.balanceOf(receiverAddress);
      
      const newSenderFormatted = ethers.formatUnits(newSenderBalance, 18);
      const newReceiverFormatted = ethers.formatUnits(newReceiverBalance, 18);
      
      console.log(`Sender balance: ${newSenderFormatted} STUDY tokens`);
      console.log(`Receiver balance: ${newReceiverFormatted} STUDY tokens`);
      
      console.log("\n📊 Transfer Summary:");
      console.log(`Amount transferred: ${amount} STUDY tokens`);
      console.log(`Sender balance change: ${parseFloat(senderFormattedBalance) - parseFloat(newSenderFormatted)} STUDY tokens`);
      console.log(`Receiver balance change: ${parseFloat(newReceiverFormatted) - parseFloat(receiverFormattedBalance)} STUDY tokens`);
      
    } else {
      console.log("❌ Transfer failed!");
    }

  } catch (error) {
    console.error("❌ Error during transfer:", error);
  } finally {
    rl.close();
  }
}

// Helper function to test multiple transfers
async function testMultipleTransfers() {
  console.log("\n🔄 Testing Multiple Transfers...");
  
  const [deployer] = await ethers.getSigners();
  const StudyToken = await ethers.getContractFactory("StudyToken");
  const studyToken = StudyToken.attach(CONTRACT_ADDRESSES.baseSepolia.StudyToken);

  // Test addresses (you can modify these)
  const testAddresses = [
    "0x1234567890123456789012345678901234567890", // Example address 1
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", // Example address 2
  ];

  const amounts = ["10", "50", "100"]; // Different amounts to test

  console.log("Test addresses:", testAddresses);
  console.log("Test amounts:", amounts);

  // You can implement batch transfers here
  console.log("📝 Implement batch transfers as needed");
}

// Run the main function
main()
  .then(() => {
    console.log("\n🎉 Transfer test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
