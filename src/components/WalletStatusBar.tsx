import React, { useState } from 'react';
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Wallet, ChevronDown, Check, LogOut, Network } from 'lucide-react';
import { base, baseSepolia, scroll, scrollSepolia } from 'wagmi/chains';

const SUPPORTED_CHAINS = [base, baseSepolia, scroll, scrollSepolia];

const WalletStatusBar = () => {
  const { isConnected, address, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending } = useSwitchChain();
  const [isNetworkMenuOpen, setIsNetworkMenuOpen] = useState(false);

  if (!isConnected) {
    return null;
  }

  const getChainColor = (chainId?: number) => {
    switch (chainId) {
      case base.id:
        return 'bg-blue-500';
      case baseSepolia.id:
        return 'bg-blue-400';
      case scroll.id:
        return 'bg-orange-500';
      case scrollSepolia.id:
        return 'bg-orange-400';
      default:
        return 'bg-gray-500';
    }
  };

  const isChainSupported = SUPPORTED_CHAINS.some(c => c.id === chain?.id);

  return (
    <div className="flex items-center gap-2">
      {/* Network Switcher */}
      <DropdownMenu open={isNetworkMenuOpen} onOpenChange={setIsNetworkMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className={`gap-2 ${!isChainSupported ? 'border-destructive text-destructive' : ''}`}
          >
            <Network className="h-4 w-4" />
            <div className={`w-2 h-2 rounded-full ${getChainColor(chain?.id)}`} />
            <span className="hidden sm:inline">{chain?.name || 'Unknown'}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Switch Network</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {SUPPORTED_CHAINS.map((supportedChain) => (
            <DropdownMenuItem
              key={supportedChain.id}
              onClick={() => switchChain({ chainId: supportedChain.id })}
              disabled={isPending || chain?.id === supportedChain.id}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getChainColor(supportedChain.id)}`} />
                  <span>{supportedChain.name}</span>
                </div>
                {chain?.id === supportedChain.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
          {!isChainSupported && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                Please switch to a supported network
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Wallet Info & Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Wallet Connected</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Address:</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Network:</span>
              <Badge variant="outline" className="gap-1">
                <div className={`w-2 h-2 rounded-full ${getChainColor(chain?.id)}`} />
                {chain?.name}
              </Badge>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => disconnect()}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default WalletStatusBar;
