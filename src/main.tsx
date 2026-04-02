import { createRoot } from "react-dom/client";
import { useThemeStore } from "./stores/theme-store";
import App from "./App.tsx";
import "./index.css";

// Apply persisted theme on load
const theme = useThemeStore.getState().activeTheme;
document.documentElement.setAttribute("data-theme", theme);

// Sync theme changes to DOM
useThemeStore.subscribe((state) => {
  document.documentElement.setAttribute("data-theme", state.activeTheme);
});

createRoot(document.getElementById("root")!).render(<App />);
