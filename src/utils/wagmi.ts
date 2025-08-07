import memoize from "lodash/memoize";
import { Transport } from "viem";
import { createConfig, fallback, http } from "wagmi";
import { baseSepolia, mainnet } from "wagmi/chains";
import {
  coinbaseWallet,
  injected,
  safe,
  walletConnect,
} from "wagmi/connectors";

import { CHAINS } from "@/config/chains";
import { PUBLIC_NODES } from "@/config/nodes";
import { CLIENT_CONFIG } from "./viem";

export const chains = CHAINS;

export const injectedConnector = injected({
  shimDisconnect: false,
});

export const walletConnectConnector = walletConnect({
  // ignore the error in test environment
  // Error: To use QR modal, please install @walletconnect/modal package
  showQrModal: false,
  projectId: "e542ff314e26ff34de2d4fba98db70bb",
});

export const walletConnectNoQrCodeConnector = walletConnect({
  showQrModal: false,
  projectId: "e542ff314e26ff34de2d4fba98db70bb",
});

export const metaMaskConnector = injected({
  target: "metaMask",
  shimDisconnect: false,
});
export const trustConnector = injected({
  target: "trust",
  shimDisconnect: false,
});

export const noopStorage = {
  getItem: (_key: any) => "",
  setItem: (_key: any, _value: any) => {},
  removeItem: (_key: any) => {},
};

const PUBLIC_MAINNET = "https://ethereum.publicnode.com";

export const transports = chains.reduce((ts, chain) => {
  let httpStrings: string[] | readonly string[] = [];

  if ( chain.id === mainnet.id) {
    httpStrings = [PUBLIC_MAINNET];
  } else {
    httpStrings = PUBLIC_NODES[chain.id] ? PUBLIC_NODES[chain.id] : [];
  }

  if (ts) {
    return {
      ...ts,
      [chain.id]: fallback(httpStrings.map((t: any) => http(t))),
    };
  }

  return {
    [chain.id]: fallback(httpStrings.map((t: any) => http(t))),
  };
}, {} as Record<number, Transport>);

export function createWagmiConfig() {
  return createConfig({
    chains,
    ssr: true,
    syncConnectedChain: true,
    transports,
    ...CLIENT_CONFIG,

    connectors: [
      metaMaskConnector,
      injectedConnector,
      safe(),
      walletConnectConnector,
      // ledgerConnector,
      trustConnector,
    ],
  });
}

export const wagmiConfig2 = createConfig({
  chains: [baseSepolia],
  multiInjectedProviderDiscovery: false,
  connectors: [
    coinbaseWallet({
      appName: "Template",
      preference: "all", // set this to `all` to use EOAs as well
      version: "4",
    }),
  ],
  ssr: true,
  transports: {
    [baseSepolia.id]: http(
      "https://api.developer.coinbase.com/rpc/v1/base-sepolia/M38cgIFQVu6ldPK0gob81k2_LblbB3jq"
    ),
  },
});

export const CHAIN_IDS = chains.map((c) => c.id);

export const isChainSupported = memoize((chainId: number) =>
  (CHAIN_IDS as number[]).includes(chainId)
);
export const isChainTestnet = memoize((chainId: number) => {
  const found = chains.find((c) => c.id === chainId);
  return found ? "testnet" in found : false;
});
