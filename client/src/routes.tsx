import { Routes, Route, Navigate } from "react-router";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatMainLayout from "./pages/chat";
import NewChatPage from "./pages/chat/new";
import ConversationPage from "./pages/chat/chat-conversation";

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
            <ChatMainLayout />
          </ChatLayout>
        }
      >
        <Route index element={<Navigate to="new" replace />} />
        <Route path="new" element={<NewChatPage />} />
        <Route path=":conversationId" element={<ConversationPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
