import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Package, DollarSign, Layers, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    control,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {/* Material Name */}
        <div className="md:col-span-2 space-y-2">
            <Label htmlFor="name">Material Name</Label>
            <div className="relative">
                <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    id="name"
                    placeholder="e.g., Silk Fabric - Red"
                    className={`pl-9 ${errors.name ? "border-destructive" : ""}`}
                    {...register("name", { required: "Material name is required" })}
                />
            </div>
            {errors.name && (<p className="text-sm text-destructive">{errors.name.message}</p>)}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Controller
             control={control}
             name="category"
             rules={{ required: "Category is required" }}
             render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             )}
          />
          {errors.category && (<p className="text-sm text-destructive">{errors.category.message}</p>)}
        </div>

        {/* Unit */}
        <div className="space-y-2">
          <Label>Unit of Measurement</Label>
          <Controller
             control={control}
             name="unit"
             rules={{ required: "Unit is required" }}
             render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                        {UNITS.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                                {unit.charAt(0).toUpperCase() + unit.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             )}
          />
           {errors.unit && (<p className="text-sm text-destructive">{errors.unit.message}</p>)}
        </div>

        {/* Stock Quantity */}
        <div className="space-y-2">
            <Label htmlFor="stock_quantity">Current Stock Quantity</Label>
            <div className="relative">
                <Layers className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    id="stock_quantity"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`pl-9 ${errors.stock_quantity ? "border-destructive" : ""}`}
                    {...register("stock_quantity", {
                        required: "Stock quantity is required",
                        min: { value: 0, message: "Must be 0 or greater" },
                    })}
                />
            </div>
             {errors.stock_quantity && (<p className="text-sm text-destructive">{errors.stock_quantity.message}</p>)}
        </div>

        {/* Minimum Stock Level */}
        <div className="space-y-2">
            <Label htmlFor="min_stock_level">Minimum Stock Level</Label>
            <div className="relative">
                <Layers className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    id="min_stock_level"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`pl-9 ${errors.min_stock_level ? "border-destructive" : ""}`}
                    {...register("min_stock_level", {
                        required: "Minimum stock level is required",
                        min: { value: 0, message: "Must be 0 or greater" },
                    })}
                />
            </div>
             {errors.min_stock_level && (<p className="text-sm text-destructive">{errors.min_stock_level.message}</p>)}
        </div>

        {/* Cost per Unit */}
        <div className="space-y-2">
            <Label htmlFor="cost_per_unit">Cost per Unit (K)</Label>
            <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    id="cost_per_unit"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`pl-9 ${errors.cost_per_unit ? "border-destructive" : ""}`}
                    {...register("cost_per_unit", {
                        required: "Cost per unit is required",
                        min: { value: 0, message: "Must be 0 or greater" },
                    })}
                />
            </div>
             {errors.cost_per_unit && (<p className="text-sm text-destructive">{errors.cost_per_unit.message}</p>)}
        </div>

        {/* Supplier */}
        <div className="space-y-2">
            <Label htmlFor="supplier">Supplier (Optional)</Label>
            <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    id="supplier"
                    placeholder="e.g., ABC Textiles"
                    className="pl-9"
                    {...register("supplier")}
                />
            </div>
        </div>

        {/* Description */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            rows={3}
            placeholder="Add any additional notes about this material..."
            className="resize-none"
            {...register("description")}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {material ? "Update Material" : "Add Material"}
        </Button>
      </div>
    </form>
  );
}

