const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

// Rename .js files to .cjs
const files = ['deploy.js', 'setup.js'];
files.forEach(file => {
  const jsPath = path.join(distDir, file);
  const cjsPath = path.join(distDir, file.replace('.js', '.cjs'));
  
  if (fs.existsSync(jsPath)) {
    fs.renameSync(jsPath, cjsPath);
    console.log(`Renamed ${file} to ${file.replace('.js', '.cjs')}`);
  }
});
