import { Outlet } from "react-router";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import AppHeader from "@/components/app-header";

export default function ChatMainLayout() {
  return (
    <SidebarProvider
      className="flex flex-col h-screen bg-slate-50"
      defaultOpen={false}
    >
      <AppSidebar />
      <AppHeader />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </SidebarProvider>
  );
}
