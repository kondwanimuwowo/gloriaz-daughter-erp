import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
  Clock,
  TrendingUp,
  MoreHorizontal,
  LogIn,
  LogOut
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEmployeeStore } from "../store/useEmployeeStore";
import { employeeService } from "../services/employeeService";
import { useQueryRecovery } from "../hooks/useQueryRecovery";
import { useEmployeesRealtime } from "../hooks/useEmployeesRealtime";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import AddEmployeeForm from "../components/employees/AddEmployeeForm";
import EmployeeDetailsView from "../components/employees/EmployeeDetailsView";
import StatsCard from "../components/dashboard/StatsCard";
import TimeClockMetric from "../components/employees/TimeClockMetric";
import toast from "react-hot-toast";
import { formatZambianTime } from "../utils/dateUtils";
import { useConnectionSync } from "../hooks/useConnectionSync";

export default function Employees() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Local UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);

  // 1. HARD RECOVERY ORCHESTRATION
  useQueryRecovery();
  useEmployeesRealtime();

  // 2. DATA QUERIES (Marked as erpCritical)
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAllEmployees(),
    meta: { erpCritical: true },
  });

  const { data: todayAttendance = [], isLoading: loadingAttendance } = useQuery({
    queryKey: ['today-attendance'],
    queryFn: () => employeeService.getTodayAttendance(),
    meta: { erpCritical: true },
    refetchInterval: 60000, // Still poll every minute as requested
  });

  const {
    addEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployeeStore();

  const loading = loadingEmployees || loadingAttendance;

  // Handle deep linking for specific employee
  useEffect(() => {
    if (location.state?.openEmployeeId && employees.length > 0) {
      const employeeToView = employees.find(e => e.id === location.state.openEmployeeId);
      if (employeeToView) {
        setViewingEmployee(employeeToView);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, employees]);

  // Calculate stats
  const activeEmployees = employees.filter((e) => e.active).length;
  const clockedInToday = todayAttendance.filter((a) => !a.clock_out).length;
  const totalHoursToday = todayAttendance.reduce(
    (sum, a) => sum + parseFloat(a.hours_worked || 0),
    0
  );

  const handleAddEmployee = async (data) => {
    await addEmployee(data);
    setShowAddModal(false);
    toast.success("Employee added successfully");
  };

  const handleUpdateEmployee = async (data) => {
    await updateEmployee(editingEmployee.id, data);
    setEditingEmployee(null);
    toast.success("Employee updated successfully");
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this employee?")) {
      await deleteEmployee(id);
      toast.success("Employee deactivated");
    }
  };

  const getRoleBadgeVariant = (role) => {
    const variants = {
      tailor: "default",
      cutter: "secondary",
      designer: "secondary",
      manager: "outline",
      assistant: "secondary"
    }
    return variants[role.toLowerCase()] || "secondary";
  }

  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role");
        return <Badge variant={getRoleBadgeVariant(role)} className="capitalize">{role}</Badge>
      }
    },
    {
      id: "attendance_status",
      header: "Today's Status",
      cell: ({ row }) => {
        const today = todayAttendance.find(a => a.employee_id === row.original.id);
        if (!today) return <Badge variant="outline" className="text-muted-foreground border-dashed">Absent</Badge>;

        if (today.clock_out) {
          return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Clocked Out</Badge>;
        }
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Present</Badge>;
      }
    },
    {
      id: "clock_in",
      header: "Clock In",
      cell: ({ row }) => {
        const today = todayAttendance.find(a => a.employee_id === row.original.id);
        return today?.clock_in ? (
          <div className="flex items-center gap-1 text-sm text-green-700">
            <LogIn size={14} />
            {formatZambianTime(today.clock_in)}
          </div>
        ) : <span className="text-muted-foreground text-xs text-center block">-</span>;
      }
    },
    {
      id: "clock_out",
      header: "Clock Out",
      cell: ({ row }) => {
        const today = todayAttendance.find(a => a.employee_id === row.original.id);
        return today?.clock_out ? (
          <div className="flex items-center gap-1 text-sm text-red-600">
            <LogOut size={14} />
            {formatZambianTime(today.clock_out)}
          </div>
        ) : <span className="text-muted-foreground text-xs text-center block">-</span>;
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setViewingEmployee(employee)}>
                <Clock className="mr-2 h-4 w-4" /> View & Clock In/Out
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditingEmployee(employee)}>Edit Details</DropdownMenuItem>
              <DropdownMenuSeparator />
              {employee.active && (
                <DropdownMenuItem onClick={() => handleDeleteEmployee(employee.id)} className="text-destructive">
                  Deactivate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ], [todayAttendance]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  // Handler for clock updates from modal
  const handleClockUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['today-attendance'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">Manage employees and track attendance</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TimeClockMetric />
        <StatsCard
          title="Active Employees"
          value={activeEmployees}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Clocked In Today"
          value={clockedInToday}
          icon={Clock}
          color="green"
        />
        <StatsCard
          title="Hours Today"
          value={totalHoursToday.toFixed(1)}
          icon={TrendingUp}
          color="yellow"
        />
      </div>

      <Card className="overflow-hidden border-border/60">
        <DataTable
          columns={columns}
          data={employees}
          filterColumn="name"
          searchPlaceholder="Filter employees..."
          onRowClick={setViewingEmployee}
        />
      </Card>

      {/* Add Employee Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <AddEmployeeForm
            onSubmit={handleAddEmployee}
            onCancel={() => setShowAddModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={!!editingEmployee} onOpenChange={(open) => !open && setEditingEmployee(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <AddEmployeeForm
            employee={editingEmployee}
            onSubmit={handleUpdateEmployee}
            onCancel={() => setEditingEmployee(null)}
          />
        </DialogContent>
      </Dialog>

      {/* View Employee Details & Clock In/Out Dialog */}
      <Dialog open={!!viewingEmployee} onOpenChange={(open) => !open && setViewingEmployee(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Management</DialogTitle>
          </DialogHeader>
          {viewingEmployee && (
            <EmployeeDetailsView
              employee={viewingEmployee}
              onClockUpdate={handleClockUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

