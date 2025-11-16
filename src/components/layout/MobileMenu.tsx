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
      <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-background">
        <SheetHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile?.avatar_url} alt={profile?.name || 'User'} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <SheetTitle className="text-left text-base">{profile?.name || 'User'}</SheetTitle>
                <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                  {user?.email}
                </p>
              </div>
            </div>
            <NotificationBell />
          </div>
        </SheetHeader>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => (
            <SheetClose asChild key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            </SheetClose>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-4">
          <Separator />
          <div className="px-2">
            <WalletStatusBar />
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive border-destructive/50 hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4 shrink-0" />
            <span>Log out</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
