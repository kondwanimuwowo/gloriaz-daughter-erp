import { motion } from "framer-motion";
import { User, Mail, Phone, Calendar, Edit, UserX, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      className={`bg-card rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition-all duration-200 ${
        !employee.active ? "opacity-60" : ""
      }`}
    >
      {/* Header with Avatar */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
            {employee.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">
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
      <div className="space-y-2 mb-4 pb-4 border-b border-border">
        {employee.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail size={16} className="text-muted-foreground/70" />
            <span className="truncate">{employee.email}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone size={16} className="text-muted-foreground/70" />
          <span>{employee.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar size={16} className="text-muted-foreground/70" />
          <span>
            Hired: {format(new Date(employee.hire_date), "MMM dd, yyyy")}
          </span>
        </div>
      </div>

      {/* Hourly Rate */}
      {employee.hourly_rate && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-1">Hourly Rate</p>
          <p className="text-lg font-bold text-foreground">
            K{parseFloat(employee.hourly_rate).toFixed(2)}/hr
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() => onViewDetails(employee)}
          className="flex-1 text-primary hover:bg-primary/10"
        >
          <Clock className="mr-2 h-4 w-4" />
          Attendance
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(employee)}
          className="text-blue-600 hover:bg-blue-50"
        >
          <Edit className="h-4 w-4" />
        </Button>
        {employee.active && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeactivate(employee.id)}
            className="text-red-600 hover:bg-red-50"
          >
            <UserX className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

