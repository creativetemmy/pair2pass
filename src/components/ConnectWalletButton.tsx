import React from 'react';
import { useAccount } from 'wagmi';


const ConnectWalletButton = ({ className = '' }) => {
  const { isConnected, address } = useAccount()

  if (isConnected) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-700">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
      </div>
    );
  }

  return null;
};

export default ConnectWalletButton;