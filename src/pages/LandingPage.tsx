import React from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const LandingPage = () => {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            Pair<span className="text-blue-400">2</span>Pass
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Connect your wallet to access the decentralized future. Secure,
            fast, and built on Base chain.
          </p>
        </div>

        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Get Started</h2>
            <p className="text-gray-300">
              Connect your wallet to Base chain to continue
            </p>
          </div>

          <ConnectButton label="Open App" />

          {isConnected && (
            <div className="mt-6 p-4 bg-green-100/20 border border-green-300/20 rounded-lg">
              <p className="text-green-300 text-center">
                ✅ Wallet connected! You can now access all features.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
