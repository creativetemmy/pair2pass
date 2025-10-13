import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Droplets, Wallet, Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

const Faucet = () => {
  const { address } = useAccount();
  const [walletAddress, setWalletAddress] = useState(address || "");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimStatus, setClaimStatus] = useState<"idle" | "success" | "error">("idle");

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletAddress || !email) {
      toast.error("Please fill in all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Basic wallet address validation (Ethereum address format)
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(walletAddress)) {
      toast.error("Please enter a valid wallet address");
      return;
    }

    setIsSubmitting(true);
    setClaimStatus("idle");

    try {
      // Simulate API call to faucet service
      // In production, this would call a backend service that:
      // 1. Validates the request
      // 2. Checks rate limits
      // 3. Sends ETH to the wallet
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For now, show success message
      setClaimStatus("success");
      toast.success("ETH claimed successfully! Check your wallet in a few minutes.");
      
      // Reset form
      setEmail("");
      if (!address) {
        setWalletAddress("");
      }
    } catch (error) {
      setClaimStatus("error");
      toast.error("Failed to claim ETH. Please try again later.");
      console.error("Faucet claim error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Droplets className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Base ETH Faucet</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Claim free Base testnet ETH to create your Base name and get started on Pair2Pass
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Faucet Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Claim Base ETH
                </CardTitle>
                <CardDescription>
                  Enter your wallet address and email to receive a small amount of ETH on Base network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleClaim} className="space-y-6">
                  {/* Wallet Address */}
                  <div className="space-y-2">
                    <Label htmlFor="wallet">Wallet Address</Label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="wallet"
                        type="text"
                        placeholder="0x..."
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="pl-10"
                        disabled={!!address}
                      />
                    </div>
                    {address && (
                      <p className="text-xs text-muted-foreground">
                        Using connected wallet address
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      We'll send you a confirmation email
                    </p>
                  </div>

                  {/* Status Messages */}
                  {claimStatus === "success" && (
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <p className="text-sm font-medium">
                        ETH sent! You should receive it within 5-10 minutes.
                      </p>
                    </div>
                  )}

                  {claimStatus === "error" && (
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      <p className="text-sm font-medium">
                        Failed to process your request. Please try again.
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Droplets className="mr-2 h-4 w-4" />
                        Claim ETH
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Information Sidebar */}
          <div className="space-y-6">
            {/* What You'll Get */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What You'll Get</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">0.01 ETH (Base)</p>
                    <p className="text-sm text-muted-foreground">
                      Enough to create your Base name and start using Pair2Pass
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Instant Transfer</p>
                    <p className="text-sm text-muted-foreground">
                      Receive ETH within 5-10 minutes
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">No Strings Attached</p>
                    <p className="text-sm text-muted-foreground">
                      Free testnet ETH to get you started
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How to Use */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Use</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <p className="text-muted-foreground">
                    Connect your wallet or enter your wallet address
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <p className="text-muted-foreground">
                    Enter your email address for confirmation
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <p className="text-muted-foreground">
                    Click "Claim ETH" and wait for confirmation
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <p className="text-muted-foreground">
                    Use the ETH to create your Base name on Base network
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rate Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rate Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  • 1 claim per wallet per 24 hours
                </p>
                <p className="text-muted-foreground">
                  • 1 claim per email per 24 hours
                </p>
                <p className="text-muted-foreground">
                  • Maximum 0.01 ETH per claim
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faucet;
