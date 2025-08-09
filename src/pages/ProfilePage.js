import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import ProtectedRoute from '../components/ProtectedRoute';
import ConnectWalletButton from '../components/ConnectWalletButton';

const ProfilePage = () => {
  const { wallet } = useWallet();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
            <ConnectWalletButton />
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Your Wallet Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <code className="text-sm font-mono break-all">
                    {wallet.address}
                  </code>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Network
                </label>
                <div className="p-3 bg-green-100 rounded-lg">
                  <span className="text-green-700 font-medium">
                    Base Mainnet
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connection Status
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;