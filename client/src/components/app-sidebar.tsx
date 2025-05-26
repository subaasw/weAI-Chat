"use client";
import { useLayoutEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import {
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  Check,
  X,
  MessageSquare,
  PanelLeftClose,
  Search,
} from "lucide-react";
import { ConversationTypes } from "@/types/chat";
import {
  ConversationEditWidgetProps,
  ConversationMenuItemProps,
} from "@/types/sidebar";
import ChatService from "@/utils/chat";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

function ConversationEditWidget({
  editTitle,
  setEditTitle,
  handleCancelEdit,
  handleSaveEdit,
}: ConversationEditWidgetProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <Input
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        className="h-8 text-sm"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSaveEdit();
          if (e.key === "Escape") handleCancelEdit();
        }}
      />
      <Button
        size="sm"
        variant="ghost"
        onClick={handleSaveEdit}
        className="h-8 w-8 p-0"
      >
        <Check className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleCancelEdit}
        className="h-8 w-8 p-0"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

function ConversationMenuItem({
  conversation,
  openDropdownId,
  handleDeleteClick,
  handleEdit,
  handleMoreOptionsClick,
  handleDropdownOpenChange,
}: ConversationMenuItemProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuLink = `/chat/${conversation.id}`;
  const isActive = location.pathname === menuLink;

  return (
    <div className="relative group/item">
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className={`w-full transition-all duration-200 py-1 ${
          openDropdownId === conversation.id ||
          (typeof window !== "undefined" &&
            window.matchMedia("(hover: hover)").matches)
            ? "group-hover/item:pr-10"
            : openDropdownId === conversation.id
            ? "pr-10"
            : ""
        }`}
        onClick={() => navigate(menuLink)}
      >
        <div className="flex cursor-pointer">
          <span className="truncate text-sm text-gray-700 font-medium">
            {conversation.title}
          </span>
        </div>
      </SidebarMenuButton>

      <div
        className={`absolute right-1 top-1/2 -translate-y-1/2 z-10 transition-opacity duration-200 ${
          openDropdownId === conversation.id
            ? "opacity-100"
            : "opacity-0 group-hover/item:opacity-100"
        }`}
      >
        <DropdownMenu
          open={openDropdownId === conversation.id}
          onOpenChange={(open) =>
            handleDropdownOpenChange(open, conversation.id)
          }
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 transition-colors ${
                openDropdownId === conversation.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              onClick={(e) => handleMoreOptionsClick(e, conversation.id)}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-48">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(conversation.id, conversation.title);
              }}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(conversation.id);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleSidebar } = useSidebar();
  const [conversations, setConversations] = useState<ConversationTypes[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.created_at.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    setShowSearch(false);
    setSearchQuery("");
    navigate("/chat/new");
  };

  const handleEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
    setOpenDropdownId(null);
  };

  const handleSaveEdit = async () => {
    if (editingId && editTitle.trim()) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === editingId ? { ...conv, title: editTitle.trim() } : conv
        )
      );

      await ChatService.renameConversation(editingId, editTitle);
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleDeleteClick = (id: string) => {
    setConversationToDelete(id);
    setDeleteDialogOpen(true);
    setOpenDropdownId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!conversationToDelete) return;

    setConversations((prev) =>
      prev.filter((conv) => conv.id !== conversationToDelete)
    );

    await ChatService.removeConversation(conversationToDelete);

    if (location.pathname === `/chat/${conversationToDelete}`) {
      navigate("/chat/new");
    }
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  const handleMoreOptionsClick = (
    e: React.MouseEvent,
    conversationId: string
  ) => {
    e.stopPropagation();
    if (openDropdownId === conversationId) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(conversationId);
    }
  };

  const handleDropdownOpenChange = (open: boolean, conversationId: string) => {
    if (open) {
      setOpenDropdownId(conversationId);
      return;
    }

    if (openDropdownId === conversationId) {
      setOpenDropdownId(null);
    }
  };

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery("");
    }
  };

  useLayoutEffect(() => {
    const fetchConversations = async () => {
      const conversations = await ChatService.getConversations();

      setConversations(conversations);
    };
    fetchConversations();
  }, []);

  return (
    <>
      <Sidebar className="bg-white">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                  <MessageSquare className="h-3 w-3 text-primary-foreground" />
                </div>
                <span className="font-semibold text-sm">WeAI Chat</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleSearchToggle}
                title="Search conversations"
              >
                <Search className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={toggleSidebar}
                title="Close sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showSearch && (
            <div className="px-2 pb-2">
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-sm"
                autoFocus
              />
            </div>
          )}

          {showSearch && <Separator />}

          <SidebarMenu>
            <SidebarMenuItem>
              <Button
                onClick={handleNewChat}
                className="w-full justify-start gap-2 h-10"
                variant="default"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              {searchQuery
                ? `Search Results (${filteredConversations.length})`
                : "Conversations"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredConversations.length === 0 && searchQuery ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No conversations found for "{searchQuery}"
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <SidebarMenuItem
                      key={conversation.id}
                      className="group relative"
                    >
                      {editingId === conversation.id ? (
                        <ConversationEditWidget
                          editTitle={editTitle}
                          setEditTitle={setEditTitle}
                          handleCancelEdit={handleCancelEdit}
                          handleSaveEdit={handleSaveEdit}
                        />
                      ) : (
                        <ConversationMenuItem
                          openDropdownId={openDropdownId}
                          conversation={conversation}
                          handleDeleteClick={handleDeleteClick}
                          handleDropdownOpenChange={handleDropdownOpenChange}
                          handleEdit={handleEdit}
                          handleMoreOptionsClick={handleMoreOptionsClick}
                        />
                      )}
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
