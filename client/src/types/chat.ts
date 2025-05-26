export interface ConversationTypes {
  id: string;
  title: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
}

export type Sender = "user" | "assistant";

export type ChatMessageResponse = {
  id: string;
  content: string;
  sender: Sender;
  conversation_id: string;
  created_at: string;
  updated_at: string;
};

export type ChatMessageRequest = {
  id: string;
  content: string;
  sender: Sender;
};
