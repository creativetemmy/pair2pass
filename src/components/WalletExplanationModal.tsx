import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, Shield, Award, CheckCircle, ExternalLink } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

interface WalletExplanationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: () => void;
}

export function WalletExplanationModal({ open, onOpenChange, onConnected }: WalletExplanationModalProps) {
  const { isConnected, address } = useAccount();
  const [step, setStep] = useState<"explanation" | "connect">("explanation");

  // Auto-close and trigger callback when wallet connects
  if (isConnected && address && open) {
    onConnected?.();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === "explanation" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Wallet className="h-6 w-6 text-primary" />
                Connect Your Web3 Wallet
              </DialogTitle>
              <DialogDescription className="text-base mt-4">
                To mint your NFT badges and access blockchain features, you need a Web3 wallet.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* What is Web3 */}
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  🌐 What is a Web3 Wallet?
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  A Web3 wallet is like a digital passport that lets you own and control your digital assets 
                  (like NFTs) without relying on any company. Think of it as your personal vault on the blockchain!
                </p>
              </div>

              {/* Why You Need It */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Why You Need a Wallet
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                    <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Own Your NFT Badges</p>
                      <p className="text-xs text-muted-foreground">
                        Your study achievements and student passport will be minted as NFTs that you truly own
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                    <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Verified & Secure</p>
                      <p className="text-xs text-muted-foreground">
                        Your achievements are permanently recorded on the blockchain and can't be faked
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How to Get Started */}
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20">
                <h3 className="font-semibold mb-3">🚀 Getting Started (2 minutes)</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">1.</span>
                    <span>
                      <strong>Install a wallet:</strong> We recommend{" "}
                      <a 
                        href="https://metamask.io" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        MetaMask <ExternalLink className="h-3 w-3" />
                      </a>
                      {" "}(it's free and takes 1 minute)
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">2.</span>
                    <span>Create your wallet and save your recovery phrase securely</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">3.</span>
                    <span>Come back here and click "Connect Wallet" below</span>
                  </li>
                </ol>
              </div>

              {/* Already Have a Wallet */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Already have a wallet? Great! Let's connect it.
                </p>
                <Button 
                  onClick={() => setStep("connect")}
                  size="lg"
                  className="w-full max-w-xs"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Continue to Connect Wallet
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Connect Your Wallet</DialogTitle>
              <DialogDescription>
                Choose your wallet provider to connect
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-4">
              <div className="flex justify-center">
                <ConnectButton />
              </div>
              
              <div className="text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep("explanation")}
                  className="text-sm"
                >
                  ← Back to explanation
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
