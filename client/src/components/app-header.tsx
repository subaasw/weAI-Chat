import { useNavigate } from "react-router";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useAppContext } from "@/context/AppContextProvider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  const initials = parts[0][0] + parts[parts.length - 1][0];
  return initials.toUpperCase();
}

export default function AppHeader() {
  const navigate = useNavigate();
  const { logout, user } = useAppContext();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="p-3 border-b bg-white">
      <div className="max-w-3xl mx-auto flex justify-between items-center">
        <div className="flex gap-1 items-center">
          <SidebarTrigger />
          <h1 className="text-lg font-medium text-slate-800">WeAI Chat</h1>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">
                  {getInitials(user?.name || "User")}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{user?.name}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
