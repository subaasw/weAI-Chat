import { ReactNode, useLayoutEffect, useState } from "react";
import { Link } from "react-router";
import {
  Upload,
  Globe,
  TestTube,
  ArrowRight,
  MessageSquare,
  Users,
  Database,
  Activity,
  Users2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AdminService from "@/utils/admin";
import { DashboardProps } from "@/types/admin";

interface DashbordWidgetCardProps {
  title: string;
  data: string | number;
  icon: ReactNode;
}

const quickActions = [
  {
    title: "Train from Website",
    description: "Scrape any website for training data",
    icon: Globe,
    href: "/admin/website",
    color: "blue",
  },
  {
    title: "Upload Files",
    description: "Add documents and files to knowledge base",
    icon: Upload,
    href: "/admin/files",
    color: "emerald",
  },
  {
    title: "Test Chatbot",
    description: "Interactive testing playground",
    icon: TestTube,
    href: "/admin/testing",
    color: "purple",
  },
  {
    title: "Users",
    description: "All registered users.",
    icon: Users2,
    href: "/admin/users",
    color: "orange",
  },
];

const DashbordWidgetCard = ({ title, data, icon }: DashbordWidgetCardProps) => {
  return (
    <Card className="border shadow-none py-2 border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{data}</p>
          </div>
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardProps>({
    messages: 0,
    users: 0,
    sources: 0,
    conversations: 0,
  });

  useLayoutEffect(() => {
    const fetchStats = async () => {
      const data = await AdminService.dashboardStats();
      setStats(data);
    };

    fetchStats();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Overview of your chatbot performance and activity
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashbordWidgetCard
              title="Total Messages"
              data={stats.messages}
              icon={<MessageSquare className="w-4 h-4 text-blue-600" />}
            />

            <DashbordWidgetCard
              title="Total Users"
              data={stats.users}
              icon={<Users className="w-4 h-4 text-emerald-600" />}
            />

            <DashbordWidgetCard
              title="Total Conversations"
              data={stats.conversations}
              icon={<Activity className="w-4 h-4 text-purple-600" />}
            />

            <DashbordWidgetCard
              title="Total Sources"
              data={stats.sources}
              icon={<Database className="w-4 h-4 text-orange-600" />}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.href} className="group">
                  <Card className="border shadow-none py-2 border-gray-200 hover:border-gray-300">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            action.color === "blue"
                              ? "bg-blue-100"
                              : action.color === "emerald"
                              ? "bg-emerald-100"
                              : action.color === "purple"
                              ? "bg-purple-100"
                              : "bg-orange-100"
                          }`}
                        >
                          <action.icon
                            className={`w-5 h-5 ${
                              action.color === "blue"
                                ? "text-blue-600"
                                : action.color === "emerald"
                                ? "text-emerald-600"
                                : action.color === "purple"
                                ? "text-purple-600"
                                : "text-orange-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {action.title}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {action.description}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
