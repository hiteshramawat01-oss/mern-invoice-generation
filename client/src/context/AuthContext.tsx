import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, BusinessDetails } from "../types";
import { authApi, businessApi } from "../services/api";

interface AuthContextType {
  user: User | null;
  business: BusinessDetails | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, bd: Partial<BusinessDetails>) => Promise<void>;
  logout: () => void;
  updateBusiness: (data: Partial<BusinessDetails>) => Promise<void>;
  refreshBusiness: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const defaultBusiness: BusinessDetails = {
  shopName: "", shopAddress: "", shopPhone: "", shopEmail: "",
  paymentUPI: "", paymentInfo: "", paymentQRCode: "", logo: "", brandColor: "#3b82f6",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<BusinessDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const { user: u } = await authApi.getMe();
        setUser(u);
        const { business: b } = await businessApi.get();
        setBusiness({ ...defaultBusiness, ...b });
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("token");
        setUser(null);
        setBusiness(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user: u } = await authApi.login(email, password);
    localStorage.setItem("token", token);
    setUser(u);
    const { business: b } = await businessApi.get();
    setBusiness({ ...defaultBusiness, ...b });
  };

  const signup = async (email: string, password: string, bd: Partial<BusinessDetails>) => {
    const { token, user: u } = await authApi.signup(email, password, bd);
    localStorage.setItem("token", token);
    setUser(u);
    const { business: b } = await businessApi.get();
    setBusiness({ ...defaultBusiness, ...b });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setBusiness(null);
  };

  const updateBusiness = async (data: Partial<BusinessDetails>) => {
    const { business: b } = await businessApi.update(data);
    setBusiness({ ...defaultBusiness, ...b });
  };

  const refreshBusiness = async () => {
    const { business: b } = await businessApi.get();
    setBusiness({ ...defaultBusiness, ...b });
  };

  return (
    <AuthContext.Provider value={{ user, business, loading, login, signup, logout, updateBusiness, refreshBusiness, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
