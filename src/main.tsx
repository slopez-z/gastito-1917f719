import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppStoreProvider } from "@/store/app-store";
import { initializeSecurityMonitoring } from "./lib/security-monitor";

// Initialize security monitoring
initializeSecurityMonitoring();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppStoreProvider>
      <App />
    </AppStoreProvider>
  </React.StrictMode>
);
