import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  verifyMigration,
  getInventorySummary,
  getLowStockItems,
  getOutOfStockItems,
} from "@/services/migrationService";

/**
 * Migration Verification Component
 * Shows the status of the finished goods migration from materials to products table
 */
export function MigrationVerification() {
  const [loading, setLoading] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [lowStock, setLowStock] = useState(null);
  const [outOfStock, setOutOfStock] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [migration, summary, low, out] = await Promise.all([
        verifyMigration(),
        getInventorySummary(),
        getLowStockItems(),
        getOutOfStockItems(),
      ]);

      setMigrationStatus(migration);
      setInventory(summary);
      setLowStock(low);
      setOutOfStock(out);
    } catch (error) {
      console.error("Failed to load verification data:", error);
      toast.error("Failed to load verification data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading verification data...</div>;
  }

  const isComplete =
    migrationStatus?.stats?.migrationComplete;

  return (
    <div className="space-y-6">
      {/* Main Migration Status */}
      <Card className={isComplete ? "border-green-200 bg-green-50/50" : "border-yellow-200 bg-yellow-50/50"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {isComplete ? (
                <>
                  <CheckCircle className="text-green-600" size={24} />
                  Migration Complete
                </>
              ) : (
                <>
                  <AlertCircle className="text-yellow-600" size={24} />
                  Migration In Progress
                </>
              )}
            </CardTitle>
            <Button onClick={loadData} variant="outline" size="sm" className="gap-2">
              <RefreshCw size={16} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <p className="text-sm text-muted-foreground">Finished Goods in Materials</p>
              <p className="text-2xl font-bold">
                {migrationStatus?.stats?.finishedGoodsInMaterials || 0}
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <p className="text-sm text-muted-foreground">Migrated to Products</p>
              <p className="text-2xl font-bold">
                {migrationStatus?.stats?.finishedGoodsInProducts || 0}
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <p className="text-sm text-muted-foreground">Migration Status</p>
              <p className="text-2xl font-bold">
                {isComplete ? "✓ Ready" : "⧖ Pending"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Summary */}
      {inventory?.success && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Custom Designs</p>
                <p className="text-2xl font-bold">
                  {inventory.data.custom_designs}
                </p>
              </div>
              <div className="p-4 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-700">Finished Goods</p>
                <p className="text-2xl font-bold text-blue-900">
                  {inventory.data.finished_goods}
                </p>
              </div>
              <div className="p-4 bg-purple-100 rounded-lg">
                <p className="text-sm text-purple-700">Total In Stock</p>
                <p className="text-2xl font-bold text-purple-900">
                  {inventory.data.total_stock}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Items */}
      {lowStock?.success && lowStock.count > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-700">
              Low Stock Items ({lowStock.count})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {lowStock.data.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Stock: {item.stock_quantity} / Min: {item.min_stock_level}
                    </p>
                  </div>
                  <span className="text-sm bg-yellow-200 px-2 py-1 rounded">
                    Reorder
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Out of Stock Items */}
      {outOfStock?.success && outOfStock.count > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">
              Out of Stock Items ({outOfStock.count})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {outOfStock.data.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Category: {item.category}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ready Message */}
      {isComplete && lowStock?.count === 0 && outOfStock?.count === 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="mx-auto mb-3 text-green-600" size={40} />
              <h3 className="text-lg font-semibold text-green-900 mb-1">
                All Systems Ready
              </h3>
              <p className="text-green-700">
                The migration is complete and all inventory is in stock!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MigrationVerification;
