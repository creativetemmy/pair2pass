import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Shield, Zap, Trophy, ArrowRight, CheckCircle } from "lucide-react";
import { WalletConnectDialog } from "@/components/WalletConnectDialog";
import heroImage from "@/assets/hero-image.jpg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import FAQ from "@/components/FAQ";

const features = [
  {
    icon: Users,
    title: "Find Study Partners",
    description: "Connect with verified students in your courses and academic level.",
  },
  {
    icon: Shield,
    title: "Verified Students",
    description: "All users are verified through blockchain identity and academic credentials.",
  },
  {
    icon: Zap,
    title: "Earn XP & Badges",
    description: "Gamified learning with rewards for consistent study sessions and achievements.",
  },
  {
    icon: Trophy,
    title: "Build Reputation",
    description: "Establish your academic reputation through successful study collaborations.",
  },
];

const steps = [
  { step: 1, title: "Connect Wallet", description: "Link your Web3 wallet for verification" },
  { step: 2, title: "Complete Profile", description: "Add your academic details and preferences" },
  { step: 3, title: "Find Partners", description: "Match with students in your courses" },
  { step: 4, title: "Study & Earn", description: "Complete sessions and earn XP rewards" },
];

export default function Home() {
  const [showWalletDialog, setShowWalletDialog] = useState(false);

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary via-primary/90 to-secondary dark:from-primary/80 dark:via-primary/70 dark:to-secondary/80 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Study Together,
              <br />
              <span className="text-secondary-glow">Pass Together</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              The Web3 platform connecting students for verified study partnerships. 
              Build your academic reputation while earning XP and NFT badges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* <Button 
                variant="secondary" 
                size="lg" 
                className="text-lg px-8 py-4 transition-all duration-300"
                onClick={() => setShowWalletDialog(true)}
              >
                Open App
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary transition-all duration-300">
                Learn More
              </Button> */}

              <ConnectButton label="Open App"/>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 transition-colors duration-300">
              Why Choose Pair2Pass?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto transition-colors duration-300">
              Transform your study experience with verified partnerships and gamified learning
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/20 dark:border-border/10">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-muted-foreground transition-colors duration-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30 dark:bg-muted/10 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 transition-colors duration-300">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto transition-colors duration-300">
              Get started in just four simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center bg-card border rounded-xl p-6 hover:shadow-md transition-all duration-300 border-border/20 dark:border-border/10">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 transition-colors duration-300">{step.title}</h3>
                  <p className="text-muted-foreground transition-colors duration-300">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full">
                    <ArrowRight className="h-6 w-6 text-primary mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section */}
      <section className="py-20 bg-primary dark:bg-primary/80 transition-colors duration-300 relative">
        <div className="container mx-auto px-4 text-center">
          {/* X Button */}
          <a 
            href="https://x.com/pair2pass"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 group"
            aria-label="Follow us on X (Twitter)"
          >
            <svg 
              className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Study Experience?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students already building their academic reputation on Pair2Pass
          </p>
        </div>
      </section>
      
      <WalletConnectDialog 
        open={showWalletDialog} 
        onOpenChange={setShowWalletDialog} 
      />
    </div>
  );
}