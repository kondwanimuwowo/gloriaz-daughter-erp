import { motion } from "framer-motion";
import {
  Calendar,
  User,
  Package,
  DollarSign,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import OrderStatusBadge from "./OrderStatusBadge";

export default function OrderCard({ order, onView, onEdit, onDelete }) {
  const progress = {
    enquiry: 15,
    contacted: 30,
    measurements: 45,
    production: 60,
    fitting: 75,
    completed: 90,
    delivered: 100,
  };

  const currentProgress = progress[order.status] || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="bg-card rounded-lg shadow-sm border border-border p-4 hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-sm text-foreground">
            {order.order_number}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(order.order_date), "MMM dd, yyyy")}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Progress</span>
          <span className="font-semibold">{currentProgress}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${currentProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-primary"
          />
        </div>
      </div>

      {/* Customer Info */}
      <div className="space-y-1.5 mb-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2 text-xs">
          <User size={14} className="text-muted-foreground flex-shrink-0" />
          <span className="text-foreground font-medium">
            {order.customers?.name || "N/A"}
          </span>
        </div>
        {order.customers?.phone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="ml-5">{order.customers.phone}</span>
          </div>
        )}
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
          <p className="font-bold text-foreground">
            K{parseFloat(order.total_cost).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Balance</p>
          <p
            className={`font-bold ${order.balance > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
          >
            K{parseFloat(order.balance).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Due Date */}
      {order.due_date && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Calendar size={14} className="text-muted-foreground flex-shrink-0" />
          <span>Due: {format(new Date(order.due_date), "MMM dd, yyyy")}</span>
        </div>
      )}

      {/* Description */}
      {order.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {order.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() => onView(order)}
          className="flex-1 text-primary hover:bg-primary/10 text-sm h-8"
        >
          <Eye className="mr-2 h-3.5 w-3.5" />
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(order)}
          className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(order.id)}
          className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

