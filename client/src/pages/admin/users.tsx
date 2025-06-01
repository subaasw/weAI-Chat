import { useLayoutEffect, useState } from "react";
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
import AdminService from "@/utils/admin";
import { UserChatStats } from "@/types/admin";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const [users, setUsers] = useState<UserChatStats[]>([]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  useLayoutEffect(() => {
    const fetchUsers = async () => {
      const users = await AdminService.getUsers();
      setUsers(users);
    };
    fetchUsers();
  }, []);

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
                      <TableRow key={user.userId} className="hover:bg-gray-50">
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
