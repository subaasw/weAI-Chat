import {
  useState,
  createContext,
  useContext,
  type ReactNode,
  useLayoutEffect,
} from "react";

import { UserProps } from "@/types/userAuth";
import { ConversationTypes } from "@/types/chat";
import serverCall from "@/lib/serverCall";
import { AuthEndpoints } from "@/utils/api-constant";
import ChatService from "@/utils/chat";
import AuthService from "@/utils/userAuth";

interface AppContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProps | null;
  initialConversations: ConversationTypes[];
  checkAuth: () => Promise<void>;
  userLogin: (email: string, password: string) => Promise<UserProps>;
  userRegister: (
    email: string,
    fullName: string,
    password: string,
    confirmPassword: string
  ) => Promise<UserProps>;
  fetchConversations: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProps | null>(null);
  const [conversations, setConversations] = useState<ConversationTypes[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userLogin = async (email: string, password: string) => {
    const user: UserProps = await AuthService.login(email, password);
    if (user.id) {
      setUser(user);
      setIsAuthenticated(true);
    }

    return user;
  };

  const userRegister = async (
    email: string,
    fullName: string,
    password: string,
    confirmPassword: string
  ) => {
    const user: UserProps = await AuthService.register(
      email,
      fullName,
      password,
      confirmPassword
    );
    if (user.id) {
      setUser(user);
      setIsAuthenticated(true);
    }

    return user;
  };

  const checkAuth = async () => {
    if (!localStorage.getItem("user")) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const userData: UserProps = await serverCall.get(AuthEndpoints.me);

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

  const fetchConversations = async () => {
    try {
      const conversations = await ChatService.getConversations();
      setConversations(conversations);
    } catch (e) {
      console.error("Error while fetching conversations", e);
    }
  };

  const logout = async () => {
    await serverCall.delete(AuthEndpoints.logout);
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  useLayoutEffect(() => {
    checkAuth();
  }, []);

  const values = {
    isAuthenticated,
    isLoading,
    userLogin,
    userRegister,
    logout,
    user,
    checkAuth,
    initialConversations: conversations,
    fetchConversations,
  };

  if (isLoading) {
    return null;
  }

  return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
