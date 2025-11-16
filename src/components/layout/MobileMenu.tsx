import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, Home, Users, Calendar, Trophy, Droplets, User, Inbox, LogOut, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { NotificationBell } from "@/components/NotificationBell";
import WalletStatusBar from "@/components/WalletStatusBar";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/homepage" },
  { icon: Users, label: "Find Partner", path: "/find-partner" },
  { icon: Inbox, label: "Requests", path: "/match-requests" },
  { icon: Calendar, label: "Sessions", path: "/session" },
  { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
  { icon: Droplets, label: "Faucet", path: "/faucet" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { profile } = useAuthProfile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
    navigate('/');
  };

  const getInitials = () => {
    if (profile?.name) {
      return profile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[340px] bg-background flex flex-col">
        <SheetHeader className="border-b border-border pb-4 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={profile?.avatar_url} alt={profile?.name || 'User'} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <SheetTitle className="text-left text-sm truncate">{profile?.name || 'User'}</SheetTitle>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <NotificationBell />
            </div>
          </div>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {navItems.map((item) => (
            <SheetClose asChild key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="truncate flex-1">{item.label}</span>
              </NavLink>
            </SheetClose>
          ))}
        </nav>

        <div className="shrink-0 border-t border-border pt-4 space-y-3">
          <div className="px-2">
            <WalletStatusBar />
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-destructive border-destructive/50 hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="truncate">Log out</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
