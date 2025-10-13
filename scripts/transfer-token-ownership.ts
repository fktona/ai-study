import { ethers } from "hardhat";

// Contract addresses
const CONTRACT_ADDRESSES = {
  StudyToken: "0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6",
  StudyTokenShop: "0x0f3E353B65eFEe59551fEa9689B77C74C1E7423c",
};

async function main() {
  console.log("🔄 Transferring StudyToken ownership to StudyTokenShop...");

  try {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Current owner (deployer):", deployer.address);

    // Connect to StudyToken contract
    const StudyToken = await ethers.getContractFactory("StudyToken");
    const studyToken = StudyToken.attach(CONTRACT_ADDRESSES.StudyToken);

    // Check current owner
    const currentOwner = await studyToken.owner();
    console.log(`Current StudyToken owner: ${currentOwner}`);

    // Check if shop is already the owner
    if (currentOwner.toLowerCase() === CONTRACT_ADDRESSES.StudyTokenShop.toLowerCase()) {
      console.log("✅ StudyTokenShop is already the owner!");
      return;
    }

    // Transfer ownership to shop
    console.log(`\n🔄 Transferring ownership to: ${CONTRACT_ADDRESSES.StudyTokenShop}`);
    const tx = await studyToken.transferOwnership(CONTRACT_ADDRESSES.StudyTokenShop);
    console.log(`Transaction hash: ${tx.hash}`);
    
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log(`✅ Ownership transferred! Gas used: ${receipt?.gasUsed.toString()}`);

    // Verify the transfer
    const newOwner = await studyToken.owner();
    console.log(`\n📊 New StudyToken owner: ${newOwner}`);

    if (newOwner.toLowerCase() === CONTRACT_ADDRESSES.StudyTokenShop.toLowerCase()) {
      console.log("🎉 Success! StudyTokenShop can now mint tokens!");
    } else {
      console.log("❌ Error: Ownership transfer failed");
    }

  } catch (error) {
    console.error("❌ Error transferring ownership:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
