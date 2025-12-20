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
      className="bg-card rounded-2xl shadow-sm border border-border p-6 hover:shadow-md transition-all duration-300"
    >
      {/* Header with Avatar */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xl uppercase">
            {customer.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg leading-tight">
              {customer.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Registered {format(new Date(customer.created_at), "MMM yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2.5 mb-5 pb-5 border-b border-border/60">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Phone size={16} className="text-primary/70" />
          <span className="font-medium">{customer.phone}</span>
        </div>
        {customer.email && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Mail size={16} className="text-primary/70" />
            <span className="truncate font-medium">{customer.email}</span>
          </div>
        )}
        {customer.address && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin size={16} className="text-primary/70" />
            <span className="line-clamp-1 font-medium">{customer.address}</span>
          </div>
        )}
      </div>

      {/* Stats - Minimalist style */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-border/60 rounded-xl p-3 bg-muted/20">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Orders</p>
          <p className="text-xl font-bold text-foreground">
            {customer.orders?.length || 0}
          </p>
        </div>
        <div className="border border-border/60 rounded-xl p-3 bg-muted/20">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Body Stats</p>
          <p className="text-sm font-semibold text-foreground">
            {customer.measurements ? "✓ Recorded" : "Pending"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => onView(customer)}
          className="flex-1 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Profile
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(customer)}
          className="text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-xl"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(customer.id)}
          className="text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

