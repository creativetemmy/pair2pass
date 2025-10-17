import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { VerificationBanner } from "@/components/VerificationBanner";
import { useAccount } from "wagmi";

import Home from "./pages/Home";
import Homepage from "./pages/Homepage";
import Dashboard from "./pages/Dashboard";
import FindPartner from "./pages/FindPartner";
import MatchConfirmation from "./pages/MatchConfirmation";
import MatchRequests from "./pages/MatchRequests";
import SessionCheckIn from "./pages/SessionCheckIn";
import Profile from "./pages/Profile";
import ProfilePage from "./pages/ProfilePage";
import Leaderboard from "./pages/Leaderboard";
import SessionLobby from "./pages/SessionLobby";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Faucet from "./pages/Faucet";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const AppContent = () => {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
};

const AppRouter = () => {
  const { isConnected } = useAccount();
  const location = useLocation();
  const isHomepage = location.pathname === '/';
  
  return (
    <div className="min-h-screen bg-background transition-colors duration-300 flex flex-col">
      <Navigation />
      {isConnected && !isHomepage && <VerificationBanner />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/homepage" element={<ProtectedRoute requireVerification={false}><Homepage /></ProtectedRoute>} />
          <Route path="/session" element={<ProtectedRoute requireVerification={false}><Dashboard /></ProtectedRoute>} />
          <Route path="/find-partner" element={<ProtectedRoute requireVerification={true}><FindPartner /></ProtectedRoute>} />
          <Route path="/match-confirmation" element={<ProtectedRoute requireVerification={true}><MatchConfirmation /></ProtectedRoute>} />
          <Route path="/match-requests" element={<ProtectedRoute requireVerification={true}><MatchRequests /></ProtectedRoute>} />
          <Route path="/session-checkin/:sessionId" element={<ProtectedRoute requireVerification={true}><SessionCheckIn /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute requireVerification={false}><Leaderboard /></ProtectedRoute>} />
          <Route path="/session/:sessionId" element={<ProtectedRoute requireVerification={true}><SessionLobby /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute requireVerification={false}><Profile /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute requireVerification={true}><ProfilePage /></ProtectedRoute>} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/faucet" element={<ProtectedRoute requireVerification={false}><Faucet /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {isHomepage && <Footer />}
    </div>
  );
};

const App = () => <AppContent />;

export default App;
