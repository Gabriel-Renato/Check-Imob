import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// Garantir que não há conteúdo residual
rootElement.innerHTML = "";

const root = createRoot(rootElement);
root.render(<App />);
