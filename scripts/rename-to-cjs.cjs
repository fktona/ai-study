const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

    // Rename .js files to .cjs
    const files = ['deploy.js', 'deploy-shop.js', 'setup.js', 'test-token-balance.js', 'check-balance.js', 'test-transfer.js', 'distribute-tokens.js', 'deploy-token-only.js', 'deploy-achievements.js', 'deploy-staking.js', 'deploy-subscription.js', 'check-shop-balance.js', 'fund-token-shop.js', 'check-wallet-balance.js', 'transfer-token-ownership.js', 'withdraw-from-shop.js', 'test-token-purchase.js', 'debug-calculation.js', 'debug-token-interaction.js', 'check-current-price.js', 'test-quote-function.js', 'check-eth-flow.js', 'debug-transfer-issue.js', 'detailed-purchase-test.js', 'debug-contract-calculation.js', 'test-staking.js', 'test-staking-flow.js'];
files.forEach(file => {
  // Try both possible locations
  const jsPath1 = path.join(distDir, 'scripts', file);
  const jsPath2 = path.join(distDir, file);
  const cjsPath = path.join(distDir, file.replace('.js', '.cjs'));
  
  let jsPath = null;
  if (fs.existsSync(jsPath1)) {
    jsPath = jsPath1;
  } else if (fs.existsSync(jsPath2)) {
    jsPath = jsPath2;
  }
  
  if (jsPath) {
    fs.renameSync(jsPath, cjsPath);
    console.log(`Renamed ${file} to ${file.replace('.js', '.cjs')}`);
  } else {
    console.warn(`File not found: ${file} (tried both locations)`);
  }
});
