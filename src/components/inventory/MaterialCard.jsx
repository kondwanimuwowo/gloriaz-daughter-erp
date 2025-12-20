import { motion } from "framer-motion";
import { Package, AlertCircle, Edit, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      className="bg-card rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isLowStock ? "bg-red-100" : "bg-primary/20"
            }`}
          >
            <Package
              className={isLowStock ? "text-red-600" : "text-primary"}
              size={24}
            />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">
              {material.name}
            </h3>
            <span className="text-sm text-muted-foreground capitalize">
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
          <span className="text-2xl font-bold text-foreground">
            {parseFloat(material.stock_quantity).toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground">{material.unit}</span>
        </div>

        {/* Stock Progress Bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(stockPercentage, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full ${isLowStock ? "bg-red-500" : "bg-green-500"}`}
          />
        </div>

        <p className="text-xs text-muted-foreground mt-1">
          Min: {parseFloat(material.min_stock_level).toFixed(2)} {material.unit}
        </p>
      </div>

      {/* Cost & Supplier */}
      <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-border">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Cost per unit</p>
          <p className="font-semibold text-foreground">
            K{parseFloat(material.cost_per_unit).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Total Value</p>
          <p className="font-semibold text-foreground">
            K
            {(
              parseFloat(material.stock_quantity) *
              parseFloat(material.cost_per_unit)
            ).toFixed(2)}
          </p>
        </div>
      </div>

      {material.supplier && (
        <p className="text-sm text-muted-foreground mb-4">
          <span className="text-muted-foreground/70">Supplier:</span> {material.supplier}
        </p>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 sm:flex gap-2">
        <Button
          variant="ghost"
          onClick={() => onUpdateStock(material, "add")}
          className="flex-1 text-green-600 hover:bg-green-50 text-sm"
        >
          <Plus className="mr-2 h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline mr-2"><Plus className="h-4 w-4 inline" /></span>
          <span className="hidden sm:inline">Add</span>
          <span className="sm:hidden">Add</span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => onUpdateStock(material, "subtract")}
          className="flex-1 text-orange-600 hover:bg-orange-50 text-sm"
        >
          <Minus className="mr-2 h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline mr-2"><Minus className="h-4 w-4 inline" /></span>
          <span className="hidden sm:inline">Use</span>
          <span className="sm:hidden">Use</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(material)}
          className="text-blue-600 hover:bg-blue-50"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(material.id)}
          className="text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

