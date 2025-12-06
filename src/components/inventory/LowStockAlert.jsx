import { motion } from "framer-motion";
import { AlertTriangle, Package } from "lucide-react";
import Card from "../common/Card";

export default function LowStockAlert({ materials, onViewMaterial }) {
  if (!materials || materials.length === 0) return null;

  return (
    <Card className="border-l-4 border-l-red-500 bg-red-50">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="text-red-600" size={24} />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-2">
            Low Stock Alert ({materials.length}{" "}
            {materials.length === 1 ? "item" : "items"})
          </h3>
          <p className="text-sm text-red-700 mb-4">
            The following materials are running low and need restocking:
          </p>

          <div className="space-y-2">
            {materials.slice(0, 5).map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-3 flex items-center justify-between cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => onViewMaterial(material)}
              >
                <div className="flex items-center gap-3">
                  <Package size={16} className="text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {material.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Stock: {parseFloat(material.stock_quantity).toFixed(2)}{" "}
                      {material.unit}
                      (Min: {parseFloat(material.min_stock_level).toFixed(2)})
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-red-600">
                  {(
                    (parseFloat(material.stock_quantity) /
                      parseFloat(material.min_stock_level)) *
                    100
                  ).toFixed(0)}
                  %
                </span>
              </motion.div>
            ))}
          </div>

          {materials.length > 5 && (
            <p className="text-sm text-red-700 mt-3">
              + {materials.length - 5} more materials need attention
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
