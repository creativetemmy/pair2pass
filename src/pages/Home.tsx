import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Shield, Zap, Trophy, ArrowRight, CheckCircle, Star, MessageSquare } from "lucide-react";
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

const stats = [
  { value: "10,000+", label: "Active Students" },
  { value: "50,000+", label: "Study Sessions" },
  { value: "95%", label: "Success Rate" },
  { value: "100+", label: "Universities" },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    institution: "MIT",
    text: "Pair2Pass completely transformed how I study. Finding reliable study partners has never been easier!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    institution: "Stanford",
    text: "The gamification aspect keeps me motivated. I've improved my grades and made great friends.",
    rating: 5,
  },
  {
    name: "Emma Rodriguez",
    institution: "Harvard",
    text: "Being able to verify my study partners gives me confidence. The platform is intuitive and effective.",
    rating: 5,
  },
];

const institutions = [
  { name: "MIT", logo: "🎓" },
  { name: "Stanford", logo: "🏛️" },
  { name: "Harvard", logo: "📚" },
  { name: "Oxford", logo: "🎯" },
  { name: "Cambridge", logo: "⚡" },
  { name: "Yale", logo: "🌟" },
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
              <ConnectButton label="Open App"/>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-12 bg-background border-b border-border transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Institutions */}
      <section className="py-12 bg-muted/30 dark:bg-muted/10 border-b border-border transition-colors duration-300">
        <div className="container mx-auto px-4">
          <h3 className="text-center text-sm font-semibold text-muted-foreground mb-8 uppercase tracking-wider">
            Trusted by students from leading institutions
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {institutions.map((institution, index) => (
              <div
                key={index}
                className="flex flex-col items-center group transition-all duration-300 hover:scale-110"
              >
                <div className="text-4xl mb-2 grayscale group-hover:grayscale-0 transition-all duration-300">
                  {institution.logo}
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {institution.name}
                </span>
              </div>
            ))}
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

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30 dark:bg-muted/10 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 transition-colors duration-300">
              What Students Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto transition-colors duration-300">
              Join thousands of students who have transformed their study experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/20 dark:border-border/10">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <MessageSquare className="h-8 w-8 text-primary/20 mb-3" />
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.institution}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background transition-colors duration-300">
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
      <section className="py-20 bg-primary dark:bg-primary/80 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Study Experience?
          </h2>
          
          {/* X Button */}
          <a 
            href="https://x.com/pair2pass"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 group mb-6"
            aria-label="Follow us on X (Twitter)"
          >
            <svg 
              className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="text-white font-medium text-sm sm:text-base">Follow on X</span>
          </a>
          
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