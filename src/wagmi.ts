import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, base, mainnet, optimism, polygon } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Pair2Pass",
  projectId: "47cd7178521d7cd372b0a937092e2d07",
  chains: [mainnet, polygon, optimism, arbitrum, base],
});
