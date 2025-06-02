import { useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router";
import {
  Globe,
  TestTube,
  Brain,
  BarChart3,
  Menu,
  X,
  Users,
  MessageSquare,
  File,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContextProvider";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: BarChart3 },
  { name: "Website", href: "/admin/website", icon: Globe },
  { name: "Files", href: "/admin/files", icon: File },
  { name: "Testing", href: "/admin/testing", icon: TestTube },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Users", href: "/admin/users", icon: Users },
];

export default function AdminLayout() {
  const location = useLocation();
  const { user } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (user?.type !== "admin") {
    return <Navigate to="/chat" />;
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white hover:bg-slate-700"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={cn(
          "w-72 bg-slate-800 flex flex-col transition-transform duration-300 z-50",
          "lg:translate-x-0 lg:relative lg:z-auto",
          isMobileMenuOpen
            ? "translate-x-0 fixed inset-y-0"
            : "-translate-x-full fixed inset-y-0"
        )}
      >
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">ChatBot Admin</h1>
              <p className="text-xs text-slate-400">Training Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium truncate">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {user ? (
          <div className="p-4 border-t border-slate-700">
            <ProfileDropdown user={user} />
          </div>
        ) : null}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
}
