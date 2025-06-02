import { useState, useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";

import { ConversationHistory } from "@/types/admin";
import AdminService from "@/utils/admin";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export default function ConversationDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const conversationId = params.conversationId as string;

  const [conversation, setConversation] = useState<ConversationHistory | null>(
    null
  );

  useLayoutEffect(() => {
    const fetchConversation = async () => {
      const conversationHistory = await AdminService.fetchConversationHistory(
        conversationId
      );

      setConversation(conversationHistory);
      console.log(conversationHistory);
    };

    fetchConversation();
  }, [conversationId]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <div className="border-b border-gray-200 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex-shrink-0 text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarFallback className="bg-blue-600 text-white">
                  {getInitials(conversation.userName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h1 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">
                  {conversation.title}
                </h1>
                <p className="text-sm text-gray-600">{conversation.userName}</p>
              </div>

              <Badge variant="outline" className="flex-shrink-0">
                {conversation.messages.length} messages
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {conversation.messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] lg:max-w-[70%]",
                  message.sender === "user" ? "order-2" : "order-1"
                )}
              >
                <div
                  className={cn(
                    "rounded-lg px-4 py-3 lg:px-6 lg:py-4",
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900 border border-gray-200"
                  )}
                >
                  <p className="text-sm lg:text-base leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-opacity-20">
                    <span className="text-xs opacity-70">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
