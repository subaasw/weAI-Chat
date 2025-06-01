import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  id: string;
  name: string;
  email: string;
  totalMessages: number;
  totalConversations: number;
  createdAt: string;
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const [users] = useState<User[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      totalMessages: 247,
      totalConversations: 23,
      createdAt: "2024-01-15T09:00:00Z",
    },
    {
      id: "2",
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      totalMessages: 156,
      totalConversations: 18,
      createdAt: "2024-01-10T14:30:00Z",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      totalMessages: 89,
      totalConversations: 12,
      createdAt: "2024-01-08T11:20:00Z",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      totalMessages: 312,
      totalConversations: 34,
      createdAt: "2024-01-05T10:15:00Z",
    },
    {
      id: "5",
      name: "Alex Chen",
      email: "alex.chen@example.com",
      totalMessages: 178,
      totalConversations: 21,
      createdAt: "2024-01-12T16:45:00Z",
    },
    {
      id: "6",
      name: "Lisa Rodriguez",
      email: "lisa.rodriguez@example.com",
      totalMessages: 203,
      totalConversations: 19,
      createdAt: "2024-01-07T13:25:00Z",
    },
    {
      id: "7",
      name: "David Kim",
      email: "david.kim@example.com",
      totalMessages: 145,
      totalConversations: 15,
      createdAt: "2024-01-09T08:50:00Z",
    },
    {
      id: "8",
      name: "Rachel Green",
      email: "rachel.green@example.com",
      totalMessages: 267,
      totalConversations: 28,
      createdAt: "2024-01-03T15:40:00Z",
    },
  ]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Users</h1>
              <p className="text-gray-600 mt-1">
                Manage and monitor your user community
              </p>
            </div>
            <div className="relative max-w-md flex items-center">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-gray-600"
              />
            </div>
          </div>

          <Card className="border py-2 border-gray-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Messages</TableHead>
                      <TableHead className="text-right">
                        Conversations
                      </TableHead>
                      <TableHead className="text-right">Created Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50">
                        <TableCell className="py-3.5">{user.name}</TableCell>
                        <TableCell className="py-3.5">{user.email}</TableCell>
                        <TableCell className="text-right py-3.5">
                          {user.totalMessages.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right py-3.5">
                          {user.totalConversations.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right py-3.5">
                          {formatDate(user.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No users found matching your search criteria.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>
    </div>
  );
}
