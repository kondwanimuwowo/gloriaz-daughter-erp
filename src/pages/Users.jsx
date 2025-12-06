import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Shield, UserCog, User as UserIcon, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import toast from "react-hot-toast";
import { format } from "date-fns";

const ROLE_COLORS = {
  admin: "bg-red-100 text-red-700 border-red-300",
  manager: "bg-blue-100 text-blue-700 border-blue-300",
  employee: "bg-green-100 text-green-700 border-green-300",
};

const ROLE_ICONS = {
  admin: Shield,
  manager: UserCog,
  employee: UserIcon,
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { isAdmin, profile } = useAuthStore();

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/dashboard");
      toast.error("Admin access required");
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await authService.updateUserRole(userId, newRole);
      await fetchUsers();
      toast.success("User role updated successfully");
    } catch (error) {
      toast.error("Failed to update user role");
      console.error(error);
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    const action = currentActive ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this user?`))
      return;

    try {
      if (currentActive) {
        await authService.deactivateUser(userId);
      } else {
        await authService.updateUserProfile(userId, { active: true });
      }
      await fetchUsers();
      toast.success(`User ${action}d successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} user`);
      console.error(error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    managers: users.filter((u) => u.role === "manager").length,
    employees: users.filter((u) => u.role === "employee").length,
    active: users.filter((u) => u.active).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Management
          </h1>
          <p className="text-gray-600">Manage system users and permissions</p>
        </div>
        <Button onClick={() => navigate("/signup")} icon={Plus}>
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-red-600 mb-1">Admins</p>
            <p className="text-3xl font-bold text-red-900">{stats.admins}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-blue-600 mb-1">Managers</p>
            <p className="text-3xl font-bold text-blue-900">{stats.managers}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-green-600 mb-1">Employees</p>
            <p className="text-3xl font-bold text-green-900">
              {stats.employees}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="search"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">
                  User
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">
                  Role
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">
                  Created
                </th>
                <th className="text-right py-4 px-4 font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => {
                const RoleIcon = ROLE_ICONS[user.role];
                const isCurrentUser = user.id === profile?.id;

                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    {/* User Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.full_name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        disabled={isCurrentUser}
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          ROLE_COLORS[user.role]
                        } ${isCurrentUser ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                      </select>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {format(new Date(user.created_at), "MMM dd, yyyy")}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            handleToggleActive(user.id, user.active)
                          }
                          disabled={isCurrentUser}
                          className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
                            isCurrentUser
                              ? "opacity-50 cursor-not-allowed text-gray-400"
                              : user.active
                                ? "text-red-600 hover:bg-red-50"
                                : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {user.active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600">No users found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
