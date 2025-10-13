require('dotenv').config({ path: '.env.local' });

console.log("🔍 Checking environment variables...\n");

console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "✅ SET" : "❌ NOT SET");
console.log("VITE_WALLETCONNECT_PROJECT_ID:", process.env.VITE_WALLETCONNECT_PROJECT_ID ? "✅ SET" : "❌ NOT SET");
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "✅ SET" : "❌ NOT SET");

if (process.env.PRIVATE_KEY) {
  console.log("\nPrivate key length:", process.env.PRIVATE_KEY.length);
  console.log("Private key starts with:", process.env.PRIVATE_KEY.substring(0, 6) + "...");
  console.log("Private key ends with:", "..." + process.env.PRIVATE_KEY.substring(process.env.PRIVATE_KEY.length - 4));
} else {
  console.log("\n❌ PRIVATE_KEY is not set!");
  console.log("Please add your private key to .env.local file:");
  console.log("PRIVATE_KEY=0x1234567890abcdef...");
}
