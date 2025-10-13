import { Tutor, TutorRole, VoiceName, NFTCredential, MarketplaceItem, GovernanceProposal, UserProfile, BaseLearningModule } from './types';

export const AVAILABLE_TUTORS: Tutor[] = [
  {
    id: 'clara-explainer',
    name: 'Clara',
    gender: 'female',
    role: TutorRole.EXPLAINER,
    description: 'Breaks down complex topics into simple, understandable concepts.',
    avatarUrl: 'https://picsum.photos/seed/clara/200',
    voiceColor: 'text-sky-400'
  },
  {
    id: 'ben-quizzer',
    name: 'Ben',
    gender: 'male',
    role: TutorRole.QUIZ_MASTER,
    description: 'Asks challenging questions to test understanding and recall.',
    avatarUrl: 'https://picsum.photos/seed/ben/200',
    voiceColor: 'text-amber-400'
  },
  {
    id: 'aria-skeptic',
    name: 'Aria',
    gender: 'female',
    role: TutorRole.SKEPTIC,
    description: 'Challenges assumptions and encourages critical thinking.',
    avatarUrl: 'https://picsum.photos/seed/aria/200',
    voiceColor: 'text-rose-400'
  },
  {
    id: 'leo-summarizer',
    name: 'Leo',
    gender: 'male',
    role: TutorRole.SUMMARIZER,
    description: 'Synthesizes information and provides clear, concise summaries.',
    avatarUrl: 'https://picsum.photos/seed/leo/200',
    voiceColor: 'text-emerald-400'
  },
   {
    id: 'nina-explainer-2',
    name: 'Nina',
    gender: 'female',
    role: TutorRole.EXPLAINER,
    description: 'Uses analogies and real-world examples to clarify difficult subjects.',
    avatarUrl: 'https://picsum.photos/seed/nina/200',
    voiceColor: 'text-fuchsia-400'
  },
  {
    id: 'omar-quizzer-2',
    name: 'Omar',
    gender: 'male',
    role: TutorRole.QUIZ_MASTER,
    description: 'Creates scenario-based questions to apply theoretical knowledge.',
    avatarUrl: 'https://picsum.photos/seed/omar/200',
    voiceColor: 'text-yellow-300'
  }
];

export const AVAILABLE_VOICES: VoiceName[] = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];

export const VOICE_SAMPLES: Record<VoiceName, string> = {
  Zephyr: 'https://cdn.pixabay.com/audio/2022/11/17/audio_8332b60b73.mp3', // Male, calm "Hope to see you soon"
  Puck: 'https://cdn.pixabay.com/audio/2023/09/23/audio_735a242137.mp3', // Male, energetic "Welcome"
  Charon: 'https://cdn.pixabay.com/audio/2021/08/25/audio_5539560f1c.mp3', // Male, deep "Hello"
  Kore: 'https://cdn.pixabay.com/audio/2022/03/15/audio_339db722a8.mp3', // Female, clear "Hello"
  Fenrir: 'https://cdn.pixabay.com/audio/2022/03/15/audio_b292d308b0.mp3', // Female, warm "Welcome"
};

export const MOCK_NFTS: NFTCredential[] = [
  {
    id: 'nft-1',
    name: 'First Session Completion',
    description: 'Awarded for successfully completing your first AI study session.',
    imageUrl: 'https://placehold.co/400x400/7c3aed/ffffff?text=1st+Session',
    date: '2024-07-28',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd'
  },
  {
    id: 'nft-2',
    name: 'Pharmacology Pro',
    description: 'Demonstrated deep understanding in a pharmacology study session.',
    imageUrl: 'https://placehold.co/400x400/10b981/ffffff?text=Pharma+Pro',
    date: '2024-07-29',
    transactionHash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  },
  {
    id: 'nft-official-1',
    name: 'Official Course Completion: Cardiology 101',
    description: 'Verified by Nexus University of Medicine.',
    imageUrl: 'https://placehold.co/400x400/0ea5e9/ffffff?text=Cardiology+101',
    date: '2024-08-01',
    transactionHash: '0xabc1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    isOfficial: true,
  }
];

export const MOCK_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 'item-1',
    name: 'Cardiology Mnemonics',
    description: 'A comprehensive PDF with mnemonics for common cardiology drugs.',
    creatorBns: 'cardiogod.base',
    price: 50,
    imageUrl: 'https://placehold.co/400x300/be185d/ffffff?text=PDF',
    creatorRoyaltyPercent: 95,
  },
  {
    id: 'item-2',
    name: 'Renal Physiology Notes',
    description: 'Detailed, high-yield notes on renal physiology, perfect for exams.',
    creatorBns: 'dr.kidney.base',
    price: 75,
    imageUrl: 'https://placehold.co/400x300/0ea5e9/ffffff?text=NOTES',
    creatorRoyaltyPercent: 95,
  },
  {
    id: 'item-3',
    name: 'AI Tutor Config: Aggressive Quizzer',
    description: 'A pre-configured AI tutor setup for rapid-fire quizzing sessions.',
    creatorBns: 'tutor-master.base',
    price: 25,
    imageUrl: 'https://placehold.co/400x300/f59e0b/ffffff?text=AI+CONFIG',
    creatorRoyaltyPercent: 95,
  }
];

export const MOCK_GOVERNANCE_PROPOSALS: GovernanceProposal[] = [
  {
    id: 'prop-1',
    title: 'Increase Session Rewards to 150 $STUDY',
    description: 'Proposal to increase the token reward for completing a study session from 100 to 150 to incentivize participation.',
    votesFor: 125000,
    votesAgainst: 34000,
    userVote: null,
    endsIn: '3 days'
  },
  {
    id: 'prop-2',
    title: 'Add a "Peer Review" Feature',
    description: 'Integrate a new feature where students can submit their notes for peer review and earn tokens for providing quality feedback.',
    votesFor: 89000,
    votesAgainst: 11000,
    userVote: 'for',
    endsIn: '1 week'
  }
];

export const MOCK_STUDENTS: UserProfile[] = [
  {
    address: '0x111', bns: 'medstudent.base', balance: 120, subscription: 'free',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=medstudent',
    school: 'Stanford University School of Medicine', major: 'Pharmacology', year: 2
  },
  {
    address: '0x222', bns: 'futurepharmd.base', balance: 350, subscription: 'premium',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=pharmd',
    school: 'UCSF School of Pharmacy', major: 'Pharmaceutical Chemistry', year: 3
  },
  {
    address: '0x333', bns: 'neurogal.base', balance: 80, subscription: 'free',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=neurogal',
    school: 'Johns Hopkins School of Medicine', major: 'Neuroscience', year: 1
  },
  {
    address: '0x444', bns: 'cardiobro.base', balance: 500, subscription: 'premium',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=cardiobro',
    school: 'Harvard Medical School', major: 'Cardiology', year: 4
  },
   {
    address: '0x555', bns: 'onco-one.base', balance: 210, subscription: 'free',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=oncoone',
    school: 'Stanford University School of Medicine', major: 'Oncology', year: 3
  },
  {
    address: '0x666', bns: 'pharmgoddess.base', balance: 95, subscription: 'premium',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=pharmgoddess',
    school: 'UCSF School of Pharmacy', major: 'Pharmacology', year: 2
  },
];

export const BASE_LEARNING_MODULES: BaseLearningModule[] = [
  {
    id: 'what-is-base',
    title: 'Module 1: What is Base?',
    description: 'Understand the fundamentals of Base as a secure, low-cost Ethereum L2.',
    content: `Base is a secure, low-cost, builder-friendly Ethereum Layer 2 (L2) built to bring the next billion users onchain. It is designed to be the onchain home for Coinbase products, and a vibrant, open ecosystem for everyone.

Key Features:
- Secured by Ethereum: Base leverages the security and decentralization of Ethereum.
- Low Cost: Enjoy a fraction of the transaction fees compared to Ethereum Mainnet.
- EVM Equivalence: If you can build on Ethereum, you can build on Base. Use the same tools and workflows.
- Open Source: Built on the OP Stack in collaboration with Optimism, ensuring it remains a public good.
- Scalability: Designed for scale, from simple applications to complex onchain games.`
  },
  {
    id: 'getting-started',
    title: 'Module 2: Getting Started with Base',
    description: 'Learn how to set up your wallet and connect to the Base network.',
    content: `To interact with Base, you need a crypto wallet. Coinbase Wallet is a great option, but any EVM-compatible wallet works.

Steps to Connect:
1.  Get a Wallet: Download Coinbase Wallet, MetaMask, or another compatible wallet.
2.  Add Base Network: Your wallet needs to know how to connect to Base. You can often do this automatically by visiting a Base-powered app, or you can add it manually with these details:
    - Network Name: Base
    - RPC Endpoint: https://mainnet.base.org
    - Chain ID: 8453
    - Currency Symbol: ETH
    - Block Explorer: https://basescan.org
3.  You're Connected: Once added, you can switch your wallet's active network to Base.`
  },
  {
    id: 'bridging-funds',
    title: 'Module 3: Bridging Funds to Base',
    description: 'Discover how to move your assets from Ethereum or other chains onto Base.',
    content: `Bridging is the process of moving assets from one blockchain to another. To use dapps on Base, you'll need ETH for gas fees and any other tokens you wish to use.

How to Bridge:
- Official Base Bridge: The most secure way to move ETH and select ERC-20 tokens from Ethereum to Base is using the official bridge at bridge.base.org. This process is secure but can take a few minutes.
- Third-Party Bridges: Other bridges, like Stargate or Synapse, may offer bridging from other chains besides Ethereum and might be faster, but always do your own research on their security.
- Centralized Exchanges: Some exchanges, like Coinbase, allow you to withdraw certain assets directly onto the Base network, which is often the easiest method.

Remember: Always double-check the URL of any bridge you use to avoid phishing scams.`
  },
  {
    id: 'gas-fees',
    title: 'Module 4: Gas Fees and Transactions',
    description: 'Understand how transaction fees work on an L2 and why they are so low.',
    content: `Base, as a Layer 2, processes transactions off of the main Ethereum chain, which makes them much cheaper and faster.

How it works:
- Gas Token: Transaction fees (gas) on Base are paid in ETH, just like on Ethereum.
- Low Fees: The cost of a transaction on Base is composed of two parts: the L2 execution fee (very low) and the L1 security fee. Because many transactions are bundled (or "rolled up") together, the cost of posting to L1 is split among many users, making it inexpensive for everyone.
- Sequencer: Transactions are submitted to a "Sequencer," a node that orders them, bundles them up, and posts the compressed data to Ethereum. This is how Base inherits Ethereum's security.
- EIP-4844: With the introduction of "blobs" (EIP-4844), the cost of posting data to L1 has been further reduced, making Base transactions even cheaper.`
  },
  {
    id: 'building-on-base',
    title: 'Module 5: Building on Base',
    description: 'An overview of the developer experience and tools available for building dapps.',
    content: `Building on Base is designed to be incredibly simple for Ethereum developers due to its EVM-equivalence.

Developer Experience:
- Familiar Tools: You can use the exact same tools you're used to, such as Foundry, Hardhat, Remix, and thirdweb.
- Smart Contracts: Write your smart contracts in Solidity or Vyper, just as you would for Ethereum.
- Account Abstraction (EIP-4337): Base has native support for Account Abstraction, enabling features like gasless transactions, social logins, and more for a smoother user experience.
- Infrastructure: All major infrastructure providers, like Infura, Alchemy, and QuickNode, support Base, giving you reliable RPC access.
- Oracles: Chainlink and other oracle services are available on Base, providing reliable off-chain data for your smart contracts.`
  }
];

// Monetization Constants
export const PREMIUM_SUBSCRIPTION_PRICE = 250; // in $STUDY tokens

export const FREE_TIER_FEATURES = [
    'Access all learning modules',
    'Up to 3 AI Tutors per session',
    'Standard voice chat quality',
    'Community access',
];

export const PREMIUM_TIER_FEATURES = [
    'Everything in Free, plus:',
    'Up to 6 AI Tutors per session',
    'Access to specialty AI Tutors (coming soon)',
    'Unlimited session history',
    'Detailed post-session analytics',
    'Premium member badge on profile',
];

export const MARKETPLACE_PLATFORM_FEE = 0.025; // 2.5%

export const STAKING_APY = 0.12; // 12% APY

export const OFFICIAL_NFT_MINT_FEE = 50; // in $STUDY tokens