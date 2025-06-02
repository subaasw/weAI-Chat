import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { User, Settings, LogOut, ChevronUp } from "lucide-react";

import { useAppContext } from "@/context/AppContextProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfileDropdownProps {
  user?: {
    name: string;
    email: string;
  };
}

const defaultUser = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "",
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const navigate = useNavigate();
  const { logout } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const currentUser = user || defaultUser;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start p-3 h-auto text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
        >
          <div className="flex items-center space-x-3 w-full">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-blue-600 text-white text-sm">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
            </div>
            <ChevronUp
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="top"
        className="w-56 mb-2"
        sideOffset={8}
      >
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{currentUser.name}</p>
          <p className="text-xs text-slate-500">{currentUser.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="#" className="cursor-pointer">
            <User className="w-4 h-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="#" className="cursor-pointer">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
