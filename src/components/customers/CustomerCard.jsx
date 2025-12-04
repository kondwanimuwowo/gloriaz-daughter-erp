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
import Button from "../common/Button";

export default function CustomerCard({ customer, onView, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200"
    >
      {/* Header with Avatar */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {customer.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {customer.name}
            </h3>
            <p className="text-xs text-gray-500">
              Member since {format(new Date(customer.created_at), "MMM yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone size={16} className="text-gray-400" />
          <span>{customer.phone}</span>
        </div>
        {customer.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={16} className="text-gray-400" />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
        {customer.address && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} className="text-gray-400" />
            <span className="line-clamp-1">{customer.address}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-600 mb-1">Total Orders</p>
          <p className="text-lg font-bold text-blue-900">
            {customer.orders?.length || 0}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-green-600 mb-1">Measurements</p>
          <p className="text-lg font-bold text-green-900">
            {customer.measurements ? "✓ Saved" : "None"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() => onView(customer)}
          className="flex-1 text-primary-600 hover:bg-primary-50"
          icon={Eye}
        >
          View
        </Button>
        <Button
          variant="ghost"
          onClick={() => onEdit(customer)}
          className="text-blue-600 hover:bg-blue-50"
          icon={Edit}
        />
        <Button
          variant="ghost"
          onClick={() => onDelete(customer.id)}
          className="text-red-600 hover:bg-red-50"
          icon={Trash2}
        />
      </div>
    </motion.div>
  );
}
