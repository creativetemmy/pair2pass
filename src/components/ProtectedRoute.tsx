import { ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isConnected } = useAccount();
   console.log("is connected", isConnected);

  if (!isConnected) {
   
    
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;