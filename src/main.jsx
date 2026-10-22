import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { HabitsProvider } from "./context/HabitsContext.jsx";
import { TrainingProvider } from "./context/TrainingContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <HabitsProvider>
        <TrainingProvider>
          <App />
        </TrainingProvider>
      </HabitsProvider>
    </BrowserRouter>
  </StrictMode>
);

// Só em produção: em desenvolvimento o service worker atrapalharia o recarregamento do Vite.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}
