import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  LockKeyhole, 
  Mail, 
  Loader2, 
  ChefHat, 
  ShieldCheck 
} from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-white">
      {/* Left Side: Visual/Branding Section (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-orange-600 items-center justify-center p-12 relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="relative z-10 max-w-md text-center space-y-6">
          <div className="inline-flex p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 mb-4">
            <ChefHat className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight">
            Kiosk Admin Portal
          </h1>
          <p className="text-orange-100 text-lg">
            Streamline your franchise operations and manage outlets with our central kitchen intelligence system.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-orange-200 bg-orange-700/50 px-4 py-2 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              Secure Enterprise Access
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#fafafa]">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-500 font-medium">
              Enter your credentials to access the dashboard
            </p>
          </div>

          <Card className="border-slate-200 shadow-xl shadow-slate-200/50 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-slate-800">Sign In</CardTitle>
              <CardDescription>Use your registered administrator email</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@kioskapp.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-slate-200 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
                  </div>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12 border-slate-200 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Sign In to Portal"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-slate-400">
            Internal Use Only. Authorized access is monitored.
          </p>
        </div>
      </div>
    </div>
  );
}