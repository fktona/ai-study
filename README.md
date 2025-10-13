# 🎓 AI Study Group Nexus

> **A Revolutionary Blockchain-Powered Study Platform with AI Tutors, NFT Achievements, and Tokenized Learning**

[![Base](https://img.shields.io/badge/Built%20on-Base-blue)](https://base.org)
[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://reactjs.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-orange)](https://soliditylang.org)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.26.0-yellow)](https://hardhat.org)

## 🚀 **Project Overview**

AI Study Group Nexus is a cutting-edge educational platform that combines **AI-powered tutoring**, **blockchain technology**, and **gamification** to create an immersive learning experience. Students earn **STUDY tokens** for studying, mint **NFT achievements** for milestones, and can stake tokens for rewards - all on the **Base blockchain**.

### 🎯 **Core Innovation**

- **AI Tutor Team**: Multiple AI personalities guide students through complex topics
- **Tokenized Learning**: Earn cryptocurrency for studying and completing sessions
- **NFT Achievements**: Collectible digital certificates for learning milestones
- **DeFi Integration**: Stake tokens, purchase premium subscriptions, and trade achievements
- **Self-Adjusting Economy**: Dynamic token pricing based on demand

---

## 🏗️ **Architecture & Technology Stack**

### **Frontend**

- **React 19.2.0** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive UI
- **Wagmi + Viem** for blockchain interactions
- **WalletConnect** for wallet integration

### **Backend & AI**

- **Google Gemini AI** for intelligent tutoring
- **Real-time audio processing** for voice interactions
- **Session recording and transcription**
- **Dynamic content generation**

### **Blockchain Infrastructure**

- **Base Sepolia Testnet** for smart contracts
- **Hardhat** for development and deployment
- **OpenZeppelin** for secure contract standards
- **ERC-20** tokens and **ERC-721** NFTs

---

## 🎮 **How It Works**

### **1. 🎓 Study Session Experience**

1. **Connect Wallet**: Users connect their MetaMask wallet to Base Sepolia
2. **Choose Study Topic**: Select from various subjects and difficulty levels
3. **AI Tutor Team**: Interact with multiple AI personalities:
   - **Explainer**: Breaks down complex concepts
   - **Quiz Master**: Tests understanding with questions
   - **Skeptic**: Challenges assumptions and deepens thinking
   - **Summarizer**: Consolidates key learnings
4. **Voice Interaction**: Natural conversation with AI tutors
5. **Session Recording**: All sessions are recorded and transcribed
6. **AI Summary**: Get comprehensive summaries and flashcards

### **2. 🪙 Token Economy**

**Earning STUDY Tokens:**

- **Study Time Rewards**: 1 token per hour (free users), 2 tokens per hour (premium)
- **Achievement Bonuses**: Extra tokens for completing milestones
- **Community Contributions**: Tokens for helping other students

**Token Utility:**

- **Premium Subscriptions**: 100 tokens for monthly, 1000 for yearly
- **Staking Rewards**: Earn 12-20% APY by staking tokens
- **P2P Trading**: Trade tokens with other users
- **NFT Minting**: Use tokens to create achievement NFTs

### **3. 🏆 Achievement System**

**NFT Achievement Types:**

- **Session Completion**: For finishing study sessions
- **Study Milestones**: For reaching learning goals
- **BNS Credentials**: For Base Name Service achievements
- **Learning Paths**: For completing structured courses
- **Community Contributions**: For helping other learners

### **4. 💰 DeFi Features**

**Staking Pools:**

- **Short-term (7 days)**: 12% APY
- **Medium-term (30 days)**: 15% APY
- **Long-term (90 days)**: 20% APY

**Dynamic Token Shop:**

- **Self-adjusting prices** based on demand
- **High volume (≥50 ETH/day)**: Price increases 10%
- **Low volume (≤5 ETH/day)**: Price decreases 10%
- **Daily reset** with overnight price decay

---

## 🛠️ **Smart Contracts**

### **StudyToken (ERC-20)**

```
Address: 0x168642d941b4405f628300433Bd8cAb617F4D0d1
```

- **Initial Supply**: 1,000,000 STUDY tokens
- **Max Supply**: 10,000,000 tokens
- **Decimals**: 18
- **Features**: Rewards, subscriptions, P2P trading, staking

### **StudyAchievements (ERC-721)**

```
Address: 0xd959F150F840475127469a6b64134b96CD2f3842
```

- **NFT Collection**: Study achievement certificates
- **5 Achievement Types**: Session, Milestone, BNS, Learning Path, Community
- **Rich Metadata**: Title, description, timestamp, verification status
- **Owner-Only Minting**: Prevents spam and ensures quality

### **StudyStaking**

```
Address: 0xD72aac2c040f2084FAB4D545489Aa74626A66F4C
```

- **3 Staking Pools**: Short (12%), Medium (15%), Long (20%) APY
- **Flexible Staking**: Stake/unstake anytime
- **Reward Claiming**: Claim accumulated rewards
- **Pool Management**: Owner can adjust rates and add new pools

### **StudySubscription**

```
Address: 0x3D14931F7E902D4e4C303939d260d2560Ae9f75E
```

- **Premium Tiers**: Monthly (100 tokens), Yearly (1000 tokens)
- **Token Burning**: Subscriptions burn tokens (deflationary)
- **Subscription Tracking**: On-chain subscription status
- **Auto-renewal**: Optional recurring subscriptions

### **StudyTokenShop** (New!)

```
Address: [To be deployed]
```

- **Dynamic Pricing**: Automatically adjusts based on demand
- **Price Bounds**: 0.00005 ETH to 0.001 ETH per token
- **Daily Volume Tracking**: Monitors demand patterns
- **Instant Token Delivery**: Buy tokens with Base ETH

---

## 🚀 **Getting Started**

### **Prerequisites**

- Node.js 18+
- MetaMask wallet
- Base Sepolia testnet ETH (get from [faucet](https://bridge.base.org/deposit))

### **Installation**

```bash
# Clone the repository
git clone https://github.com/your-username/ai-study-group-nexus.git
cd ai-study-group-nexus

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Google AI API key and other configs
```

### **Development**

```bash
# Start development server
npm run dev

# Compile smart contracts
npm run compile

# Deploy to Base Sepolia
npm run deploy

# Setup initial contracts
npm run setup
```

### **Usage**

1. **Visit**: http://localhost:3001
2. **Connect Wallet**: Connect MetaMask to Base Sepolia
3. **Start Studying**: Choose a topic and begin your AI tutoring session
4. **Earn Tokens**: Complete sessions to earn STUDY tokens
5. **Mint NFTs**: Create achievement certificates
6. **Stake Tokens**: Earn rewards by staking your tokens
7. **Go Premium**: Purchase premium subscriptions for enhanced features

---

## 🎯 **Key Features**

### **🤖 AI-Powered Tutoring**

- **Multiple AI Personalities**: Each with unique teaching styles
- **Voice Interaction**: Natural conversation with AI tutors
- **Adaptive Learning**: AI adjusts to student's learning pace
- **Real-time Feedback**: Instant responses and explanations

### **🎮 Gamification**

- **Achievement NFTs**: Collectible digital certificates
- **Progress Tracking**: Visual progress indicators
- **Leaderboards**: Compare progress with other students
- **Reward System**: Tokens for every study session

### **💰 DeFi Integration**

- **Token Economy**: Earn, spend, and trade STUDY tokens
- **Staking Rewards**: Earn passive income from staking
- **Dynamic Pricing**: Market-driven token prices
- **P2P Trading**: Direct token trading between users

### **🔒 Blockchain Security**

- **Immutable Records**: All achievements stored on-chain
- **Transparent Transactions**: All token movements verifiable
- **Decentralized**: No central authority controls the platform
- **User Ownership**: Users own their achievements and tokens

---

## 📊 **Tokenomics**

### **STUDY Token Distribution**

- **Initial Supply**: 1,000,000 tokens
- **Max Supply**: 10,000,000 tokens
- **Initial Distribution**: 100% to deployer (controlled release)
- **Inflation Rate**: Controlled through smart contracts

### **Token Utility**

- **Study Rewards**: 1-2 tokens per hour of studying
- **Premium Access**: 100-1000 tokens for subscriptions
- **Staking**: Lock tokens to earn 12-20% APY
- **Governance**: Future voting rights on platform decisions

### **Deflationary Mechanisms**

- **Subscription Burning**: Premium subscriptions burn tokens
- **P2P Trading Fees**: Small fees on token transfers
- **Achievement Costs**: Minting NFTs requires tokens
- **Dynamic Pricing**: Market forces balance supply/demand

---

## 🎨 **User Interface**

### **Dashboard**

- **Study Hub**: Quick access to start new sessions
- **Token Balance**: Real-time STUDY token balance
- **Achievement Gallery**: View earned NFT achievements
- **Staking Overview**: Current staked amounts and rewards

### **Study Interface**

- **AI Tutor Selection**: Choose from different AI personalities
- **Voice Controls**: Start/stop recording, adjust settings
- **Live Transcription**: Real-time text of AI conversations
- **Progress Tracking**: Visual indicators of session progress

### **Token Shop**

- **Dynamic Pricing**: Real-time token prices
- **Purchase Interface**: Buy tokens with Base ETH
- **Price Charts**: Historical price data
- **Volume Statistics**: Daily trading volume and trends

---

## 🔮 **Future Roadmap**

### **Phase 1: Core Platform** ✅

- [x] AI tutoring system
- [x] Token economy
- [x] NFT achievements
- [x] Staking system
- [x] Dynamic token shop

### **Phase 2: Enhanced Features** 🚧

- [ ] Mobile app (React Native)
- [ ] Advanced AI tutor customization
- [ ] Community marketplace for study materials
- [ ] Integration with more blockchain networks
- [ ] Advanced analytics and insights

### **Phase 3: Ecosystem Expansion** 📋

- [ ] Partner with educational institutions
- [ ] Launch governance token
- [ ] Create study material marketplace
- [ ] Implement reputation system
- [ ] Add social learning features

---

## 🤝 **Contributing**

We welcome contributions from the community! Here's how you can help:

1. **Bug Reports**: Found a bug? Open an issue
2. **Feature Requests**: Have an idea? Submit a proposal
3. **Code Contributions**: Fork, code, and submit PRs
4. **Documentation**: Help improve our docs
5. **Testing**: Help us test new features

### **Development Guidelines**

- Follow TypeScript best practices
- Write comprehensive tests
- Document new features
- Follow the existing code style

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Base Network**: For providing the blockchain infrastructure
- **OpenZeppelin**: For secure smart contract standards
- **Google Gemini**: For AI tutoring capabilities
- **React Community**: For the amazing frontend framework
- **Web3 Community**: For inspiration and support

---

## 📞 **Contact & Support**

- **Website**: [Coming Soon]
- **Discord**: [Community Server]
- **Twitter**: [@AIStudyNexus]
- **Email**: support@aistudynexus.com

---

## 🏆 **Hackathon Submission**

**Event**: [Hackathon Name]
**Track**: [Track Name]
**Team**: [Team Name]
**Submission Date**: [Date]

### **Demo Links**

- **Live Demo**: [Demo URL]
- **Video Demo**: [Video URL]
- **Smart Contracts**: [BaseScan Explorer Links]
- **GitHub Repository**: [Repository URL]

### **Key Innovations**

1. **First AI + Blockchain Learning Platform** on Base
2. **Self-Adjusting Token Economy** with demand-responsive pricing
3. **NFT Achievement System** with verifiable learning credentials
4. **DeFi Integration** for educational incentives
5. **Voice-Interactive AI Tutors** with multiple personalities

---

_Built with ❤️ for the future of education_
