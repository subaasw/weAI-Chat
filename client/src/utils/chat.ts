import serverCall, { deleteRequest } from "@/lib/serverCall";
import { ChatMessageResponse, ConversationTypes } from "@/types/chat";
import { ChatEndpoints } from "./api-constant";

export default class ChatService {
  static async getConversations(): Promise<ConversationTypes[]> {
    const res = await serverCall(ChatEndpoints.conversation.all);

    const conversations: ConversationTypes[] = await res.json();
    return conversations;
  }

  static async getMessages(
    conversationId: string
  ): Promise<ChatMessageResponse[]> {
    const res = await serverCall(
      ChatEndpoints.conversation.single(conversationId)
    );

    const messages: ChatMessageResponse[] = await res.json();
    return messages;
  }

  static async removeConversation(conversationId: string): Promise<Response> {
    const res = await deleteRequest(
      ChatEndpoints.conversation.single(conversationId)
    );

    return res;
  }

  static async renameConversation(
    conversationId: string,
    title: string
  ): Promise<Response> {
    const res = await serverCall(
      ChatEndpoints.conversation.single(conversationId),
      {
        method: "PATCH",
        body: JSON.stringify({ title }),
      }
    );

    return res;
  }
}
