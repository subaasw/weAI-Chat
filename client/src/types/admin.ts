export type UserChatStats = {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  totalConversations: number;
  totalMessages: number;
};

export type ConversationStats = {
  conversationId: string;
  createdAt: string;
  title: string;
  totalMessages: number;
  userId: string;
  userName: string;
};
