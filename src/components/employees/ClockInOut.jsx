import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, LogIn, LogOut, User } from "lucide-react";
import { format } from "date-fns";
import Button from "../common/Button";
import Card from "../common/Card";
import { employeeService } from "../../services/employeeService";
import toast from "react-hot-toast";

export default function ClockInOut({ employees, onClockAction }) {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [todayStatus, setTodayStatus] = useState(null);
  const [notes, setNotes] = useState("");

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch today's status when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      fetchTodayStatus();
    } else {
      setTodayStatus(null);
    }
  }, [selectedEmployee]);

  const fetchTodayStatus = async () => {
    try {
      const status = await employeeService.getTodayStatus(selectedEmployee);
      setTodayStatus(status);
    } catch (error) {
      setTodayStatus(null);
    }
  };

  const handleClockIn = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    setLoading(true);
    try {
      await employeeService.clockIn(selectedEmployee, notes);
      toast.success("Clocked in successfully!");
      setNotes("");
      await fetchTodayStatus();
      onClockAction();
    } catch (error) {
      toast.error(error.message || "Failed to clock in");
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    setLoading(true);
    try {
      await employeeService.clockOut(selectedEmployee, notes);
      toast.success("Clocked out successfully!");
      setNotes("");
      await fetchTodayStatus();
      onClockAction();
    } catch (error) {
      toast.error(error.message || "Failed to clock out");
    } finally {
      setLoading(false);
    }
  };

  const selectedEmployeeData = employees.find((e) => e.id === selectedEmployee);
  const isClockedIn =
    todayStatus && todayStatus.clock_in && !todayStatus.clock_out;
  const isCompleted = todayStatus && todayStatus.clock_out;

  return (
    <Card className="bg-gradient-to-br from-primary-50 to-white">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-3">
          <Clock className="text-primary-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Time Clock</h2>
        <div className="text-4xl font-bold text-primary-600">
          {format(currentTime, "HH:mm:ss")}
        </div>
        <p className="text-gray-600 mt-1">
          {format(currentTime, "EEEE, MMMM dd, yyyy")}
        </p>
      </div>

      <div className="space-y-4">
        {/* Employee Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Employee
          </label>
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="input-field pl-10"
              disabled={loading}
            >
              <option value="">Choose an employee...</option>
              {employees
                .filter((e) => e.active)
                .map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.role}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Status Display */}
        <AnimatePresence mode="wait">
          {selectedEmployee && todayStatus && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg p-4 border border-gray-200"
            >
              <h3 className="font-semibold text-gray-900 mb-3">
                Today's Status
              </h3>

              {todayStatus.clock_in && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Clock In:</span>
                  <span className="font-semibold text-green-600">
                    {format(new Date(todayStatus.clock_in), "hh:mm a")}
                  </span>
                </div>
              )}

              {todayStatus.clock_out && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Clock Out:</span>
                    <span className="font-semibold text-red-600">
                      {format(new Date(todayStatus.clock_out), "hh:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Hours Worked:</span>
                    <span className="font-bold text-primary-600 text-lg">
                      {parseFloat(todayStatus.hours_worked).toFixed(2)} hrs
                    </span>
                  </div>
                </>
              )}

              {isClockedIn && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-green-800">
                    🟢 Currently Clocked In
                  </p>
                </div>
              )}

              {isCompleted && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-blue-800">
                    ✅ Shift Completed
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes */}
        {selectedEmployee && !isCompleted && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              className="input-field resize-none"
              placeholder="Add any notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        {/* Action Buttons */}
        {selectedEmployee && !isCompleted && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleClockIn}
              disabled={loading || isClockedIn}
              className={`${isClockedIn ? "opacity-50" : "bg-green-600 hover:bg-green-700"}`}
              icon={LogIn}
              loading={loading && !isClockedIn}
            >
              Clock In
            </Button>
            <Button
              onClick={handleClockOut}
              disabled={loading || !isClockedIn}
              className={`${!isClockedIn ? "opacity-50" : "bg-red-600 hover:bg-red-700"}`}
              icon={LogOut}
              loading={loading && isClockedIn}
            >
              Clock Out
            </Button>
          </div>
        )}

        {!selectedEmployee && (
          <div className="text-center py-4 text-gray-500 text-sm">
            Select an employee to clock in/out
          </div>
        )}
      </div>
    </Card>
  );
}
