import serverCall from "@/lib/serverCall";
import { ChatMessageResponse, ConversationTypes } from "@/types/chat";
import { ChatEndpoints } from "./api-constant";

export default class ChatService {
  static async getConversations(): Promise<ConversationTypes[]> {
    const conversations: ConversationTypes[] = await serverCall.get(
      ChatEndpoints.conversation.all
    );

    return conversations;
  }

  static async getMessages(
    conversationId: string
  ): Promise<ChatMessageResponse[]> {
    const messages: ChatMessageResponse[] = await serverCall.get(
      ChatEndpoints.conversation.single(conversationId)
    );

    return messages;
  }

  static async removeConversation(conversationId: string): Promise<any> {
    const res = await serverCall.delete(
      ChatEndpoints.conversation.single(conversationId)
    );

    return res;
  }

  static async renameConversation(
    conversationId: string,
    title: string
  ): Promise<ConversationTypes> {
    const res: ConversationTypes = await serverCall.patch(
      ChatEndpoints.conversation.single(conversationId),
      { title }
    );

    return res;
  }
}
