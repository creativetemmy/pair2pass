import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { useTheme } from 'next-themes';

const { chains, publicClient } = configureChains(
  [base, baseSepolia],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'Pair2Pass',
  projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect project ID
} as any);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const { theme } = useTheme();

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        theme={theme === 'dark' ? darkTheme() : lightTheme()}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}