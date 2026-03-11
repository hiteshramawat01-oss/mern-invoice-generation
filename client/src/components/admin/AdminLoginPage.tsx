import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Shield, ArrowLeft, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await authApi.login(email, password);
      if (user.role !== "admin") {
        setError("Admin access only. Use the regular login page for user accounts.");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", token);
      // Refresh AuthContext with the new token
      await checkAuth();
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-slate-700" />
          </div>
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="text-gray-600 text-sm mt-1">Sign in with admin credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          <div>
            <Label>Admin Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" disabled={loading} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" disabled={loading} />
          </div>
          <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-700" disabled={loading}>
            {loading ? "Signing in..." : "Sign In as Admin"}
          </Button>
        </form>
      </Card>

      <div className="fixed bottom-4 left-4">
        <Link to="/login">
          <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" />Back to User Login
          </Button>
        </Link>
      </div>

      <div className="fixed bottom-4 right-4 text-white/50 text-xs text-right">
        <p>Create admin via seed script</p>
        <p>server/src/scripts/createAdmin.js</p>
      </div>
    </div>
  );
}
