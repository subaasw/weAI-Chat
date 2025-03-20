import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown"

type MessageProps = {
  message: {
    content: string;
    role: "user" | "assistant";
  };
};

export default function ChatMessage({ message }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-2 w-full max-w-lg",
        isUser ? "justify-start ml-auto flex-row-reverse animate-messageIn" : "animate-fadeIn"
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
          "rounded-md px-3 py-2 text-sm",
          isUser
            ? "bg-slate-800 text-white"
            : "bg-white border border-slate-200"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{message.content || "..."}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
