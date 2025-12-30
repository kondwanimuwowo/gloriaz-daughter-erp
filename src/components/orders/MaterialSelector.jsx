import { useState, useEffect } from "react";
import { Plus, Trash2, Package, AlertCircle } from "lucide-react";
import { useInventoryStore } from "../../store/useInventoryStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MaterialSelector({ selectedMaterials = [], onChange }) {
  const { materials, fetchMaterials } = useInventoryStore();
  const [localMaterials, setLocalMaterials] = useState(selectedMaterials);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  useEffect(() => {
    setLocalMaterials(selectedMaterials);
  }, [selectedMaterials]);

  const addMaterial = () => {
    const newMaterial = {
      material_id: "",
      quantity_used: 0,
      cost: 0,
    };
    const updated = [...localMaterials, newMaterial];
    setLocalMaterials(updated);
    onChange(updated);
  };

  const removeMaterial = (index) => {
    const updated = localMaterials.filter((_, i) => i !== index);
    setLocalMaterials(updated);
    onChange(updated);
  };

  const updateMaterial = (index, field, value) => {
    const updated = [...localMaterials];
    updated[index][field] = value;

    // Auto-calculate cost when material or quantity changes
    if (field === "material_id" || field === "quantity_used") {
      const material = materials.find(
        (m) => m.id === updated[index].material_id
      );
      if (material && updated[index].quantity_used) {
        updated[index].cost =
          parseFloat(material.cost_per_unit) *
          parseFloat(updated[index].quantity_used);
      }
    }

    setLocalMaterials(updated);
    onChange(updated);
  };

  const getTotalCost = () => {
    return localMaterials.reduce((sum, m) => sum + parseFloat(m.cost || 0), 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Materials Required</h3>
        <Button
          type="button"
          variant="secondary"
          onClick={addMaterial}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Material
        </Button>
      </div>

      {localMaterials.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg border-2 border-dashed border-border">
          <Package className="mx-auto text-muted-foreground mb-2" size={32} />
          <p className="text-muted-foreground text-sm">No materials added yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click "Add Material" to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {localMaterials.map((item, index) => {
            const material = materials.find((m) => m.id === item.material_id);
            const isLowStock =
              material &&
              parseFloat(material.stock_quantity) <
              parseFloat(item.quantity_used);

            return (
              <div
                key={index}
                className="p-4 bg-muted/30 rounded-lg border border-border"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Material Selection */}
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs">
                      Material
                    </Label>
                    <select
                      value={item.material_id}
                      onChange={(e) =>
                        updateMaterial(index, "material_id", e.target.value)
                      }
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Select material...</option>
                      {materials
                        .filter(mat => mat.category !== 'finished_goods' && mat.material_type !== 'finished_product')
                        .map((mat) => (
                          <option key={mat.id} value={mat.id}>
                            {mat.name} ({mat.stock_quantity} {mat.unit} available)
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label className="text-xs">
                      Quantity {material && `(${material.unit})`}
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.quantity_used}
                      onChange={(e) =>
                        updateMaterial(index, "quantity_used", e.target.value)
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Cost (Auto-calculated) */}
                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">
                        Cost (K)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.cost}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMaterial(index)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Low Stock Warning */}
                {isLowStock && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle size={14} />
                    <span>
                      Warning: Insufficient stock! Available:{" "}
                      {material.stock_quantity} {material.unit}
                    </span>
                  </div>
                )}

                {/* Material Info */}
                {material && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span>
                      Cost per {material.unit}: K
                      {parseFloat(material.cost_per_unit).toFixed(2)}
                    </span>
                    <span className="mx-2">•</span>
                    <span>Category: {material.category}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Total Material Cost */}
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
            <span className="font-semibold text-foreground">
              Total Material Cost
            </span>
            <span className="text-xl font-bold text-primary">
              K{getTotalCost().toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

