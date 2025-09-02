import { Award, Shield, Crown, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccount, useReadContract } from "wagmi";
import { pair2PassContractConfig } from "@/contracts/pair2passsbt";

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

export function NftBadge({ tokenId}: NftBadgeProps) {

   const { data: nftUri } = useReadContract({
        ...pair2PassContractConfig,
        functionName: 'tokenURI',
        args: [BigInt(tokenId)],
      })
    
      const nftData = nftMetaData[nftUri] 

  return (
    <div className={cn("group cursor-pointer")}>
      <div className={cn(
        "relative rounded-xl p-4 transition-all duration-300 group-hover:scale-105",
         "gradient-card shadow-card"
      )}>
        <div className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300",
        )}>
          
         <img
            src={nftUri}
            alt={nftUri}
            className="rounded-xl mb-3 w-full object-cover"
          />

          

        </div>

         <h3 className={cn(
                    "font-semibold text-center mb-1",
                    "text-foreground" 
                  )}>
                  #{tokenId} <br/>  {nftData?.name || "NFT Badge"}
                  </h3>
          <p className="text-xs text-muted-foreground text-center">
            {nftData?.description || "Awarded NFT Badge from Pair2Pass."}
          </p>
      </div>
    </div>
  );
}