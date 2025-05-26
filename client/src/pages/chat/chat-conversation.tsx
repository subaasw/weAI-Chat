import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router";
import { Send } from "lucide-react";
import { ChatMessageRequest } from "@/types/chat";
import { fetchSSE } from "@/lib/fetch-sse";
import ChatService from "@/utils/chat";
import { ChatEndpoints } from "@/utils/api-constant";
import { useAppContext } from "@/context/AppContextProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ChatMessage from "@/components/chat-message";
import LinkScrapingIndicator from "@/components/link-scraping-indicator";

interface ScrapingStatus {
  inProgress: boolean;
  urls: string[];
  completed_urls: string[];
}

type History = {
  role: "user" | "assistant";
  content: string;
};

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { fetchConversations } = useAppContext();

  const [messages, setMessages] = useState<ChatMessageRequest[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [scrapingStatus, setScrapingStatus] = useState<ScrapingStatus>({
    inProgress: false,
    urls: [],
    completed_urls: [],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const messages = await ChatService.getMessages(conversationId);

        if (Array.isArray(messages)) {
          setMessages(messages);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

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

    const historyMessages: History[] = [];
    for (let msg of messages) {
      historyMessages.push({ role: msg.sender, content: msg.content });
    }

    await fetchSSE(
      ChatEndpoints.conversation.single(conversationId),
      { message: input, history: historyMessages },
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

        if (messages.length == 4) {
          fetchConversations();
        }
      }
    );
  };

  if (isLoadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-slate-400">Loading conversation...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 px-3 py-6 overflow-y-auto w-full mb-2">
        <div className="mx-auto max-w-2xl space-y-3 h-full">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <p>No messages in this conversation yet.</p>
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
