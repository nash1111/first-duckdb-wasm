import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { LeftToaster } from "@/components/ui/left-toaster";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <LeftToaster />
  </StrictMode>,
);
