import { Routes, Route } from "react-router-dom";
import Login from "@/pages/auth/Login";
import ProtectedRoute from "./ProtectedRoute";

function Dashboard() {
  return <h1 className="p-10">Dashboard</h1>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
