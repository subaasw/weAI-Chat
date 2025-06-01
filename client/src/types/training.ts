export type TrainingStatus = "pending" | "processing" | "completed" | "failed";

export type FileMetadata = {
  character_count: number;
  created_at: string;
  file_name: string;
  id: string;
  mime_type: string;
  size: number;
  status: TrainingStatus;
  updated_at: string;
};

export interface WebsiteMetadata {
  character_count: number;
  created_at: string;
  id: string;
  parent_id: string | null;
  status: TrainingStatus;
  updated_at: string;
  url: string;
}

export interface TrainDocsPayload {
  file_name: string;
  mime_type: string;
  size: number;
}
