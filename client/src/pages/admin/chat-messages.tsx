import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Clock,
  Target,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
  responseTime?: number;
  confidence?: number;
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  messages: Message[];
}

export default function ConversationDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const conversationId = params.conversationId as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    const mockConversation: Conversation = {
      id: conversationId,
      userId: "user_1",
      userName: "John Doe",
      title: "Password Reset Help",
      messages: [
        {
          id: "1",
          content: "How can I reset my password?",
          role: "user",
          timestamp: "2024-01-20T10:25:00Z",
        },
        {
          id: "2",
          content:
            "I'll help you reset your password. Please follow these steps:\n\n1. Go to the login page\n2. Click 'Forgot Password'\n3. Enter your email address\n4. Check your email for the reset link\n5. Follow the instructions in the email\n\nIf you don't receive the email within a few minutes, please check your spam folder.",
          role: "assistant",
          timestamp: "2024-01-20T10:25:15Z",
          responseTime: 1200,
          confidence: 0.94,
        },
        {
          id: "3",
          content: "I tried that but I'm not receiving the email",
          role: "user",
          timestamp: "2024-01-20T10:27:00Z",
        },
        {
          id: "4",
          content:
            "Let me help you troubleshoot this issue. Here are a few things to check:\n\n1. **Check your spam/junk folder** - Sometimes reset emails end up there\n2. **Verify your email address** - Make sure you're using the correct email associated with your account\n3. **Wait a few more minutes** - Sometimes there can be a delay\n\nIf none of these work, I can help you with alternative methods to reset your password. Would you like me to guide you through those options?",
          role: "assistant",
          timestamp: "2024-01-20T10:27:10Z",
          responseTime: 800,
          confidence: 0.89,
        },
        {
          id: "5",
          content:
            "Found it in spam! It worked perfectly. Thank you so much for your help!",
          role: "user",
          timestamp: "2024-01-20T10:29:00Z",
        },
        {
          id: "6",
          content:
            "Wonderful! I'm so glad we could resolve that for you. It's quite common for automated emails to end up in spam folders, so that's always a good first place to check.\n\nIs there anything else I can help you with today?",
          role: "assistant",
          timestamp: "2024-01-20T10:29:05Z",
          responseTime: 950,
          confidence: 0.96,
        },
      ],
    };

    setConversation(mockConversation);
  }, [conversationId]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

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
    <div className="flex-1 flex flex-col bg-white">
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
                <AvatarImage
                  src={conversation.userAvatar || "/placeholder.svg"}
                  alt={conversation.userName}
                />
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
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] lg:max-w-[70%]",
                  message.role === "user" ? "order-2" : "order-1"
                )}
              >
                <div
                  className={cn(
                    "rounded-lg px-4 py-3 lg:px-6 lg:py-4",
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900 border border-gray-200"
                  )}
                >
                  <p className="text-sm lg:text-base leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-opacity-20">
                    <span className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleString()}
                    </span>

                    {message.role === "assistant" && (
                      <div className="flex items-center space-x-3">
                        {message.responseTime && (
                          <span className="text-xs opacity-70 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {message.responseTime}ms
                          </span>
                        )}
                        {message.confidence && (
                          <span className="text-xs opacity-70 flex items-center">
                            <Target className="w-3 h-3 mr-1" />
                            {Math.round(message.confidence * 100)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {message.role === "assistant" && (
                  <div className="flex items-center space-x-2 mt-2 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
