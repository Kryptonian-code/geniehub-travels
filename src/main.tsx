import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { SiteDataProvider } from "./contexts/SiteDataContext.tsx";
import { installAnalytics } from "./lib/analytics.ts";
import { installMonitoring } from "./lib/monitoring.ts";
import "./index.css";

installAnalytics();
installMonitoring();

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <SiteDataProvider>
      <App />
    </SiteDataProvider>
  </AuthProvider>,
);
