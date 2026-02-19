import { useState } from "react";
import axios from "@/services/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await axios.post("/auth/force-reset-password", {
      password,
    });

    navigate("/");
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-xl font-bold mb-4">
        Change Password
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />

        <button className="w-full bg-orange-600 text-white p-2 rounded">
          Update Password
        </button>
      </form>
    </div>
  );
}
