import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthProfile } from '@/hooks/useAuthProfile';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { OnboardingGuard } from './OnboardingGuard';

interface ProtectedRouteProps {
  children: ReactNode;
  requireVerification?: boolean;
}

const ProtectedRoute = ({ children, requireVerification = true }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useAuthProfile();
  const profileCompletion = useProfileCompletion(profile);
  const location = useLocation();

  // First check: user authentication
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Allow access to profile page and homepage without verification
  const allowedPaths = ['/profile', '/homepage', '/leaderboard', '/session'];
  const isOnAllowedPath = allowedPaths.includes(location.pathname);

  // If verification is required and user is not on an allowed path
  if (requireVerification && !isOnAllowedPath && !profileLoading) {
    const isProfileComplete = profileCompletion.isComplete;
    const isEmailVerified = profile?.is_email_verified ?? false;

    // Block access if profile incomplete or email not verified
    if (!isProfileComplete || !isEmailVerified) {
      return <OnboardingGuard>{children}</OnboardingGuard>;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;