import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import DashboardPage from "./components/invoice/DashboardPage";
import InvoiceFormPage from "./components/invoice/InvoiceFormPage";
import InvoicePreviewPage from "./components/invoice/InvoicePreviewPage";
import AdminLoginPage from "./components/admin/AdminLoginPage";
import AdminDashboardPage from "./components/admin/AdminDashboardPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  
  // Allow access if user is admin
  if (user?.role === "admin") return <>{children}</>;
  
  // If there's a token but user not set, wait a moment (useEffect might still be running)
  const hasToken = localStorage.getItem("token");
  if (hasToken && !user) return <LoadingScreen />;
  
  return <Navigate to="/admin/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/invoice/new" element={<PrivateRoute><InvoiceFormPage /></PrivateRoute>} />
      <Route path="/invoice/:id/edit" element={<PrivateRoute><InvoiceFormPage /></PrivateRoute>} />
      <Route path="/invoice/:id/preview" element={<PrivateRoute><InvoicePreviewPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
