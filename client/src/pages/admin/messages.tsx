import { useLayoutEffect, useState } from "react";
import { Link } from "react-router";
import { MessageSquare, Search, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AdminService from "@/utils/admin";
import { ConversationStats } from "@/types/admin";

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const [conversations, setConversations] = useState<ConversationStats[]>([]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredConversations = conversations.filter((conversation) => {
    const matchesSearch =
      conversation.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalMessages = conversations.reduce(
    (acc, conv) => acc + conv.totalMessages,
    0
  );

  const totalConversations = conversations.length;

  useLayoutEffect(() => {
    const getAllConversations = async () => {
      const conversations = await AdminService.fetchAllConversations();
      setConversations(conversations);
    };

    getAllConversations();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">
              View and manage customer conversations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="py-1">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Messages
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalMessages}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="py-1">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Conversations
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalConversations}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="py-1">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Conversations List */}
          <div className="space-y-3">
            {filteredConversations.map((conversation) => (
              <Link
                key={conversation.conversationId}
                to={`/admin/messages/${conversation.conversationId}`}
              >
                <Card className="hover:shadow-md py-1 transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gray-200 text-gray-700">
                          {getInitials(conversation.userName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversation.userName}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {getTimeAgo(conversation.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-2">
                          {conversation.title}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{conversation.totalMessages} messages</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filteredConversations.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No conversations found
                </h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "No conversations have started yet"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
