import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useOrderStore } from "../../store/useOrderStore";
import { employeeService } from "../../services/employeeService";
import { formatZambianTime } from "../../utils/dateUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar, Clock, DollarSign, Package, LogIn, LogOut } from "lucide-react";
import toast from "react-hot-toast";

export default function EmployeeDetailsView({ employee, onClockUpdate }) {
  const [attendance, setAttendance] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [todayStatus, setTodayStatus] = useState(null);
  const [processing, setProcessing] = useState(false);

  const { orders, fetchOrders } = useOrderStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendance();
    fetchOrders(); // Ensure we have orders loaded
    fetchTodayStatus();
  }, [employee]);

  const fetchAttendance = async () => {
    setLoadingAttendance(true);
    try {
      const data = await employeeService.getEmployeeAttendance(employee.id);
      setAttendance(data);
    } catch (error) {
      console.error("Failed to fetch attendance", error);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const fetchTodayStatus = async () => {
    try {
      const status = await employeeService.getTodayStatus(employee.id);
      setTodayStatus(status);
    } catch (error) {
      console.error("Failed to fetch status", error);
    }
  };

  const handleClockIn = async () => {
    setProcessing(true);
    try {
      await employeeService.clockIn(employee.id, "");
      toast.success(`Clocked in ${employee.name}`);
      await fetchTodayStatus();
      await fetchAttendance();
      if (onClockUpdate) onClockUpdate();
    } catch (error) {
      toast.error(error.message || "Failed to clock in");
    } finally {
      setProcessing(false);
    }
  };

  const handleClockOut = async () => {
    setProcessing(true);
    try {
      await employeeService.clockOut(employee.id, "");
      toast.success(`Clocked out ${employee.name}`);
      await fetchTodayStatus();
      await fetchAttendance();
      if (onClockUpdate) onClockUpdate();
    } catch (error) {
      toast.error(error.message || "Failed to clock out");
    } finally {
      setProcessing(false);
    }
  };

  const employeeOrders = useMemo(() => {
    return orders.filter((o) => o.assigned_tailor_id === employee.id);
  }, [orders, employee.id]);

  const handleOrderClick = (order) => {
    navigate("/orders", { state: { openOrderId: order.id } });
  };

  const attendanceColumns = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) =>
          format(new Date(row.getValue("date")), "MMM d, yyyy"),
      },
      {
        accessorKey: "clock_in",
        header: "Clock In",
        cell: ({ row }) => {
          const val = row.getValue("clock_in");
          return val ? formatZambianTime(val) : "-";
        },
      },
      {
        accessorKey: "clock_out",
        header: "Clock Out",
        cell: ({ row }) => {
          const val = row.getValue("clock_out");
          return val ? formatZambianTime(val) : "-";
        },
      },
      {
        accessorKey: "hours_worked",
        header: "Hours",
        cell: ({ row }) => {
          const val = row.getValue("hours_worked");
          return val ? `${parseFloat(val).toFixed(2)}h` : "-";
        },
      },
      {
        accessorKey: "notes",
        header: "Notes",
      },
    ],
    []
  );

  const orderColumns = useMemo(
    () => [
      {
        accessorKey: "order_number",
        header: "Order #",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="secondary" className="uppercase text-[10px]">
            {row.getValue("status")}
          </Badge>
        ),
      },
      {
        accessorKey: "due_date",
        header: "Due Date",
        cell: ({ row }) => {
          const val = row.getValue("due_date");
          return val ? format(new Date(val), "MMM d") : "-";
        },
      },
      {
        header: "Items",
        cell: ({ row }) => row.original.description || "Custom Order",
      },
    ],
    []
  );

  const stats = useMemo(() => {
    const totalHours = attendance.reduce(
      (sum, rec) => sum + parseFloat(rec.hours_worked || 0),
      0
    );
    const completedOrders = employeeOrders.filter(
      (o) => o.status === "completed" || o.status === "delivered"
    ).length;
    return { totalHours, completedOrders };
  }, [attendance, employeeOrders]);

  const isClockedIn = todayStatus && todayStatus.clock_in && !todayStatus.clock_out;
  const isShiftCompleted = todayStatus && todayStatus.clock_out;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary border-2 border-primary">
            {employee.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{employee.name}</h2>
            <div className="flex items-center gap-2">
                <p className="text-muted-foreground capitalize">{employee.role}</p>
                {isClockedIn && (
                   <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 animate-pulse">
                      Currently Clocked In
                   </Badge>
                )}
                {isShiftCompleted && (
                   <Badge variant="secondary" className="text-muted-foreground">
                      Shift Completed
                   </Badge>
                )}
            </div>
          </div>
        </div>
        
        {/* Clock Actions */}
        <div className="flex flex-col gap-2 items-end">
             {!isShiftCompleted && (
                 <>
                    {isClockedIn ? (
                        <Button 
                            onClick={handleClockOut} 
                            disabled={processing}
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {processing ? "Processing..." : (
                                <>
                                    <LogOut className="mr-2 h-4 w-4" /> Clock Out
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleClockIn} 
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {processing ? "Processing..." : (
                                <>
                                    <LogIn className="mr-2 h-4 w-4" /> Clock In
                                </>
                            )}
                        </Button>
                    )}
                 </>
             )}
             
             {/* Today's Times Display */}
             {todayStatus && (
                 <div className="flex gap-4 text-xs mt-1">
                     {todayStatus.clock_in && (
                         <span className="text-green-700 font-medium">In: {formatZambianTime(todayStatus.clock_in)}</span>
                     )}
                     {todayStatus.clock_out && (
                         <span className="text-red-600 font-medium">Out: {formatZambianTime(todayStatus.clock_out)}</span>
                     )}
                 </div>
             )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalHours.toFixed(1)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Orders
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employeeOrders.length - stats.completedOrders}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList>
          <TabsTrigger value="attendance">Attendance History</TabsTrigger>
          <TabsTrigger value="orders">Assigned Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Log</CardTitle>
              <CardDescription>
                History of clock-in and clock-out times.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable columns={attendanceColumns} data={attendance} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Work Orders</CardTitle>
              <CardDescription>
                Orders assigned to this employee.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                columns={orderColumns}
                data={employeeOrders}
                onRowClick={handleOrderClick}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
