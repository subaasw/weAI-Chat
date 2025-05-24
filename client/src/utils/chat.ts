import serverCall from "@/utils/serverCall";
import { ChatEndpoints } from "./api-constant";

export default class ChatService {
  static async getConversations(): Promise<Response> {
    const res = await serverCall(ChatEndpoints.conversation.all);

    const output = await res.json();
    console.log("Conversations", output);

    return res;
  }
}
