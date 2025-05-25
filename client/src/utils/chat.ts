import serverCall from "@/utils/serverCall";
import { ConversationTypes } from "@/types/chat";
import { ChatEndpoints } from "./api-constant";

export default class ChatService {
  static async getConversations(): Promise<ConversationTypes[]> {
    const res = await serverCall(ChatEndpoints.conversation.all);

    const conversations: ConversationTypes[] = await res.json();
    return conversations;
  }

  static async getMessages(
    conversationId: string
  ): Promise<ConversationTypes[]> {
    const res = await serverCall(
      ChatEndpoints.conversation.single(conversationId)
    );

    const output: ConversationTypes[] = await res.json();
    return output;
  }
}
