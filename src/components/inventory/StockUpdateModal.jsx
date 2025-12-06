import { useState } from "react";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import { Package } from "lucide-react";

export default function StockUpdateModal({
  isOpen,
  onClose,
  material,
  operation,
  onUpdate,
}) {
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || parseFloat(quantity) <= 0) return;

    setLoading(true);
    try {
      await onUpdate(material.id, parseFloat(quantity), operation);
      setQuantity("");
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={operation === "add" ? "Add Stock" : "Deduct Stock"}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Material Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Package className="text-primary-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{material?.name}</h3>
              <p className="text-sm text-gray-500">
                Current: {material?.stock_quantity} {material?.unit}
              </p>
            </div>
          </div>
        </div>

        {/* Quantity Input */}
        <Input
          label={`Quantity to ${operation === "add" ? "Add" : "Deduct"} (${material?.unit})`}
          type="number"
          step="0.01"
          placeholder="0.00"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        {/* Preview */}
        {quantity && parseFloat(quantity) > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-medium">New stock level:</span>{" "}
              <span className="text-lg font-bold">
                {newQuantity.toFixed(2)} {material?.unit}
              </span>
            </p>
          </div>
        )}

        {/* Warning for deduction */}
        {operation === "subtract" && quantity && newQuantity < 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ Warning: Stock will go negative!
            </p>
          </div>
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
            loading={loading}
            disabled={!quantity || parseFloat(quantity) <= 0}
          >
            {operation === "add" ? "Add Stock" : "Deduct Stock"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
