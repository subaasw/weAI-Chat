import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, File, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FileUpload {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "processing" | "completed" | "failed";
  progress: number;
  error?: string;
  uploadedAt?: string;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          Completed
        </Badge>
      );
    case "processing":
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          Processing
        </Badge>
      );
    case "uploading":
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
          Uploading
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">Failed</Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-200">
          Unknown
        </Badge>
      );
  }
};

export default function FileTrainingPage() {
  const [files, setFiles] = useState<FileUpload[]>([
    {
      id: "existing_1",
      name: "product-manual.pdf",
      size: 2048576,
      status: "completed",
      progress: 100,
      uploadedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "existing_2",
      name: "faq-document.docx",
      size: 1024000,
      status: "completed",
      progress: 100,
      uploadedAt: "2024-01-14T15:20:00Z",
    },
    {
      id: "existing_3",
      name: "user-guide.txt",
      size: 512000,
      status: "completed",
      progress: 100,
      uploadedAt: "2024-01-13T09:45:00Z",
    },
  ]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading" as const,
      progress: 0,
    }));

    setFiles((prev) => [...newFiles, ...prev]);

    newFiles.forEach((fileInfo) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileInfo.id
                ? { ...f, status: "processing", progress: 100 }
                : f
            )
          );
          setTimeout(() => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileInfo.id
                  ? {
                      ...f,
                      status: "completed",
                      uploadedAt: new Date().toISOString(),
                    }
                  : f
              )
            );
          }, 2000);
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileInfo.id
                ? { ...f, progress: Math.round(progress) }
                : f
            )
          );
        }
      }, 1000);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/markdown": [".md"],
      "text/csv": [".csv"],
    },
    maxSize: 100 * 1024 * 1024,
  });

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                File Training
              </h1>
              <p className="text-gray-600 mt-1">
                Upload documents to train your chatbot with custom content.
              </p>
            </div>
          </div>

          <Card className="border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span>Upload Files</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 lg:p-12 text-center cursor-pointer transition-all duration-200",
                  isDragActive
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                )}
              >
                <input {...getInputProps()} />
                <div className="space-y-4">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-600" />
                  </div>
                  {isDragActive ? (
                    <div>
                      <p className="text-lg lg:text-xl font-medium text-emerald-600">
                        Drop files here
                      </p>
                      <p className="text-gray-500">Release to upload</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg lg:text-xl font-medium text-gray-900">
                        Drag & drop files
                      </p>
                      <p className="text-gray-500 mb-4">or click to browse</p>
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <File className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  )}
                  <p className="text-sm text-gray-400">
                    PDF, DOC, TXT, MD, CSV • Max 28MB per file
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Uploaded Files</CardTitle>
                <Badge variant="outline" className="text-sm w-fit">
                  {files.length} files
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">File Name</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Size
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Uploaded
                      </TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 truncate">
                                {file.name}
                              </p>
                              <div className="sm:hidden mt-1">
                                {getStatusBadge(file.status)}
                              </div>
                              {(file.status === "uploading" ||
                                file.status === "processing") && (
                                <div className="mt-2 sm:hidden">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${file.progress}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {file.progress}%
                                  </p>
                                </div>
                              )}
                              {file.error && (
                                <p className="text-sm text-red-600 mt-1 truncate">
                                  {file.error}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="space-y-2">
                            {getStatusBadge(file.status)}
                            {(file.status === "uploading" ||
                              file.status === "processing") && (
                              <div className="w-24">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${file.progress}%` }}
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {file.progress}%
                                </p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-gray-900">
                            {formatFileSize(file.size)}
                          </span>
                        </TableCell>

                        <TableCell className="hidden lg:table-cell">
                          <span className="text-sm text-gray-600">
                            {file.uploadedAt
                              ? new Date(file.uploadedAt).toLocaleDateString()
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {files.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No files uploaded yet
                  </h3>
                  <p className="text-gray-600">
                    Upload your first document above to start training your
                    chatbot.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
