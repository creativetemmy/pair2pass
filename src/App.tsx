import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Navigation } from "@/components/layout/Navigation";

import Home from "./pages/Home";
import Homepage from "./pages/Homepage";
import Dashboard from "./pages/Dashboard";
import FindPartner from "./pages/FindPartner";
import MatchConfirmation from "./pages/MatchConfirmation";
import SessionCheckIn from "./pages/SessionCheckIn";
import Profile from "./pages/Profile";
import ProfilePage from "./pages/ProfilePage";
import Leaderboard from "./pages/Leaderboard";
import SessionLobby from "./pages/SessionLobby";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background transition-colors duration-300">
            <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/homepage" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
              <Route path="/session" element={<Dashboard />} />
              <Route path="/find-partner" element={<ProtectedRoute><FindPartner /></ProtectedRoute>} />
              <Route path="/match-confirmation" element={<ProtectedRoute><MatchConfirmation /></ProtectedRoute>} />
              <Route path="/session-checkin/:sessionId" element={<ProtectedRoute><SessionCheckIn /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
              <Route path="/session/:sessionId" element={<ProtectedRoute><SessionLobby /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
