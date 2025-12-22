import { useState } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StockUpdateModal({
  isOpen,
  onClose,
  material,
  operation,
  onUpdate,
}) {
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [orderId, setOrderId] = useState("");
  const [priceOption, setPriceOption] = useState("same"); // "same" or "new"
  const [newUnitCost, setNewUnitCost] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes
  const handleOpenChange = (open) => {
    if (!open) {
      setQuantity("");
      setNotes("");
      setOrderId("");
      setPriceOption("same");
      setNewUnitCost("");
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || parseFloat(quantity) <= 0) return;

    setLoading(true);
    try {
      const unitCost = operation === "add" && priceOption === "new" && newUnitCost
        ? parseFloat(newUnitCost)
        : null;
      
      await onUpdate(
        material.id,
        parseFloat(quantity),
        operation,
        notes,
        orderId || null,
        unitCost
      );
      handleOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const currentQuantity = parseFloat(material?.stock_quantity || 0);
  const currentCost = parseFloat(material?.cost_per_unit || 0);
  const addedQuantity = parseFloat(quantity || 0);
  
  const newQuantity =
    operation === "add"
      ? currentQuantity + addedQuantity
      : currentQuantity - addedQuantity;

  // Calculate weighted average cost if restocking with new price
  let newCostPerUnit = currentCost;
  if (operation === "add" && priceOption === "new" && newUnitCost) {
    const currentValue = currentQuantity * currentCost;
    const newStockValue = addedQuantity * parseFloat(newUnitCost);
    newCostPerUnit = (currentValue + newStockValue) / newQuantity;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {operation === "add" ? "Add Stock" : "Deduct Stock"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Material Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {material?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Current: {material?.stock_quantity} {material?.unit} @ {new Intl.NumberFormat("en-ZM", { style: "currency", currency: "ZMW" }).format(currentCost)}/{material?.unit}
                </p>
              </div>
            </div>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity to {operation === "add" ? "Add" : "Deduct"} (
              {material?.unit})
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          {/* Price Option (only for restocking) */}
          {operation === "add" && (
            <div className="space-y-3 border rounded-lg p-4 bg-blue-50/50">
              <Label className="text-sm font-semibold">Restock Price</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="same-price"
                    name="price-option"
                    value="same"
                    checked={priceOption === "same"}
                    onChange={(e) => setPriceOption(e.target.value)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="same-price" className="font-normal cursor-pointer">
                    Same price ({new Intl.NumberFormat("en-ZM", { style: "currency", currency: "ZMW" }).format(currentCost)}/{material?.unit})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="new-price"
                    name="price-option"
                    value="new"
                    checked={priceOption === "new"}
                    onChange={(e) => setPriceOption(e.target.value)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="new-price" className="font-normal cursor-pointer">
                    New price
                  </Label>
                </div>
                {priceOption === "new" && (
                  <div className="ml-6 mt-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter new cost per unit"
                      value={newUnitCost}
                      onChange={(e) => setNewUnitCost(e.target.value)}
                      required={priceOption === "new"}
                    />
                    {newUnitCost && quantity && (
                      <p className="text-xs text-muted-foreground mt-1">
                        New weighted avg: {new Intl.NumberFormat("en-ZM", { style: "currency", currency: "ZMW" }).format(newCostPerUnit)}/{material?.unit}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order ID Input (optional) */}
          <div className="space-y-2">
            <Label htmlFor="orderId">Order Reference (Optional)</Label>
            <Input
              id="orderId"
              type="text"
              placeholder="e.g., GD-2025-0001"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Link this transaction to a specific order
            </p>
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Reason (Optional)</Label>
            <Textarea
              id="notes"
              placeholder={
                operation === "add"
                  ? "e.g., New shipment arrived"
                  : "e.g., Used for urgent repair"
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Preview */}
          {quantity && parseFloat(quantity) > 0 && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                <span className="font-medium">New stock level:</span>{" "}
                <span className="text-lg font-bold">
                  {newQuantity.toFixed(2)} {material?.unit}
                </span>
                {operation === "add" && priceOption === "new" && newUnitCost && (
                  <>
                    <br />
                    <span className="font-medium">New avg cost:</span>{" "}
                    <span className="text-lg font-bold">
                      {new Intl.NumberFormat("en-ZM", { style: "currency", currency: "ZMW" }).format(newCostPerUnit)}/{material?.unit}
                    </span>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Warning for deduction */}
          {operation === "subtract" && quantity && newQuantity < 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                ⚠️ Warning: Stock will go negative!
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !quantity || parseFloat(quantity) <= 0}
            >
              {loading
                ? "Updating..."
                : operation === "add"
                ? "Add Stock"
                : "Deduct Stock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

