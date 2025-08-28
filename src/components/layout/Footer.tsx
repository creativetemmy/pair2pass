import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Twitter, 
  Send, 
  Mail, 
  BookOpen, 
  Shield, 
  FileText,
  Users,
  Home,
  Info,
  HelpCircle,
  Phone
} from "lucide-react";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubscribing(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Successfully subscribed to updates!");
      setEmail("");
      setIsSubscribing(false);
    }, 1000);
  };

  const quickLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "About Us", href: "#about", icon: Info },
    { label: "How It Works", href: "#how-it-works", icon: BookOpen },
    { label: "FAQs", href: "#faqs", icon: HelpCircle },
    { label: "Contact", href: "#contact", icon: Phone }
  ];

  const communityLinks = [
    { label: "Twitter/X", href: "#", icon: Twitter },
    { label: "Telegram", href: "#", icon: Send },
    { label: "Blog", href: "#", icon: BookOpen }
  ];

  const legalLinks = [
    { label: "Terms of Service", href: "#terms", icon: FileText },
    { label: "Privacy Policy", href: "#privacy", icon: Shield },
    { label: "Student Safety Policy", href: "#safety", icon: Users }
  ];

  return (
    <footer className="bg-muted/30 border-t border-border/40 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community & Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Community & Social</h3>
            <ul className="space-y-2">
              {communityLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Legal & Security</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Stay updated on Pair2Pass launch + earn early adopter rewards
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  disabled={isSubscribing}
                />
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={isSubscribing}
                  className="px-4"
                >
                  {isSubscribing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-foreground" />
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-1" />
                      Subscribe
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border/40">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Pair2Pass. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};