import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Linkedin, Github, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsSubscribing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubscribing(false);
    
    toast.success("Successfully subscribed to newsletter!");
    setEmail("");
  };

  const quickLinks = [
    { label: "Dashboard", href: "/homepage" },
    { label: "Find Partner", href: "/find-partner" },
    { label: "Sessions", href: "/session" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Profile", href: "/profile" },
  ];

  const publicLinks = [
    { label: "How it Works", href: "/#how-it-works", isAnchor: true },
    { label: "Blog", href: "/blog" },
    { label: "Community", href: "https://chat.whatsapp.com/HU3QsSuzV7pGBRHkKHR5eb", isExternal: true },
  ];

  const socialLinks = [
    { icon: Twitter, href: "https://x.com/pair2pass", label: "X (Twitter)", color: "hover:text-blue-400" },
    { icon: Github, href: "https://github.com/pair2pass", label: "GitHub", color: "hover:text-gray-400" },
    { icon: MessageSquare, href: "https://chat.whatsapp.com/HU3QsSuzV7pGBRHkKHR5eb", label: "WhatsApp Community", color: "hover:text-green-400" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ];

  return (
    <footer className="bg-muted/30 dark:bg-muted/10 border-t border-border transition-colors duration-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/pair2pass.png" 
                alt="Pair2Pass Logo" 
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              The Web3 platform connecting students for verified study partnerships. 
              Build your academic reputation while earning rewards.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full bg-background border border-border transition-all duration-300 hover:scale-110 ${social.color}`}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-3">
              {publicLinks.map((link) => (
                <li key={link.href}>
                  {link.isAnchor ? (
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-300 cursor-pointer"
                    >
                      {link.label}
                    </a>
                  ) : link.isExternal ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Stay Updated</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Subscribe to our newsletter for tips and updates
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubscribing}
              >
                {isSubscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} Pair2Pass. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              Built with ❤️ for students worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}