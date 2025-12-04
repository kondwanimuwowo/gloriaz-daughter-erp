import { motion } from "framer-motion";
import { User, Mail, Phone, Calendar, Edit, UserX, Clock } from "lucide-react";
import Button from "../common/Button";
import { format } from "date-fns";

export default function EmployeeCard({
  employee,
  onEdit,
  onDeactivate,
  onViewDetails,
}) {
  const getRoleBadgeColor = (role) => {
    const colors = {
      tailor: "bg-purple-100 text-purple-700",
      cutter: "bg-blue-100 text-blue-700",
      designer: "bg-pink-100 text-pink-700",
      manager: "bg-green-100 text-green-700",
      assistant: "bg-yellow-100 text-yellow-700",
    };
    return colors[role.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200 ${
        !employee.active ? "opacity-60" : ""
      }`}
    >
      {/* Header with Avatar */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {employee.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {employee.name}
            </h3>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${getRoleBadgeColor(employee.role)}`}
            >
              {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
            </span>
          </div>
        </div>

        {!employee.active && (
          <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
            Inactive
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
        {employee.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={16} className="text-gray-400" />
            <span className="truncate">{employee.email}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone size={16} className="text-gray-400" />
          <span>{employee.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} className="text-gray-400" />
          <span>
            Hired: {format(new Date(employee.hire_date), "MMM dd, yyyy")}
          </span>
        </div>
      </div>

      {/* Hourly Rate */}
      {employee.hourly_rate && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Hourly Rate</p>
          <p className="text-lg font-bold text-gray-900">
            K{parseFloat(employee.hourly_rate).toFixed(2)}/hr
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() => onViewDetails(employee)}
          className="flex-1 text-primary-600 hover:bg-primary-50"
          icon={Clock}
        >
          Attendance
        </Button>
        <Button
          variant="ghost"
          onClick={() => onEdit(employee)}
          className="text-blue-600 hover:bg-blue-50"
          icon={Edit}
        />
        {employee.active && (
          <Button
            variant="ghost"
            onClick={() => onDeactivate(employee.id)}
            className="text-red-600 hover:bg-red-50"
            icon={UserX}
          />
        )}
      </div>
    </motion.div>
  );
}
