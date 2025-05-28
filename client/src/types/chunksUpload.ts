interface FileUploadState {
  id: string;
  fileName: string;
  fileSize: number;
  progress: number;
  status: "pending" | "uploading" | "paused" | "completed" | "error";
  error?: string | null;
}

interface ChunkUploadOptions {
  chunkSize?: number;
  maxConcurrent?: number;
  maxRetries?: number;
  multiple?: boolean;
  onProgress?: (fileId: string, progress: number) => void;
  onComplete?: (fileId: string, response: any) => void;
  onError?: (fileId: string, error: string) => void;
}

export type { ChunkUploadOptions, FileUploadState };
