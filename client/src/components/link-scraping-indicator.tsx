import { Progress } from "@/components/ui/progress";
import { Link, CheckCircle } from "lucide-react";

type LinkScrapingIndicatorProps = {
  urls: string[];
  completed: string[];
};

export default function LinkScrapingIndicator({
  urls,
  completed,
}: LinkScrapingIndicatorProps) {
  const progress = urls.length > 0 ? (completed.length / urls.length) * 100 : 0;

  return (
    <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-3 border border-slate-200 max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Link className="h-4 w-4 text-indigo-500" />
        <span className="text-sm font-medium text-slate-700">
          Scraping {urls.length} link{urls.length !== 1 ? "s" : ""}...
        </span>
      </div>
      <Progress value={progress} className="h-1.5 mb-2" />
      <div className="text-xs text-slate-500">
        {completed.length} of {urls.length} completed
      </div>
      <div className="mt-2 max-h-20 overflow-y-auto">
        {urls.map((url, index) => {
          const isCompleted = completed.includes(url);
          const displayUrl =
            url.length > 40 ? url.substring(0, 40) + "..." : url;

          return (
            <div key={index} className="flex items-center gap-1 text-xs mb-1">
              {isCompleted ? (
                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-slate-200 flex-shrink-0" />
              )}
              <span
                className={isCompleted ? "text-green-700" : "text-slate-600"}
              >
                {displayUrl}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
