/**
 * JobFit-AI React Entry Point
 * Version: 2025-07-10
 * Maintainer: JobFit-AI Team
 *
 * Notes:
 * - Mounts the root React application and applies global styles.
 * - All providers and routing are handled in App.tsx.
 */
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
