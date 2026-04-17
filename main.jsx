import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { CropSeasonProvider } from "./context/CropSeasonContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CropSeasonProvider>
      <App />
    </CropSeasonProvider>
  </StrictMode>
);