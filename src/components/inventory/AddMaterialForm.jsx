import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../common/Input";
import Button from "../common/Button";
import { Package, DollarSign, Layers, User } from "lucide-react";

const CATEGORIES = [
  "fabric",
  "thread",
  "buttons",
  "zippers",
  "lace",
  "elastic",
  "interfacing",
  "trim",
  "accessories",
  "other",
];

const UNITS = ["meters", "yards", "pieces", "rolls", "spools", "kg", "grams"];

export default function AddMaterialForm({ material, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: material || {
      name: "",
      category: "fabric",
      unit: "meters",
      stock_quantity: 0,
      min_stock_level: 0,
      cost_per_unit: 0,
      supplier: "",
      description: "",
    },
  });

  useEffect(() => {
    if (material) {
      reset(material);
    }
  }, [material, reset]);

  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      await onSubmit(data);
      if (!material) {
        reset();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Material Name */}
        <div className="md:col-span-2">
          <Input
            label="Material Name"
            placeholder="e.g., Silk Fabric - Red"
            icon={Package}
            error={errors.name?.message}
            {...register("name", { required: "Material name is required" })}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            className="input-field"
            {...register("category", { required: "Category is required" })}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit of Measurement
          </label>
          <select
            className="input-field"
            {...register("unit", { required: "Unit is required" })}
          >
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit.charAt(0).toUpperCase() + unit.slice(1)}
              </option>
            ))}
          </select>
          {errors.unit && (
            <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
          )}
        </div>

        {/* Stock Quantity */}
        <div>
          <Input
            label="Current Stock Quantity"
            type="number"
            step="0.01"
            placeholder="0.00"
            icon={Layers}
            error={errors.stock_quantity?.message}
            {...register("stock_quantity", {
              required: "Stock quantity is required",
              min: { value: 0, message: "Must be 0 or greater" },
            })}
          />
        </div>

        {/* Minimum Stock Level */}
        <div>
          <Input
            label="Minimum Stock Level"
            type="number"
            step="0.01"
            placeholder="0.00"
            icon={Layers}
            error={errors.min_stock_level?.message}
            {...register("min_stock_level", {
              required: "Minimum stock level is required",
              min: { value: 0, message: "Must be 0 or greater" },
            })}
          />
        </div>

        {/* Cost per Unit */}
        <div>
          <Input
            label="Cost per Unit (K)"
            type="number"
            step="0.01"
            placeholder="0.00"
            icon={DollarSign}
            error={errors.cost_per_unit?.message}
            {...register("cost_per_unit", {
              required: "Cost per unit is required",
              min: { value: 0, message: "Must be 0 or greater" },
            })}
          />
        </div>

        {/* Supplier */}
        <div>
          <Input
            label="Supplier (Optional)"
            placeholder="e.g., ABC Textiles"
            icon={User}
            {...register("supplier")}
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            rows={3}
            className="input-field resize-none"
            placeholder="Add any additional notes about this material..."
            {...register("description")}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {material ? "Update Material" : "Add Material"}
        </Button>
      </div>
    </form>
  );
}
