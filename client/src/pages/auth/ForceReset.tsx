import { useState } from "react";
import axios from "@/services/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function ForceReset() {
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
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow w-96 space-y-4"
      >
        <h2 className="text-xl font-bold">
          Set New Password
        </h2>

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
