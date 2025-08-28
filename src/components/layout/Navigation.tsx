import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, Users, Calendar, User, Wallet, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";


const allNavItems = [
  { icon: Home, label: "Home", path: "/", protected:false},
  { icon: Home, label: "Dashboard", path: "/homepage" ,protected:true},
  { icon: Users, label: "Find Partner", path: "/find-partner", protected:true},
  { icon: Calendar, label: "Sessions", path: "/session", protected:true},
  { icon: Trophy, label: "Leaderboard", path: "/leaderboard", protected:true},
  { icon: User, label: "Profile", path: "/profile",protected:true },
];



export function Navigation() {

  const {  isConnected } = useAccount()
 
  
 

 const navItems = allNavItems.filter((item) => {
  if (item.path === "/" && isConnected) return false; // hide Home when connected
  if (item.protected && !isConnected) return false;   // hide protected if not connected
  return true; // otherwise keep it
});
 

  return (
    <nav className="sticky top-0 z-50 border-b border-border/20 glass-card transition-colors duration-300">
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

          {/* Theme Toggle & Wallet Button */}
          <div className="hidden md:flex items-center space-x-2">
            {isConnected && <NotificationBell />}
            <ThemeToggle />
            
            {/* Open App Button */}
            {/* <Button 
              variant="neon" 
              size="sm" 
              className="animate-pulse-slow transition-colors duration-300"
              onClick={() => isConnected ? window.location.href = '/homepage' : setShowWalletDialog(true)}
            >
              <Wallet className="h-4 w-4" />
              {isConnected ? 'Dashboard' : 'Open App'}
            </Button> */}

            <ConnectButton/>
          </div>

          {/* Mobile Theme Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-border transition-colors duration-300">
          <div className="flex justify-around py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300",
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
      
     
    </nav>
  );
}