import {
  FileMetadata,
  TrainDocsPayload,
  WebsiteMetadata,
} from "@/types/training";
import { ConversationStats, UserChatStats } from "@/types/admin";

import serverCall from "@/lib/serverCall";
import { AdminEndpoints } from "./api-constant";

export default class AdminService {
  static async trainDoc(data: TrainDocsPayload): Promise<FileMetadata> {
    const doc: FileMetadata = await serverCall.post(
      AdminEndpoints.train.doc.base,
      data
    );
    return doc;
  }

  static async fetchDocs(): Promise<FileMetadata[]> {
    const docs: FileMetadata[] = await serverCall.get(
      AdminEndpoints.train.doc.base
    );
    return docs;
  }

  static async removeFile(docId: string) {
    const res = await serverCall.delete(AdminEndpoints.train.doc.single(docId));
    return res;
  }

  static async addWebsite(url: string) {
    const res = await serverCall.post(AdminEndpoints.train.website.base, {
      url,
    });

    return res;
  }

  static async fetchWebsites(): Promise<WebsiteMetadata[]> {
    const res: WebsiteMetadata[] = await serverCall.get(
      AdminEndpoints.train.website.base
    );

    return res;
  }

  static async removeWebsite(websiteId: string) {
    const res = await serverCall.delete(
      AdminEndpoints.train.website.single(websiteId)
    );
    return res;
  }

  static async getUsers(): Promise<UserChatStats[]> {
    const users: UserChatStats[] = await serverCall.get(
      AdminEndpoints.users.base
    );
    return users;
  }

  static async fetchAllConversations(): Promise<ConversationStats[]> {
    const conversations: ConversationStats[] = await serverCall.get(
      AdminEndpoints.conversations.base
    );
    return conversations;
  }
}
