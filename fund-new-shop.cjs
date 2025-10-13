const { ethers } = require("hardhat");

// New fixed contract address
const SHOP_ADDRESS = "0x0f3E353B65eFEe59551fEa9689B77C74C1E7423c";
const TOKEN_ADDRESS = "0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6";

async function fundNewShop() {
  console.log("💰 Funding NEW StudyTokenShop with STUDY tokens...");

  try {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    // Connect to StudyToken contract
    const StudyToken = await ethers.getContractFactory("StudyToken");
    const studyToken = StudyToken.attach(TOKEN_ADDRESS);

    // Check deployer's balance
    const deployerBalance = await studyToken.balanceOf(deployer.address);
    console.log(`Deployer balance: ${ethers.formatEther(deployerBalance)} STUDY`);

    // Check current shop balance
    const currentShopBalance = await studyToken.balanceOf(SHOP_ADDRESS);
    console.log(`Current shop balance: ${ethers.formatEther(currentShopBalance)} STUDY`);

    // Amount to transfer to shop (100,000 tokens)
    const transferAmount = ethers.parseEther("100000");
    console.log(`Transferring: ${ethers.formatEther(transferAmount)} STUDY`);

    if (deployerBalance < transferAmount) {
      console.error("❌ Insufficient balance to fund the shop!");
      console.error(`Required: ${ethers.formatEther(transferAmount)} STUDY`);
      console.error(`Available: ${ethers.formatEther(deployerBalance)} STUDY`);
      return;
    }

    // Transfer tokens to shop
    console.log("\n🔄 Transferring tokens to shop...");
    const tx = await studyToken.transfer(SHOP_ADDRESS, transferAmount);
    console.log(`Transaction hash: ${tx.hash}`);
    
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log(`✅ Transfer completed! Gas used: ${receipt?.gasUsed.toString()}`);

    // Verify the transfer
    const shopBalance = await studyToken.balanceOf(SHOP_ADDRESS);
    console.log(`\n📊 Shop balance after transfer: ${ethers.formatEther(shopBalance)} STUDY`);

  } catch (error) {
    console.error("❌ Error funding shop:", error);
  }
}

fundNewShop()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
