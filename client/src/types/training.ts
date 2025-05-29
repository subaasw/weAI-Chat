export type FileMetadata = {
  character_count: number;
  created_at: string;
  file_name: string;
  id: string;
  mime_type: string;
  size: number;
  status: "pending" | "processing" | "completed" | "failed";
  updated_at: string;
};
