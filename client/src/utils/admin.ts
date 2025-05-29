import serverCall from "@/lib/serverCall";
import { AdminEndpoints } from "./api-constant";

interface TrainDocsPayload {
  file_name: string;
  mime_type: string;
  size: number;
}

export default class AdminService {
  static async trainDoc(data: TrainDocsPayload) {
    const doc = await serverCall.post(AdminEndpoints.train.doc, data);
    console.log("lets see the res",doc, data);
  }
}
