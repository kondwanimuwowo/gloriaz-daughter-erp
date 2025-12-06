import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import Card from "../common/Card";

export default function TodayAttendance({ attendance }) {
  if (!attendance || attendance.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <Clock className="mx-auto text-gray-400 mb-3" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Attendance Today
          </h3>
          <p className="text-gray-600">No employees have clocked in yet.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Today's Attendance
      </h2>
      <div className="space-y-3">
        {attendance.map((record, index) => {
          const employee = record.employees;
          const isClockedOut = !!record.clock_out;
          return (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                isClockedOut
                  ? "bg-gray-50 border-gray-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                    isClockedOut ? "bg-gray-400" : "bg-green-500"
                  }`}
                >
                  {employee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {employee.name}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {employee.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Clock In Time */}
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Clock In</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(record.clock_in), "hh:mm a")}
                  </p>
                </div>

                {/* Clock Out Time or Status */}
                {isClockedOut ? (
                  <>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Clock Out</p>
                      <p className="font-semibold text-gray-900">
                        {format(new Date(record.clock_out), "hh:mm a")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Hours</p>
                      <p className="font-bold text-primary-600">
                        {parseFloat(record.hours_worked).toFixed(2)}h
                      </p>
                    </div>
                    <CheckCircle className="text-green-600" size={24} />
                  </>
                ) : (
                  <>
                    <div className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
                      Active
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
