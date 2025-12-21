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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || parseFloat(quantity) <= 0) return;

    setLoading(true);
    try {
      await onUpdate(material.id, parseFloat(quantity), operation, notes);
      setQuantity("");
      setNotes("");
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const newQuantity =
    operation === "add"
      ? parseFloat(material?.stock_quantity || 0) + parseFloat(quantity || 0)
      : parseFloat(material?.stock_quantity || 0) - parseFloat(quantity || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                  Current: {material?.stock_quantity} {material?.unit}
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

