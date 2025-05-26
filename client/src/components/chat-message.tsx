import ReactMarkdown from "react-markdown";
import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessageRequest } from "@/types/chat";
import { Avatar } from "@/components/ui/avatar";

type MessageProps = {
  message: ChatMessageRequest;
};

export default function ChatMessage({ message }: MessageProps) {
  const isUser = message.sender === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-2 w-full",
        isUser
          ? "justify-start ml-auto flex-row-reverse animate-messageIn max-w-lg"
          : "animate-fadeIn max-w-2xl pr-10"
      )}
    >
      <Avatar
        className={cn(
          "h-7 w-7 flex items-center justify-center",
          isUser ? "bg-slate-800" : "bg-slate-600"
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-white" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-white" />
        )}
      </Avatar>
      <div
        className={cn(
          "rounded-md px-3 py-2 text-sm overflow-auto",
          isUser
            ? "bg-slate-800 text-white"
            : "bg-white border border-slate-200"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="leading-6 max-w-none dark:prose-invert">
            <ReactMarkdown>{message.content || "..."}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
