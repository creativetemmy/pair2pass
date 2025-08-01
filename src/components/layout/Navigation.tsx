import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, Users, Calendar, User, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WalletConnectDialog } from "@/components/WalletConnectDialog";

const allNavItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Users, label: "Find Partner", path: "/find-partner", protected: true },
  { icon: Calendar, label: "Sessions", path: "/dashboard", protected: true },
  { icon: User, label: "Profile", path: "/profile", protected: true },
];

// Check if wallet is connected (simple localStorage check)
const isWalletConnected = () => {
  return localStorage.getItem('walletConnected') === 'true';
};

export function Navigation() {
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const walletConnected = isWalletConnected();
  const navItems = allNavItems.filter(item => !item.protected || walletConnected);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/20 glass-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2 hover-lift">
            <div className="h-8 w-8 rounded-lg gradient-mesh flex items-center justify-center shadow-glow animate-pulse-slow">
              <span className="text-primary-foreground font-bold text-lg">P2</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Pair2Pass
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover-lift",
                    isActive
                      ? "gradient-primary text-primary-foreground shadow-primary"
                      : "text-muted-foreground hover:text-foreground hover:glass-card"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Open App Button */}
          <Button 
            variant="neon" 
            size="sm" 
            className="hidden md:flex animate-pulse-slow"
            onClick={() => setShowWalletDialog(true)}
          >
            <Wallet className="h-4 w-4" />
            Open App
          </Button>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Users className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-border">
          <div className="flex justify-around py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
      
      <WalletConnectDialog 
        open={showWalletDialog} 
        onOpenChange={setShowWalletDialog} 
      />
    </nav>
  );
}