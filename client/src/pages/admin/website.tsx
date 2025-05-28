"use client";

import { useState } from "react";
import { Globe, Search, ExternalLink, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ScrapingJob {
  id: string;
  url: string;
  status: "pending" | "running" | "completed" | "failed";
  pagesFound: number;
  pagesProcessed: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export default function WebsiteTrainingPage() {
  const [url, setUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [jobs, setJobs] = useState<ScrapingJob[]>([
    {
      id: "1",
      url: "https://docs.example.com",
      status: "completed",
      pagesFound: 47,
      pagesProcessed: 47,
      startedAt: "2024-01-15T10:30:00Z",
      completedAt: "2024-01-15T10:45:00Z",
    },
    {
      id: "2",
      url: "https://support.company.com",
      status: "running",
      pagesFound: 45,
      pagesProcessed: 29,
      startedAt: "2024-01-15T14:20:00Z",
    },
    {
      id: "3",
      url: "https://blog.example.com",
      status: "failed",
      pagesFound: 0,
      pagesProcessed: 0,
      startedAt: "2024-01-15T12:00:00Z",
      error: "Access denied - robots.txt blocked",
    },
    {
      id: "4",
      url: "https://help.example.com",
      status: "completed",
      pagesFound: 23,
      pagesProcessed: 23,
      startedAt: "2024-01-14T09:15:00Z",
      completedAt: "2024-01-14T09:28:00Z",
    },
  ]);

  const validateUrl = (inputUrl: string) => {
    try {
      new URL(inputUrl);
      setIsValidUrl(true);
      return true;
    } catch {
      setIsValidUrl(false);
      return false;
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value) {
      validateUrl(value);
    } else {
      setIsValidUrl(true);
    }
  };

  const startScraping = async () => {
    if (!url || !validateUrl(url)) return;

    const newJob: ScrapingJob = {
      id: Math.random().toString(36).substr(2, 9),
      url,
      status: "pending",
      pagesFound: 0,
      pagesProcessed: 0,
      startedAt: new Date().toISOString(),
    };

    setJobs([newJob, ...jobs]);
    setUrl("");
  };

  const removeJob = (jobId: string) => {
    setJobs(jobs.filter((job) => job.id !== jobId));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Completed
          </Badge>
        );
      case "running":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            Running
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
                Website Training
              </h1>
              <p className="text-gray-600 mt-1">
                Add websites to automatically extract content for training your
                chatbot.
              </p>
            </div>
          </div>

          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="flex font-semibold items-center space-x-1.5">
                <Globe className="w-5 h-5 text-blue-600" />
                <span>Add Website</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="Enter a Website URL..."
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className={cn(
                      "h-10 lg:h-12",
                      !isValidUrl && "border-red-300 focus:border-red-500"
                    )}
                  />
                  {!isValidUrl && (
                    <p className="text-sm text-red-600 mt-1">
                      Please enter a valid URL
                    </p>
                  )}
                </div>
                <Button
                  onClick={startScraping}
                  disabled={!url || !isValidUrl}
                  className="bg-blue-600 hover:bg-blue-700 px-6 h-10 lg:h-12"
                >
                  <Search className="w-4 h-4" />
                  Start Crawling
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border pb-2 border-gray-200">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Websites</CardTitle>
                <Badge variant="outline" className="text-xs w-fit px-3 py-1.5">
                  {jobs.length} Websites
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-2">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">URL</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Started
                      </TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 truncate">
                                {job.url}
                              </p>
                              <div className="sm:hidden mt-1">
                                {getStatusBadge(job.status)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {getStatusBadge(job.status)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-sm text-gray-600">
                            {new Date(job.startedAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeJob(job.id)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {jobs.length === 0 && (
                <div className="text-center py-12">
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No websites added yet
                  </h3>
                  <p className="text-gray-600">
                    Add your first website URL above to start training your
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
