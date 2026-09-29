import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./app/context/AuthContext";
import AppRoutes from "./app/routing/routes";
import "./index.css";

async function bootstrap() {
  if (import.meta.env.VITE_USE_MOCKS === "true") {
    const { installMocks } = await import("./app/api/mock");
    installMocks();
  }

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

bootstrap();