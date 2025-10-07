import { ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { Navigate, useLocation } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { OnboardingGuard } from './OnboardingGuard';

interface ProtectedRouteProps {
  children: ReactNode;
  requireVerification?: boolean;
}

const ProtectedRoute = ({ children, requireVerification = true }: ProtectedRouteProps) => {
  const { isConnected, address } = useAccount();
  const { profile, loading } = useProfile(address);
  const profileCompletion = useProfileCompletion(profile);
  const location = useLocation();

  // First check: wallet connection
  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  // Allow access to profile page and homepage without verification
  const allowedPaths = ['/profile', '/homepage', '/leaderboard', '/session'];
  const isOnAllowedPath = allowedPaths.includes(location.pathname);

  // If verification is required and user is not on an allowed path
  if (requireVerification && !isOnAllowedPath && !loading) {
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