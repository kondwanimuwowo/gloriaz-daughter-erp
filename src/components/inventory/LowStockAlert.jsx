import { motion } from "framer-motion";
import { AlertTriangle, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function LowStockAlert({ materials, onViewMaterial }) {
  if (!materials || materials.length === 0) return null;

  return (
    <Card className="border-l-4 border-l-red-500 dark:border-l-red-400 bg-red-50 dark:bg-red-950/30">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">
              Low Stock Alert ({materials.length}{" "}
              {materials.length === 1 ? "item" : "items"})
            </h3>
            <p className="text-xs text-red-700 dark:text-red-300 mb-4">
              The following materials are running low and need restocking:
            </p>

            <div className="space-y-1.5">
              {materials.slice(0, 5).map((material, index) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card dark:bg-card rounded-lg p-2.5 flex items-center justify-between cursor-pointer hover:shadow-sm transition-shadow border border-transparent hover:border-red-200 dark:hover:border-red-800"
                  onClick={() => onViewMaterial(material)}
                >
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground text-xs">
                        {material.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Stock: {parseFloat(material.stock_quantity).toFixed(2)}{" "}
                        {material.unit}
                        (Min: {parseFloat(material.min_stock_level).toFixed(2)})
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-red-600 dark:text-red-400 flex-shrink-0">
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
              <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                + {materials.length - 5} more materials need attention
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

