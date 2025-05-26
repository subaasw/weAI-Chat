import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";

import { UserProps } from "@/types/userAuth";
import { AuthEndpoints } from "@/utils/api-constant";
import serverCall, { deleteRequest } from "@/lib/serverCall";
import AuthService from "@/utils/userAuth";

interface AuthContextType {
  isAuthenticated: boolean;
  user: Record<string, any> | null;
  userLogin: (email: string, password: string) => Promise<Response>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await serverCall(AuthEndpoints.me);
        const userData = await response.json();
        if (userData) {
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
        }
        setIsAuthenticated(!!userData?.id);
      } catch (e) {
        console.error("fetch user error", e);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    await deleteRequest(AuthEndpoints.logout);
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  const values = {
    isAuthenticated,
    userLogin: AuthService.login,
    logout,
    user,
  };

  if (isLoading) {
    return null;
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
