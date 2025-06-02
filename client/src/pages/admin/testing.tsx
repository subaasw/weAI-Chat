import { useState, useRef, useEffect } from "react";
import {
  Send,
  TestTube,
  RotateCcw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Target,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { fetchSSE } from "@/lib/fetch-sse";
import { AdminEndpoints } from "@/utils/api-constant";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
  responseTime?: number;
  confidence?: number;
}

interface ChatHistory {
  role: "user" | "assistant";
  content: string;
}

export default function TestingPlaygroundPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 9),
      content: input.trim(),
      role: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setIsLoading(true);
    setError(null);

    const assistantResponseId = Math.random().toString(36).substring(2, 9);

    const initialAssistantMessage: Message = {
      id: assistantResponseId,
      content: "",
      role: "assistant",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, initialAssistantMessage]);

    try {
      const history: ChatHistory[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      await fetchSSE(
        AdminEndpoints.testing,
        {
          message: currentInput,
          history: history,
        },
        (data) => {
          setMessages((prev) => {
            return prev.map((msg) =>
              msg.id === assistantResponseId
                ? { ...msg, content: msg.content + data }
                : msg
            );
          });
        },
        () => {
          setMessages((prev) => {
            return prev.map((msg) =>
              msg.id === assistantResponseId
                ? {
                    ...msg,
                  }
                : msg
            );
          });

          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Chat API error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get response";
      setError(errorMessage);

      setMessages((prev) => {
        return prev.map((msg) =>
          msg.id === assistantResponseId
            ? {
                ...msg,
                content: `Error: ${errorMessage}`,
              }
            : msg
        );
      });

      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TestTube className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  Testing Playground
                </h1>
                <p className="text-gray-600">Test your chatbot in real-time</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-100 text-green-700 border-green-200">
                Model v2.1
              </Badge>
              <Button
                variant="outline"
                className="text-primary"
                size="sm"
                onClick={clearChat}
              >
                <RotateCcw className="w-4 h-4" />
                Clear Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">API Error: {error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto text-red-600"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                      <MessageSquare className="w-10 h-10 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Start Testing Your Chatbot
                      </h3>
                      <p className="text-gray-600 text-sm max-w-md mx-auto mb-6">
                        Send a message below to test your chatbot's responses
                        using the live API.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-6 py-4",
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900 border border-gray-200"
                      )}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>

                      {message.role === "assistant" && (
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{message.responseTime}ms</span>
                            </div>
                            {message.confidence && (
                              <div className="flex items-center space-x-1">
                                <Target className="w-3 h-3" />
                                <span>
                                  {Math.round(message.confidence * 100)}%
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-gray-200 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your test message here..."
                    disabled={isLoading}
                    rows={3}
                    className="resize-none text-foreground"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="self-end bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
