import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Shield, Zap, Trophy, ArrowRight, CheckCircle } from "lucide-react";
import { WalletConnectDialog } from "@/components/WalletConnectDialog";
import heroImage from "@/assets/hero-image.jpg";

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary via-primary/90 to-secondary">
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={() => setShowWalletDialog(true)}
              >
                Open App
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Pair2Pass?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your study experience with verified partnerships and gamified learning
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in just four simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center bg-card border rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
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

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Study Experience?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students already building their academic reputation on Pair2Pass
          </p>
          <Button 
            variant="secondary" 
            size="lg" 
            className="text-lg px-8 py-4"
            onClick={() => setShowWalletDialog(true)}
          >
            Open App
            <CheckCircle className="h-5 w-5" />
          </Button>
        </div>
      </section>
      
      <WalletConnectDialog 
        open={showWalletDialog} 
        onOpenChange={setShowWalletDialog} 
      />
    </div>
  );
}