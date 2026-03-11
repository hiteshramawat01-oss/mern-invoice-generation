import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { LogIn, AlertCircle, Shield, Zap } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@shopinvoice.com");
  const [password, setPassword] = useState("demo123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await login("demo@shopinvoice.com", "demo123456");
      navigate("/dashboard");
    } catch {
      // Try creating demo account
      try {
        await signup("demo@shopinvoice.com", "demo123456", {
          shopName: "Premium Electronics Store",
          shopAddress: "45 MG Road, Bangalore, Karnataka 560001",
          shopPhone: "+91 98765 43210",
          shopEmail: "contact@premiumelectronics.com",
          paymentUPI: "premiumstore@paytm",
          paymentInfo: "We accept Cash, UPI, Cards, and Net Banking",
          brandColor: "#7c3aed",
        });
        navigate("/dashboard");
        toast.success("Demo account created!");
      } catch (err: any) {
        setError(err.message || "Failed to set up demo account");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your invoice account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Signing in...</> : <><LogIn className="w-4 h-4 mr-2" />Sign In</>}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 font-semibold hover:underline">Sign Up</Link>
        </p>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-sm text-gray-500 font-medium">Quick Start</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <Button type="button" variant="outline" className="w-full border-purple-200 hover:bg-purple-50" onClick={handleDemoLogin} disabled={loading}>
          <Zap className="w-4 h-4 mr-2 text-purple-600" />
          <span className="text-purple-700 font-semibold">Use Demo Account</span>
        </Button>
        <p className="text-xs text-gray-500 text-center mt-2">demo@shopinvoice.com / demo123456</p>
      </Card>

      <div className="fixed bottom-4 right-4">
        <Link to="/admin/login">
          <Button variant="outline" size="sm" className="shadow-lg">
            <Shield className="w-4 h-4 mr-2" />Admin Portal
          </Button>
        </Link>
      </div>
    </div>
  );
}
