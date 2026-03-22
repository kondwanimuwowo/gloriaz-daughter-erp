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
      className={`bg-card rounded-lg shadow-sm border border-border p-4 hover:shadow-md transition-all duration-200 ${
        !employee.active ? "opacity-60" : ""
      }`}
    >
      {/* Header with Avatar */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground font-bold text-base">
            {employee.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">
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
          <div className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
            Inactive
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-1.5 mb-3 pb-3 border-b border-border">
        {employee.email && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail size={14} className="text-muted-foreground/70 flex-shrink-0" />
            <span className="truncate">{employee.email}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone size={14} className="text-muted-foreground/70 flex-shrink-0" />
          <span>{employee.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar size={14} className="text-muted-foreground/70 flex-shrink-0" />
          <span>
            Hired: {format(new Date(employee.hire_date), "MMM dd, yyyy")}
          </span>
        </div>
      </div>

      {/* Hourly Rate */}
      {employee.hourly_rate && (
        <div className="mb-3">
          <p className="text-[10px] text-muted-foreground mb-1">Hourly Rate</p>
          <p className="text-base font-bold text-foreground">
            K{parseFloat(employee.hourly_rate).toFixed(2)}/hr
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() => onViewDetails(employee)}
          className="flex-1 text-primary hover:bg-primary/10 text-sm h-8"
        >
          <Clock className="mr-2 h-3.5 w-3.5" />
          Attendance
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(employee)}
          className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
        >
          <Edit className="h-4 w-4" />
        </Button>
        {employee.active && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeactivate(employee.id)}
            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            <UserX className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

