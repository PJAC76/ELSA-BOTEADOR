import { createRoot } from "react-dom/client";
import { useThemeStore } from "./stores/theme-store";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
