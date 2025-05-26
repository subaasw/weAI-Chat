import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { AppProvider } from "@/context/AppContextProvider";
import RoutingPages from "@/routes";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <RoutingPages />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>
);
