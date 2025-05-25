import { Routes, Route, Navigate } from "react-router";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import ChatPage from "./pages/chat";
import ProtectedRoute from "./components/ProtectedRoute";

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

export default function RoutingPages() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/chat"
        element={
          <ChatLayout>
            <ChatPage />
          </ChatLayout>
        }
      >
        <Route index element={<></>} />
        <Route path=":conversationId" element={<></>} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
