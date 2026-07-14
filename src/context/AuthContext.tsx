import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import { type User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  verifyMagicLink: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface AuthResponse {
  token?: string;
  user?: User;
  message?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get<{ user: User }>("/api/auth/me", {
        withCredentials: true,
      });

      if (response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string): Promise<void> => {
    try {
      const response = await api.post<AuthResponse>(
        "/api/auth/email-login",
        { email },
        { withCredentials: true },
      );

      if (response.data.message) {
        return;
      }

      throw new Error("Failed to send login link");
    } catch (error) {
      throw error;
    }
  };

  const verifyMagicLink = async (token: string): Promise<void> => {
    try {
      const response = await api.post<AuthResponse>(
        "/api/auth/verify-email-login",
        { token },
        { withCredentials: true },
      );

      if (response.data.user) {
        setUser(response.data.user);
        navigate("/");
      } else {
        throw new Error("Invalid login response");
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post("/api/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    verifyMagicLink,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
