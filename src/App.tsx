import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Web3Provider } from "@/components/providers/Web3Provider";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import FindPartner from "./pages/FindPartner";
import MatchConfirmation from "./pages/MatchConfirmation";
import SessionCheckIn from "./pages/SessionCheckIn";
import Profile from "./pages/Profile";
import Match from "./pages/Match";
import CheckIn from "./pages/CheckIn";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <Web3Provider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Navigation />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/find-partner" element={<FindPartner />} />
                <Route path="/match/:id" element={<Match />} />
                <Route path="/check-in" element={<CheckIn />} />
                <Route path="/profile" element={<Profile />} />
                {/* Legacy routes for compatibility */}
                <Route path="/match-confirmation" element={<MatchConfirmation />} />
                <Route path="/session-checkin" element={<SessionCheckIn />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Web3Provider>
  </ThemeProvider>
);

export default App;
