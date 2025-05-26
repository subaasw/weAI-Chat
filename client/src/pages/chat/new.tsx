import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Send, LinkIcon } from "lucide-react";
import { fetchSSE } from "@/lib/fetch-sse";
import { ChatMessageRequest } from "@/types/chat";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import LinkScrapingIndicator from "@/components/link-scraping-indicator";
import ChatMessage from "@/components/chat-message";
import { ChatEndpoints } from "@/utils/api-constant";

interface ScrapingStatus {
  inProgress: boolean;
  urls: string[];
  completed_urls: string[];
}

function ChatEmptyState() {
  const { user } = useAuth();

  return (
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
  );
}

export default function NewChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessageRequest[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [scrapingStatus, setScrapingStatus] = useState<ScrapingStatus>({
    inProgress: false,
    urls: [],
    completed_urls: [],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOnSubmit = async (e: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessageRequest = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const responseId = Date.now().toString() + "-response";
    const assistantMessage: ChatMessageRequest = {
      id: responseId,
      content: "",
      sender: "assistant",
    };

    setMessages((prev) => [...prev, assistantMessage]);

    await fetchSSE(
      ChatEndpoints.base,
      { message: input },
      (data, urls_config) => {
        setMessages((prev) => {
          return prev.map((msg) =>
            msg.id === responseId
              ? { ...msg, content: msg?.content + data }
              : msg
          );
        });

        if (urls_config) {
          if (urls_config?.conversationId) {
            setConversationId(urls_config.conversationId);
            return;
          }
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

  useEffect(() => {
    if (!conversationId || isLoading) return;

    const timeoutId = setTimeout(() => {
      navigate(`/chat/${conversationId}`);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [conversationId, isLoading]);

  return (
    <>
      <div className="flex-1 px-3 py-6 overflow-y-auto w-full mb-2">
        <div className="mx-auto max-w-2xl space-y-3 h-full">
          {messages.length === 0 ? (
            <ChatEmptyState />
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

      <form onSubmit={handleOnSubmit} className="p-4 border-t bg-white">
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
    </>
  );
}
