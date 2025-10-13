import { ethers } from "hardhat";

async function main() {
  console.log("💰 Checking ETH flow verification...");

  try {
    // Get deployer account (your wallet)
    const [deployer] = await ethers.getSigners();
    console.log("Your wallet address:", deployer.address);

    // Check current ETH balance
    const currentBalance = await ethers.provider.getBalance(deployer.address);
    console.log(`Current ETH balance: ${ethers.formatEther(currentBalance)} ETH`);

    // Check shop contract ETH balance
    const CONTRACT_ADDRESSES = {
      StudyTokenShop: "0x5E7dBf091CA3742a9ad92EC67397f444cCbCc66E",
    };
    
    const shopEthBalance = await ethers.provider.getBalance(CONTRACT_ADDRESSES.StudyTokenShop);
    console.log(`Shop ETH balance: ${ethers.formatEther(shopEthBalance)} ETH`);

    // Show recent transactions
    console.log("\n📋 Recent transaction verification:");
    console.log("1. Check your wallet in MetaMask/Coinbase");
    console.log("2. Look for outgoing transactions to the shop");
    console.log("3. Look for incoming transactions from the shop");
    console.log("4. The amounts should be equal (you send 5 ETH, receive 5 ETH)");

    console.log("\n🔗 Transaction Explorer Links:");
    console.log(`Your wallet: https://sepolia.basescan.org/address/${deployer.address}`);
    console.log(`Shop contract: https://sepolia.basescan.org/address/${CONTRACT_ADDRESSES.StudyTokenShop}`);

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
