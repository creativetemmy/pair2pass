// index.tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { WagmiProvider } from "wagmi";
import { config } from "./config.ts";


createRoot(document.getElementById("root")!).render(
    <WagmiProvider config={config}>
    <App />
    </WagmiProvider>
);
