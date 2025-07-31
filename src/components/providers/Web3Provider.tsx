import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { useTheme } from 'next-themes';

const { connectors } = getDefaultWallets({
  appName: 'Pair2Pass',
  projectId: 'c5bbfe4ce3c95a7b11c03dd3bb2e18db',
  chains: [base, baseSepolia],
});

// Simple config without explicit public client to avoid version conflicts
const wagmiConfig = {
  autoConnect: true,
  connectors,
} as any;

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const { theme } = useTheme();

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={[base, baseSepolia]}
        theme={theme === 'dark' ? darkTheme() : lightTheme()}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}