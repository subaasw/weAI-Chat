import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "@/context/AuthProvider";
import RoutingPages from "@/routes";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RoutingPages />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
