import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Download, Filter } from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import { employeeService } from "../../services/employeeService";
import toast from "react-hot-toast";
import ResponsiveTable from "../common/ResponsiveTable";

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

  useState(() => {
    if (employee) {
      fetchAttendance();
    }
  }, [employee, dateRange]);

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
      format(new Date(record.date), "yyyy-MM-dd"),
      record.clock_in ? format(new Date(record.clock_in), "HH:mm:ss") : "N/A",
      record.clock_out ? format(new Date(record.clock_out), "HH:mm:ss") : "N/A",
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

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
          <p className="text-gray-600 capitalize">{employee.role}</p>
        </div>
        <Button
          variant="secondary"
          icon={Download}
          onClick={exportToCSV}
          disabled={attendance.length === 0}
        >
          Export CSV
        </Button>
      </div>

      {/* Date Range Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
            className="input-field"
          />
        </div>
        <div className="flex items-end">
          <Button
            onClick={fetchAttendance}
            icon={Filter}
            loading={loading}
            className="w-full"
          >
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

      {/* Attendance Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading attendance records...</p>
        </div>
      ) : attendance.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Records Found
          </h3>
          <p className="text-gray-600">
            No attendance records for the selected date range.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <ResponsiveTable>
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Clock In
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Clock Out
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Hours
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">
                      {format(new Date(record.date), "MMM dd, yyyy")}
                    </span>
                    <br />
                    <span className="text-xs text-gray-500">
                      {format(new Date(record.date), "EEEE")}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {record.clock_in
                      ? format(new Date(record.clock_in), "hh:mm a")
                      : "-"}
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {record.clock_out
                      ? format(new Date(record.clock_out), "hh:mm a")
                      : "-"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-primary-600">
                      {record.hours_worked
                        ? `${parseFloat(record.hours_worked).toFixed(2)}h`
                        : "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {record.clock_out ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Completed
                      </span>
                    ) : record.clock_in ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        In Progress
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        Absent
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {record.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </ResponsiveTable>
        </div>
      )}
    </Card>
  );
}
