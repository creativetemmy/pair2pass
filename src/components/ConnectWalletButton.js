import React from 'react';
import { useWallet } from '../contexts/WalletContext';

const ConnectWalletButton = ({ className = '' }) => {
  const { wallet, connectWallet, disconnectWallet } = useWallet();

  if (wallet.connected) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-700">
            {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
          </span>
        </div>
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={wallet.connecting}
      className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${className}`}
    >
      {wallet.connecting ? (
        <>
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          Connecting...
        </>
      ) : (
        <>
          Connect Wallet
        </>
      )}
    </button>
  );
};

export default ConnectWalletButton;