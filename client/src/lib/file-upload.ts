import { FileMetadata } from "@/types/training";
import { AdminEndpoints, FileUploadEndpoint } from "@/utils/api-constant";
import serverCall from "./serverCall";

interface UploadProgress {
  fileId: string;
  progress: number;
  chunksUploaded: number;
  totalChunks: number;
  status: "uploading" | "processing" | "completed" | "failed";
  error?: string;
  fileSize?: number;
  fileName?: string;
  mimeType?: string;
}

interface ChunkUploadResult {
  success: boolean;
  isComplete?: boolean;
  error?: string;
  filename?: string;
  size?: number;
  mime_type?: string;
}

interface FileCompleteResult {
  success: boolean;
  message?: string;
  error?: string;
  doc?: FileMetadata;
}

export class FileUploadService {
  private static readonly CHUNK_SIZE = 1024 * 1024; // 1MB chunks
  private static readonly MAX_RETRIES = 0;
  private static readonly RETRY_DELAY = 1000;

  static async uploadFileWithChunks(
    file: File,
    fileId: string,
    onProgress: (progress: UploadProgress) => void
  ): Promise<boolean> {
    const totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);

    onProgress({
      fileId,
      progress: 0,
      chunksUploaded: 0,
      totalChunks,
      status: "uploading",
    });

    try {
      for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
        const chunk = this.createChunk(file, chunkNumber);

        const result = await this.uploadChunkWithRetry(
          chunk,
          file.name,
          chunkNumber + 1,
          totalChunks
        );

        if (!result.success) {
          onProgress({
            fileId,
            progress: 0,
            chunksUploaded: chunkNumber,
            totalChunks,
            status: "failed",
            error: result.error || `Failed to upload chunk ${chunkNumber + 1}`,
          });
          return false;
        }

        const progress = Math.round(((chunkNumber + 1) / totalChunks) * 100);
        onProgress({
          fileId,
          progress,
          chunksUploaded: chunkNumber + 1,
          totalChunks,
          status: "uploading",
        });

        if (result.isComplete) {
          onProgress({
            fileId,
            progress: 100,
            chunksUploaded: totalChunks,
            totalChunks,
            status: "processing",
            ...result,
          });

          // Call completion API
          const completeResult = await this.completeFileUpload(
            result.filename || file.name,
            result.size || file.size,
            result.mime_type || file.type
          );

          if (completeResult.success) {
            onProgress({
              fileId,
              progress: 100,
              chunksUploaded: totalChunks,
              totalChunks,
              status: "completed",
              ...result,
            });
            return true;
          } else {
            onProgress({
              fileId,
              progress: 100,
              chunksUploaded: totalChunks,
              totalChunks,
              status: "failed",
              error:
                completeResult.error || "Failed to complete file processing",
            });
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      onProgress({
        fileId,
        progress: 0,
        chunksUploaded: 0,
        totalChunks,
        status: "failed",
        error: error instanceof Error ? error.message : "Upload failed",
      });
      return false;
    }
  }

  private static createChunk(file: File, chunkIndex: number): Blob {
    const start = chunkIndex * this.CHUNK_SIZE;
    const end = Math.min(start + this.CHUNK_SIZE, file.size);
    return file.slice(start, end);
  }

  private static async uploadChunkWithRetry(
    chunk: Blob,
    fileName: string,
    chunkNumber: number,
    totalChunks: number,
    retryCount = 0
  ): Promise<ChunkUploadResult> {
    try {
      const result = await this.uploadSingleChunk(
        chunk,
        fileName,
        chunkNumber,
        totalChunks
      );
      return result;
    } catch (error) {
      if (retryCount < this.MAX_RETRIES) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.RETRY_DELAY * (retryCount + 1))
        );
        return this.uploadChunkWithRetry(
          chunk,
          fileName,
          chunkNumber,
          totalChunks,
          retryCount + 1
        );
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  private static async uploadSingleChunk(
    chunk: Blob,
    fileName: string,
    chunkNumber: number,
    totalChunks: number
  ): Promise<ChunkUploadResult> {
    const formData = new FormData();
    formData.append("file", chunk);
    formData.append("name", fileName);
    formData.append("chunk_number", chunkNumber.toString());
    formData.append("total_chunks", totalChunks.toString());

    const result: ChunkUploadResult = await serverCall.post(
      FileUploadEndpoint.chunk,
      formData
    );

    return {
      success: true,
      isComplete: result.isComplete || false,
      filename: result.filename,
      size: result.size,
      mime_type: result.mime_type,
    };
  }

  private static async completeFileUpload(
    fileName: string,
    fileSize: number,
    mimeType: string
  ): Promise<FileCompleteResult> {
    try {
      const result: FileMetadata = await serverCall.post(
        AdminEndpoints.train.doc,
        {
          filename: fileName,
          size: fileSize,
          mime_type: mimeType,
        }
      );

      return {
        success: true,
        doc: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Completion failed",
      };
    }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  }
}
