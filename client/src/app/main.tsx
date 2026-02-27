import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import AppRoutes from "./AppRoutes";
import { initDB } from "@/shared/lib/indexdb";
import "@/styles/index.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/shared/providers/ThemeProvider";
async function bootstrap() {
  await initDB();
  createRoot(document.getElementById("root")!).render(
      <ThemeProvider>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" reverseOrder={false} />
      </AuthProvider>
    </BrowserRouter>
     </ThemeProvider>
  );
}
bootstrap();
