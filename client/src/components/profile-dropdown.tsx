"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut, ChevronUp } from "lucide-react";
import { Link } from "react-router";

interface ProfileDropdownProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultUser = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "",
  };

  const currentUser = user || defaultUser;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
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
              <AvatarImage
                src={currentUser.avatar || "/placeholder.svg"}
                alt={currentUser.name}
              />
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
          <Link to="/admin/profile" className="cursor-pointer">
            <User className="w-4 h-4 mr-2" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/settings" className="cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
