import { createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { walletConnect, coinbaseWallet, metaMask, safe } from 'wagmi/connectors'

// Get projectId from https://cloud.walletconnect.com
export const projectId = process.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

// Create wagmi config
export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    walletConnect({ 
      projectId,
      metadata: {
        name: 'AI Study Group Nexus',
        description: 'Your Web3-Powered Learning Hub',
        url: 'https://your-app.com',
        icons: ['https://raw.githubusercontent.com/base-org/brand-kit/main/logo/symbol/Base_Symbol_Blue.svg']
      }
    }),
    coinbaseWallet({
      appName: 'AI Study Group Nexus',
      appLogoUrl: 'https://raw.githubusercontent.com/base-org/brand-kit/main/logo/symbol/Base_Symbol_Blue.svg',
    }),
    metaMask(),
    safe(),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
})

export type Config = typeof config
