import ChatMessage from "@/components/chat-message";
import LinkScrapingIndicator from "@/components/link-scraping-indicator";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LinkIcon, LogOut, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
};

type ScrapingStatus = {
  inProgress: boolean;
  urls: string[];
  completed: string[];
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState<ScrapingStatus>({
    inProgress: false,
    urls: [],
    completed: [],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check");
        if (!res.ok) {
          // router.push("/")
        }
      } catch (error) {
        //   router.push("/")
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    // router.push("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Extract URLs from the message
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = input.match(urlRegex) || [];

      if (urls.length > 0) {
        setScrapingStatus({
          inProgress: true,
          urls,
          completed: [],
        });
      }

      // Set up SSE connection
      const eventSource = new EventSource(
        `/api/chat?message=${encodeURIComponent(input)}`
      );

      let responseContent = "";
      const responseId = Date.now().toString() + "-response";

      // Add empty assistant message
      setMessages((prev) => [
        ...prev,
        { id: responseId, content: "", role: "assistant" },
      ]);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "scraping_update") {
            setScrapingStatus((prev) => ({
              ...prev,
              completed: [...prev.completed, data.url],
            }));
          } else if (data.type === "scraping_complete") {
            setScrapingStatus((prev) => ({
              ...prev,
              inProgress: false,
            }));
          } else if (data.type === "content") {
            responseContent += data.content;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === responseId
                  ? { ...msg, content: responseContent }
                  : msg
              )
            );
          }
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsLoading(false);
        setScrapingStatus({
          inProgress: false,
          urls: [],
          completed: [],
        });
      };

      eventSource.addEventListener("done", () => {
        eventSource.close();
        setIsLoading(false);
        setScrapingStatus({
          inProgress: false,
          urls: [],
          completed: [],
        });
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
      setScrapingStatus({
        inProgress: false,
        urls: [],
        completed: [],
      });
    }
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

      <div className="flex-1 px-3 py-6 overflow-y-auto w-full">
        <div className="mx-auto max-w-2xl space-y-3 h-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="mb-3 p-3 rounded-full bg-slate-100">
                <LinkIcon className="h-6 w-6" />
              </div>
              <p className="text-center text-md max-w-xs">
                Start a conversation or paste links to analyze content.
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
              completed={scrapingStatus.completed}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="max-w-2xl mx-auto flex items-center space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            disabled={isLoading}
            rows={8}
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
