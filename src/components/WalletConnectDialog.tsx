import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowRight } from "lucide-react";

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletConnectDialog({ open, onOpenChange }: WalletConnectDialogProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    // Simulate wallet connection
    setTimeout(() => {
      setIsConnecting(false);
      onOpenChange(false);
      navigate("/profile");
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription>
            Connect your Web3 wallet to access Pair2Pass and start building your academic reputation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Wallet className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure & Verified</h3>
            <p className="text-muted-foreground text-sm">
              Your wallet will be used to verify your identity and track your academic achievements on the blockchain.
            </p>
          </div>
          
          <Button 
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="w-full"
            size="lg"
          >
            {isConnecting ? (
              "Connecting..."
            ) : (
              <>
                Connect Wallet
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}