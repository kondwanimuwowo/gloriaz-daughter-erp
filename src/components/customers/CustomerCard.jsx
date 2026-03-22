import { motion } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingCart,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default function CustomerCard({ customer, onView, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="bg-card rounded-lg shadow-sm border border-border p-4 hover:shadow-md transition-all duration-300"
    >
      {/* Header with Avatar */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg uppercase">
            {customer.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm leading-tight">
              {customer.name}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-1">
              Registered {format(new Date(customer.created_at), "MMM yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone size={14} className="text-primary/70 flex-shrink-0" />
          <span className="font-medium">{customer.phone}</span>
        </div>
        {customer.email && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail size={14} className="text-primary/70 flex-shrink-0" />
            <span className="truncate font-medium">{customer.email}</span>
          </div>
        )}
        {customer.address && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin size={14} className="text-primary/70 flex-shrink-0" />
            <span className="line-clamp-1 font-medium">{customer.address}</span>
          </div>
        )}
      </div>

      {/* Stats - Minimalist style */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="border border-border rounded-lg p-2.5 bg-muted/20">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Orders</p>
          <p className="text-lg font-bold text-foreground">
            {customer.orders?.length || 0}
          </p>
        </div>
        <div className="border border-border rounded-lg p-2.5 bg-muted/20">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Body Stats</p>
          <p className="text-xs font-semibold text-foreground">
            {customer.measurements ? "✓ Recorded" : "Pending"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => onView(customer)}
          className="flex-1 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all rounded-lg text-sm h-8"
        >
          <Eye className="mr-2 h-3.5 w-3.5" />
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(customer)}
          className="text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:text-muted-foreground dark:hover:text-blue-400 dark:hover:bg-blue-950 transition-colors rounded-lg"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(customer.id)}
          className="text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:text-muted-foreground dark:hover:text-red-400 dark:hover:bg-red-950 transition-colors rounded-lg"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

