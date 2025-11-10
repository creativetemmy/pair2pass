import { Award, Shield, Crown, Flame, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccount, useChainId, useReadContract } from "wagmi";
import {
  chainExplorerUrls,
  contractAddresses,
  pair2PassContractConfigAbi,
} from "@/contracts/pair2passsbt";

import { nftMetaData } from "@/contracts/nftMetaData";

const badgeIcons = {
  studious: Award,
  reliable: Shield,
  expert: Crown,
  streak: Flame,
};

const badgeColors = {
  studious: "bg-blue-500",
  reliable: "bg-green-500",
  expert: "bg-purple-500",
  streak: "bg-orange-500",
};

interface NftBadgeProps {
  tokenId: number;
}

export function NftBadge({ tokenId }: NftBadgeProps) {
  const chainId = useChainId();
  const contractAddress = contractAddresses[chainId];

  const { data: nftUri } = useReadContract({
    address: contractAddress,
    abi: pair2PassContractConfigAbi,
    functionName: "tokenURI",
    args: [BigInt(tokenId)],
  });

  const nftData = nftMetaData[nftUri];

  const handleClick = () => {
    const contractAddress = contractAddresses;
    const explorerUrl = `${chainExplorerUrls[chainId]}/token/${contractAddress}?a=${tokenId}`;
    window.open(explorerUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn("group cursor-pointer")} onClick={handleClick}>
      <div
        className={cn(
          "relative rounded-xl p-4 transition-all duration-300 group-hover:scale-105",
          "gradient-card shadow-card"
        )}
      >
        {/* External link indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </div>

        <div
          className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300"
          )}
        >
          <img
            src={nftUri}
            alt={nftUri}
            className="rounded-xl mb-3 w-full object-cover"
          />
        </div>

        <h3 className={cn("font-semibold text-center mb-1", "text-foreground")}>
          #{tokenId} <br /> {nftData?.name || "NFT Badge"}
        </h3>
        <p className="text-xs text-muted-foreground text-center">
          {nftData?.description || "Awarded NFT Badge from Pair2Pass."}
        </p>

        <p className="text-xs text-blue-600 dark:text-blue-400 text-center mt-2 opacity-75 group-hover:opacity-100 transition-opacity">
          View on BaseScan →
        </p>
      </div>
    </div>
  );
}
