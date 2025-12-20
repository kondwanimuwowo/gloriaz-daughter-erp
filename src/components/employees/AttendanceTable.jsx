import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Calendar, Download, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { employeeService } from "../../services/employeeService";
import { formatZambianTime, formatZambianDate } from "../../utils/dateUtils";
import toast from "react-hot-toast";

export default function AttendanceTable({ employee }) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: format(
      new Date(new Date().setDate(new Date().getDate() - 30)),
      "yyyy-MM-dd"
    ),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getEmployeeAttendance(
        employee.id,
        dateRange.start,
        dateRange.end
      );
      setAttendance(data);
    } catch (error) {
      toast.error("Failed to fetch attendance records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employee) {
      fetchAttendance();
    }
  }, [employee, dateRange.start, dateRange.end]);

  const totalHours = attendance.reduce(
    (sum, record) => sum + parseFloat(record.hours_worked || 0),
    0
  );

  const totalEarnings = employee.hourly_rate
    ? totalHours * parseFloat(employee.hourly_rate)
    : 0;

  const exportToCSV = () => {
    const headers = ["Date", "Clock In", "Clock Out", "Hours Worked", "Notes"];
    const rows = attendance.map((record) => [
      record.date,
      record.clock_in ? formatZambianTime(record.clock_in) : "N/A",
      record.clock_out ? formatZambianTime(record.clock_out) : "N/A",
      record.hours_worked || "0",
      record.notes || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${employee.name.replace(/\s+/g, "_")}_attendance_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Define TanStack Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <div>
            <span className="font-medium text-foreground">
              {format(new Date(row.getValue("date")), "MMM dd, yyyy")}
            </span>
            <br />
            <span className="text-xs text-muted-foreground">
              {format(new Date(row.getValue("date")), "EEEE")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "clock_in",
        header: "Clock In",
        cell: ({ row }) => formatZambianTime(row.getValue("clock_in")) || "-",
      },
      {
        accessorKey: "clock_out",
        header: "Clock Out",
        cell: ({ row }) => formatZambianTime(row.getValue("clock_out")) || "-",
      },
      {
        accessorKey: "hours_worked",
        header: "Hours",
        cell: ({ row }) => (
          <span className="font-semibold text-primary">
            {row.getValue("hours_worked")
              ? `${parseFloat(row.getValue("hours_worked")).toFixed(2)}h`
              : "-"}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const record = row.original;
          if (record.clock_out) {
            return (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                Completed
              </Badge>
            );
          } else if (record.clock_in) {
            return (
              <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">
                In Progress
              </Badge>
            );
          } else {
            return (
              <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                Absent
              </Badge>
            );
          }
        },
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.getValue("notes") || "-"}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>{employee.name}</CardTitle>
          <p className="text-muted-foreground capitalize">{employee.role}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportToCSV}
          disabled={attendance.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </CardHeader>

      <CardContent>
        {/* Date Range Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div>
            <Label className="mb-2 block">Start Date</Label>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
            />
          </div>
          <div>
            <Label className="mb-2 block">End Date</Label>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={fetchAttendance}
              className="w-full"
              disabled={loading}
            >
              {loading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              {!loading && <Filter className="mr-2 h-4 w-4" />}
              Apply Filter
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 mb-1">Total Days</p>
            <p className="text-2xl font-bold text-blue-900">
              {attendance.length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 mb-1">Total Hours</p>
            <p className="text-2xl font-bold text-green-900">
              {totalHours.toFixed(2)}
            </p>
          </div>
          {employee.hourly_rate && (
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-purple-900">
                K{totalEarnings.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Attendance Table using DataTable */}
        <div className="border rounded-lg overflow-hidden">
          <DataTable
            columns={columns}
            data={attendance}
            loading={loading}
            emptyMessage="No Records Found"
            emptyDescription="No attendance records for the selected date range."
            filterColumn="date"
            searchPlaceholder="Search by date..."
          />
        </div>
      </CardContent>
    </Card>
  );
}

