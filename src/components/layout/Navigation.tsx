import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Calendar, User, Wallet, Trophy, Droplets, Inbox, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "./UserMenu";
import { MobileMenu } from "./MobileMenu";


const allNavItems = [
  { icon: Home, label: "Dashboard", path: "/homepage" ,protected:true},
  { icon: Users, label: "Find Partner", path: "/find-partner", protected:true},
  { icon: Inbox, label: "Requests", path: "/match-requests", protected:true},
  { icon: Calendar, label: "Sessions", path: "/session", protected:true},
  { icon: Trophy, label: "Leaderboard", path: "/leaderboard", protected:true},
  { icon: Droplets, label: "Faucet", path: "/faucet", protected:true},
  { icon: User, label: "Profile", path: "/profile",protected:true },
];

const publicNavItems = [
  { label: "How it Works", path: "/#how-it-works", isAnchor: true },
  { label: "Blog", path: "/blog" },
  { label: " Join Community", path: "https://chat.whatsapp.com/HU3QsSuzV7pGBRHkKHR5eb", isExternal: true },
];



export function Navigation() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomepage = location.pathname === '/';
 
 const navItems = allNavItems.filter((item) => {
  if (item.protected && !user) return false;   // hide protected if not authenticated
  return true; // otherwise keep it
});
 

  return (
    <nav className="sticky top-0 z-50 border-b border-border/20 glass-card transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-3 hover-lift">
            <img 
              src="/pair2pass.png" 
              alt="Pair2Pass Logo" 
              className="h-20 sm:h-24 md:h-32 lg:h-40 xl:h-48 w-auto object-contain filter drop-shadow-lg hover:scale-105 transition-transform duration-300"
            />
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover-lift whitespace-nowrap",
                    isActive
                      ? "gradient-primary text-primary-foreground shadow-primary"
                      : "text-muted-foreground hover:text-foreground hover:glass-card"
                  )
                }
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-shrink-0">{item.label}</span>
              </NavLink>
            ))}
            {isHomepage && publicNavItems.map((item) => (
              item.isAnchor ? (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 text-muted-foreground hover:text-foreground hover:glass-card whitespace-nowrap cursor-pointer"
                >
                  {item.label}
                </a>
              ) : item.isExternal ? (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 text-muted-foreground hover:text-foreground hover:glass-card whitespace-nowrap"
                >
                  {item.label}
                </a>
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 text-muted-foreground hover:text-foreground hover:glass-card whitespace-nowrap"
                >
                  {item.label}
                </NavLink>
              )
            ))}
          </div>

          {/* Theme Toggle & Auth Button */}
          <div className="hidden md:flex items-center space-x-2">
            {user && <NotificationBell />}
            <ThemeToggle />
            
            {user ? (
              <UserMenu />
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                className="transition-all duration-300"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            )}
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            {user && <MobileMenu />}
          </div>
        </div>

      </div>
      
     
    </nav>
  );
}