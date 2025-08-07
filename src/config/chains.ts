import memoize from "lodash/memoize";
import { Chain, base, baseSepolia } from "wagmi/chains";

export enum ChainId {
  ETHEREUM = 1,
  GOERLI = 5,
  BSC = 56,
  BSC_TESTNET = 97,
  ZKSYNC_TESTNET = 280,
  ZKSYNC = 324,
  OPBNB_TESTNET = 5611,
  OPBNB = 204,
  POLYGON_ZKEVM = 1101,
  POLYGON_ZKEVM_TESTNET = 1442,
  ARBITRUM_ONE = 42161,
  ARBITRUM_GOERLI = 421613,
  ARBITRUM_SEPOLIA = 421614,
  SCROLL_SEPOLIA = 534351,
  LINEA = 59144,
  LINEA_TESTNET = 59140,
  BASE = 8453,
  BASE_TESTNET = 84531,
  BASE_SEPOLIA = 84532,
  SEPOLIA = 11155111,
}

export const testnetChainIds = [
  ChainId.GOERLI,
  ChainId.BSC_TESTNET,
  ChainId.ZKSYNC_TESTNET,
  ChainId.OPBNB_TESTNET,
  ChainId.POLYGON_ZKEVM_TESTNET,
  ChainId.ARBITRUM_GOERLI,
  ChainId.SCROLL_SEPOLIA,
  ChainId.LINEA_TESTNET,
  ChainId.BASE_TESTNET,
  ChainId.SEPOLIA,
  ChainId.ARBITRUM_SEPOLIA,
  ChainId.BASE_SEPOLIA,
];

export const chainNames: Record<ChainId, string> = {
  [ChainId.ETHEREUM]: "eth",
  [ChainId.GOERLI]: "goerli",
  [ChainId.BSC]: "bsc",
  [ChainId.BSC_TESTNET]: "bscTestnet",
  [ChainId.ARBITRUM_ONE]: "arb",
  [ChainId.ARBITRUM_GOERLI]: "arbGoerli",
  [ChainId.POLYGON_ZKEVM]: "polygonZkEVM",
  [ChainId.POLYGON_ZKEVM_TESTNET]: "polygonZkEVMTestnet",
  [ChainId.ZKSYNC]: "zkSync",
  [ChainId.ZKSYNC_TESTNET]: "zkSyncTestnet",
  [ChainId.LINEA]: "linea",
  [ChainId.LINEA_TESTNET]: "lineaTestnet",
  [ChainId.OPBNB]: "opBNB",
  [ChainId.OPBNB_TESTNET]: "opBnbTestnet",
  [ChainId.BASE]: "base",
  [ChainId.BASE_TESTNET]: "baseTestnet",
  [ChainId.SCROLL_SEPOLIA]: "scrollSepolia",
  [ChainId.SEPOLIA]: "sepolia",
  [ChainId.ARBITRUM_SEPOLIA]: "arbSepolia",
  [ChainId.BASE_SEPOLIA]: "baseSepolia",
};

export const chainNamesInKebabCase = {
  [ChainId.ETHEREUM]: "ethereum",
  [ChainId.GOERLI]: "goerli",
  [ChainId.BSC]: "bsc",
  [ChainId.BSC_TESTNET]: "bsc-testnet",
  [ChainId.ARBITRUM_ONE]: "arbitrum",
  [ChainId.ARBITRUM_GOERLI]: "arbitrum-goerli",
  [ChainId.POLYGON_ZKEVM]: "polygon-zkevm",
  [ChainId.POLYGON_ZKEVM_TESTNET]: "polygon-zkevm-testnet",
  [ChainId.ZKSYNC]: "zksync",
  [ChainId.ZKSYNC_TESTNET]: "zksync-testnet",
  [ChainId.LINEA]: "linea",
  [ChainId.LINEA_TESTNET]: "linea-testnet",
  [ChainId.OPBNB]: "opbnb",
  [ChainId.OPBNB_TESTNET]: "opbnb-testnet",
  [ChainId.BASE]: "base",
  [ChainId.BASE_TESTNET]: "base-testnet",
  [ChainId.SCROLL_SEPOLIA]: "scroll-sepolia",
  [ChainId.SEPOLIA]: "sepolia",
  [ChainId.ARBITRUM_SEPOLIA]: "arbitrum-sepolia",
  [ChainId.BASE_SEPOLIA]: "base-sepolia",
} as const;

export const mainnetChainNamesInKebabCase = {
  [ChainId.ETHEREUM]: "ethereum",
  [ChainId.GOERLI]: "ethereum",
  [ChainId.BSC]: "bsc",
  [ChainId.BSC_TESTNET]: "bsc",
  [ChainId.ARBITRUM_ONE]: "arbitrum",
  [ChainId.ARBITRUM_GOERLI]: "arbitrum",
  [ChainId.POLYGON_ZKEVM]: "polygon-zkevm",
  [ChainId.POLYGON_ZKEVM_TESTNET]: "polygon-zkevm",
  [ChainId.ZKSYNC]: "zksync",
  [ChainId.ZKSYNC_TESTNET]: "zksync",
  [ChainId.LINEA]: "linea",
  [ChainId.LINEA_TESTNET]: "linea",
  [ChainId.OPBNB]: "opbnb",
  [ChainId.OPBNB_TESTNET]: "opbnb",
  [ChainId.BASE]: "base",
  [ChainId.BASE_TESTNET]: "base",
  [ChainId.SEPOLIA]: "ethereum",
  [ChainId.ARBITRUM_SEPOLIA]: "arbitrum",
  [ChainId.BASE_SEPOLIA]: "base",
} as const;

export const chainNameToChainId = Object.entries(chainNames).reduce(
  (acc, [chainId, chainName]) => {
    return {
      [chainName]: chainId as unknown as ChainId,
      ...acc,
    };
  },
  {} as Record<string, ChainId>
);

// @see https://github.com/DefiLlama/defillama-server/blob/master/common/chainToCoingeckoId.ts
// @see https://github.com/DefiLlama/chainlist/blob/main/constants/chainIds.json
export const defiLlamaChainNames: Record<ChainId, string> = {
  [ChainId.BSC]: "bsc",
  [ChainId.ETHEREUM]: "ethereum",
  [ChainId.GOERLI]: "",
  [ChainId.BSC_TESTNET]: "",
  [ChainId.ARBITRUM_ONE]: "arbitrum",
  [ChainId.ARBITRUM_GOERLI]: "",
  [ChainId.POLYGON_ZKEVM]: "polygon_zkevm",
  [ChainId.POLYGON_ZKEVM_TESTNET]: "",
  [ChainId.ZKSYNC]: "era",
  [ChainId.ZKSYNC_TESTNET]: "",
  [ChainId.LINEA_TESTNET]: "",
  [ChainId.BASE_TESTNET]: "",
  [ChainId.OPBNB]: "op_bnb",
  [ChainId.OPBNB_TESTNET]: "",
  [ChainId.SCROLL_SEPOLIA]: "",
  [ChainId.LINEA]: "linea",
  [ChainId.BASE]: "base",
  [ChainId.SEPOLIA]: "",
  [ChainId.ARBITRUM_SEPOLIA]: "",
  [ChainId.BASE_SEPOLIA]: "",
};

export const CHAIN_QUERY_NAME = chainNames;

const CHAIN_QUERY_NAME_TO_ID = Object.entries(CHAIN_QUERY_NAME).reduce(
  (acc, [chainId, chainName]) => {
    return {
      [chainName.toLowerCase()]: chainId as unknown as ChainId,
      ...acc,
    };
  },
  {} as Record<string, ChainId>
);

export const getChainId = memoize((chainName: string) => {
  if (!chainName) return undefined;
  return CHAIN_QUERY_NAME_TO_ID[chainName.toLowerCase()]
    ? +CHAIN_QUERY_NAME_TO_ID[chainName.toLowerCase()]
    : undefined;
});

/**
 * Controls some L2 specific behavior, e.g. slippage tolerance, special UI behavior.
 * The expectation is that all of these networks have immediate transaction confirmation.
 */
export const L2_CHAIN_IDS: ChainId[] = [ChainId.BASE, ChainId.BASE_SEPOLIA];

export const CHAINS: [Chain, ...Chain[]] = [base, baseSepolia];
