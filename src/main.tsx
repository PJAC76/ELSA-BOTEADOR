import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { useThemeStore } from "./stores/theme-store";
import App from "./App.tsx";
import "./index.css";
import { initNative } from "./lib/native";

// Apply persisted theme on load
const theme = useThemeStore.getState().activeTheme;
document.documentElement.setAttribute("data-theme", theme);

// Sync theme changes to DOM
useThemeStore.subscribe((state) => {
  document.documentElement.setAttribute("data-theme", state.activeTheme);
});

// Initialize native plugins (no-op on web)
initNative();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
