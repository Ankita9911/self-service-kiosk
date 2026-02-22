import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import AppRoutes from "./AppRoutes";
import { initDB } from "@/shared/lib/indexdb";
import "@/styles/index.css";

async function bootstrap() {
  await initDB();
  console.log("IndexedDB initialized");

  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

bootstrap();
