import { motion } from "framer-motion";
import { Package, AlertCircle, Edit, Trash2, Plus, Minus } from "lucide-react";
import Button from "../common/Button";

export default function MaterialCard({
  material,
  onEdit,
  onDelete,
  onUpdateStock,
}) {
  const isLowStock =
    parseFloat(material.stock_quantity) <= parseFloat(material.min_stock_level);
  const stockPercentage =
    (parseFloat(material.stock_quantity) /
      parseFloat(material.min_stock_level)) *
    100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isLowStock ? "bg-red-100" : "bg-primary-100"
            }`}
          >
            <Package
              className={isLowStock ? "text-red-600" : "text-primary-600"}
              size={24}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {material.name}
            </h3>
            <span className="text-sm text-gray-500 capitalize">
              {material.category}
            </span>
          </div>
        </div>

        {isLowStock && (
          <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
            <AlertCircle size={14} />
            Low Stock
          </div>
        )}
      </div>

      {/* Stock Info */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold text-gray-900">
            {parseFloat(material.stock_quantity).toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">{material.unit}</span>
        </div>

        {/* Stock Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(stockPercentage, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full ${isLowStock ? "bg-red-500" : "bg-green-500"}`}
          />
        </div>

        <p className="text-xs text-gray-500 mt-1">
          Min: {parseFloat(material.min_stock_level).toFixed(2)} {material.unit}
        </p>
      </div>

      {/* Cost & Supplier */}
      <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-500 mb-1">Cost per unit</p>
          <p className="font-semibold text-gray-900">
            K{parseFloat(material.cost_per_unit).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Value</p>
          <p className="font-semibold text-gray-900">
            K
            {(
              parseFloat(material.stock_quantity) *
              parseFloat(material.cost_per_unit)
            ).toFixed(2)}
          </p>
        </div>
      </div>

      {material.supplier && (
        <p className="text-sm text-gray-600 mb-4">
          <span className="text-gray-500">Supplier:</span> {material.supplier}
        </p>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 sm:flex gap-2">
        <Button
          variant="ghost"
          onClick={() => onUpdateStock(material, "add")}
          className="flex-1 text-green-600 hover:bg-green-50 text-sm"
          icon={Plus}
        >
          <span className="hidden sm:inline">Add</span>
          <span className="sm:hidden">+</span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => onUpdateStock(material, "subtract")}
          className="flex-1 text-orange-600 hover:bg-orange-50 text-sm"
          icon={Minus}
        >
          <span className="hidden sm:inline">Use</span>
          <span className="sm:hidden">-</span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => onEdit(material)}
          className="text-blue-600 hover:bg-blue-50"
          icon={Edit}
        />
        <Button
          variant="ghost"
          onClick={() => onDelete(material.id)}
          className="text-red-600 hover:bg-red-50"
          icon={Trash2}
        />
      </div>
    </motion.div>
  );
}
