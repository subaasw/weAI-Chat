import { useEffect, useRef, useState } from "react";
import { LinkIcon, LogOut, Send } from "lucide-react";
import { useNavigate } from "react-router";
import { fetchSSE } from "@/utils/serverCall";
import { ChatEndpoints } from "@/utils/api-constant";

import ChatMessage from "@/components/chat-message";
import LinkScrapingIndicator from "@/components/link-scraping-indicator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthProvider";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
};

type ScrapingStatus = {
  inProgress: boolean;
  urls: string[];
  completed_urls: string[];
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState<ScrapingStatus>({
    inProgress: false,
    urls: [],
    completed_urls: [],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { logout, user } = useAuth();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const simpleChat = async (e: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const responseId = Date.now().toString() + "-response";
    const assistantMessage: Message = {
      id: responseId,
      content: "",
      role: "assistant",
    };

    setMessages((prev) => [...prev, assistantMessage]);

    await fetchSSE(
      ChatEndpoints.base,
      input,
      (data, urls_config) => {
        setMessages((prev) => {
          return prev.map((msg) =>
            msg.id === responseId
              ? { ...msg, content: msg?.content + data }
              : msg
          );
        });

        if (urls_config) {
          setScrapingStatus({
            inProgress: urls_config?.inProgress || false,
            urls: urls_config?.urls || [""],
            completed_urls: urls_config?.completed_urls || [""],
          });
        }
      },
      () => {
        setIsLoading(false);
        setScrapingStatus((prev) => ({
          ...prev,
          inProgress: false,
          urls: prev.urls,
        }));
      }
    );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="p-3 border-b bg-white">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-medium text-slate-800">WeAI Chat</h1>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-slate-600"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 px-3 py-6 overflow-y-auto w-full mb-2">
        <div className="mx-auto max-w-2xl space-y-3 h-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="mb-3 p-3 rounded-full bg-slate-100">
                <LinkIcon className="h-6 w-6" />
              </div>
              <p className="text-center text-md max-w-xs">
                <strong className="font-medium pb-4 text-lg">
                  Hello {user?.name || ""} 👋
                </strong>
                <br /> Start a conversation or paste links to analyze content.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          {scrapingStatus.inProgress && (
            <LinkScrapingIndicator
              urls={scrapingStatus.urls}
              completed={scrapingStatus.completed_urls}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={simpleChat} className="p-4 border-t bg-white">
        <div className="max-w-2xl mx-auto flex items-center space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            disabled={isLoading}
            rows={3}
            className="flex-1 resize-none"
          />

          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className="bg-slate-800 hover:bg-slate-700 text-white px-2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
