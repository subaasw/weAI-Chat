import { Routes, Route, Navigate } from "react-router";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatMainLayout from "./pages/chat";
import NewChatPage from "./pages/chat/new";
import ConversationPage from "./pages/chat/chat-conversation";
import AdminLayout from "./pages/admin/layout";
import AdminDashboard from "./pages/admin";
import WebsiteTrainingPage from "./pages/admin/website";
import FileTrainingPage from "./pages/admin/fileupload";
import TestingPlaygroundPage from "./pages/admin/testing";
import UsersPage from "./pages/admin/users";

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

      <Route
        path="/admin"
        element={
          <AdminLayout />
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="website" element={<WebsiteTrainingPage />} />
        <Route path="files" element={<FileTrainingPage />} />
        <Route path="testing" element={<TestingPlaygroundPage />} />
        <Route path="users" element={<UsersPage />} />
        {/* <Route path=":conversationId" element={<ConversationPage />} /> */}
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
