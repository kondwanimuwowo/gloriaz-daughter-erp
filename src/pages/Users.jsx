import { useState, useEffect, useMemo } from "react";
import { Shield, UserCog, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import StatsCard from "../components/dashboard/StatsCard";
import { CreateUserDialog } from "@/components/users/CreateUserDialog";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setUsers(data || []);
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
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
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
      setUsers(users.map(u => u.id === userId ? { ...u, active: !currentActive } : u));
      toast.success(`User ${action}d successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} user`);
      console.error(error);
    }
  };

  const stats = useMemo(() => ({
    total: users?.length || 0,
    admins: users?.filter((u) => u.role === "admin").length || 0,
    managers: users?.filter((u) => u.role === "manager").length || 0,
    employees: users?.filter((u) => u.role === "employee").length || 0,
    active: users?.filter((u) => u.active).length || 0,
  }), [users]);

  const columns = useMemo(() => [
      {
          accessorKey: "full_name",
          header: "User",
          cell: ({ row }) => {
              const user = row.original;
              const isCurrentUser = user.id === profile?.id;
              const initials = user.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
              
              return (
                  <div className="flex items-center gap-3">
                      <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                          <span className="font-semibold flex items-center gap-2">
                              {user.full_name}
                              {isCurrentUser && <Badge variant="secondary" className="text-[10px] h-4">You</Badge>}
                          </span>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                  </div>
              );
          }
      },
      {
          accessorKey: "role",
          header: "Role",
          cell: ({ row }) => {
              const user = row.original;
              const isCurrentUser = user.id === profile?.id;
              
              return (
                  <Select 
                      defaultValue={user.role} 
                      onValueChange={(val) => handleRoleChange(user.id, val)}
                      disabled={isCurrentUser}
                  >
                        <SelectTrigger className="w-[120px] h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                        </SelectContent>
                  </Select>
              )
          }
      },
      {
          accessorKey: "active",
          header: "Status",
          cell: ({ row }) => (
              <Badge variant={row.original.active ? "success" : "destructive"} className={row.original.active ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}>
                  {row.original.active ? "Active" : "Inactive"}
              </Badge>
          )
      },
      {
          accessorKey: "created_at",
          header: "Created",
          cell: ({ row }) => {
              const date = row.getValue("created_at");
              return date ? format(new Date(date), "MMM dd, yyyy") : "N/A";
          }
      },
      {
          id: "actions",
          cell: ({ row }) => {
               const user = row.original;
               const isCurrentUser = user.id === profile?.id;
               
               return (
                   <Button 
                       variant="ghost" 
                       size="sm" 
                       disabled={isCurrentUser}
                       onClick={() => handleToggleActive(user.id, user.active)}
                       className={user.active ? "text-red-500 hover:text-red-700 hover:bg-red-50" : "text-green-500 hover:text-green-700 hover:bg-green-50"}
                   >
                       {user.active ? "Deactivate" : "Activate"}
                   </Button>
               )
           }
      }
  ], [profile, users]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!users) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
              <Shield className="h-12 w-12 text-destructive" />
              <div className="text-center">
                  <h2 className="text-2xl font-bold">Failed to load users</h2>
                  <p className="text-muted-foreground">Please try refreshing the page</p>
              </div>
              <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage system users and permissions</p>
        </div>
        <CreateUserDialog onUserCreated={fetchUsers} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatsCard
            title="Total Users"
            value={stats.total}
            icon={UserIcon}
            color="blue"
          />
          <StatsCard
            title="Admins"
            value={stats.admins}
            icon={Shield}
            color="red"
          />
          <StatsCard
            title="Managers"
            value={stats.managers}
            icon={UserCog}
            color="blue"
          />
          <StatsCard
            title="Employees"
            value={stats.employees}
            icon={UserIcon}
            color="green"
          />
          <StatsCard
            title="Active Users"
            value={stats.active}
            icon={UserIcon}
            color="primary"
          />
      </div>

      <Card className="overflow-hidden border-border/60">
          <DataTable 
             columns={columns} 
             data={users} 
             filterColumn="full_name" 
             searchPlaceholder="Search users..." 
          />
      </Card>
    </div>
  );
}
