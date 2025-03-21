import { AUTH_URL } from "@/utils/api-constant";
import { deleteRequest } from "@/utils/serverCall";
import { userLogin } from "@/utils/userAuth";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: Record<string, any> | null;
  userLogin: (username: string, password: string) => Promise<Response>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("session_token");
      const userData = localStorage.getItem("user");

      if (userData) {
        setUser(JSON.parse(userData));
      }
      setIsAuthenticated(!!token);
    };

    checkAuth();
  }, []);

  const logout = async () => {
    await deleteRequest(AUTH_URL.logout);

    localStorage.removeItem("session_token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  const values = {
    isAuthenticated,
    userLogin,
    logout,
    user,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
