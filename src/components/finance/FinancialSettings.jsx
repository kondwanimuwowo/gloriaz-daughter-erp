import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Settings, DollarSign, TrendingUp, Package } from "lucide-react";
import { useFinancialStore } from "../../store/useFinancialStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function FinancialSettings({ onClose }) {
  const { financialSettings, fetchFinancialSettings, updateFinancialSettings } =
    useFinancialStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    fetchFinancialSettings();
  }, [fetchFinancialSettings]);

  useEffect(() => {
    if (financialSettings) {
      reset(financialSettings);
    }
  }, [financialSettings, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await updateFinancialSettings(data);
      onClose();
    } catch (error) {
      console.error("Error updating settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Settings className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Financial Configuration</AlertTitle>
        <AlertDescription className="text-blue-700">
          These settings affect financial calculations across the system.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="custom_hourly_rate">Custom Hourly Labour Rate (K)</Label>
        <div className="relative">
            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
            id="custom_hourly_rate"
            type="number"
            step="0.01"
            className="pl-9"
            {...register("custom_hourly_rate", {
                required: "Rate is required",
                min: { value: 0, message: "Must be positive" },
            })}
            />
        </div>
        {errors.custom_hourly_rate ? (
            <span className="text-sm text-red-500">{errors.custom_hourly_rate.message}</span>
        ) : (
            <p className="text-xs text-muted-foreground">Used for custom/hourly labour calculations</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="default_profit_margin">Default Profit Margin (%)</Label>
        <div className="relative">
            <TrendingUp className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
            id="default_profit_margin"
            type="number"
            step="0.01"
            className="pl-9"
            {...register("default_profit_margin", {
                required: "Margin is required",
                min: { value: 0, message: "Must be 0 or greater" },
                max: { value: 100, message: "Cannot exceed 100%" },
            })}
            />
        </div>
        {errors.default_profit_margin ? (
            <span className="text-sm text-red-500">{errors.default_profit_margin.message}</span>
        ) : (
            <p className="text-xs text-muted-foreground">Suggested profit margin for pricing</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="expected_monthly_orders">Expected Monthly Orders</Label>
        <div className="relative">
            <Package className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
            id="expected_monthly_orders"
            type="number"
            className="pl-9"
            {...register("expected_monthly_orders", {
                required: "Required",
                min: { value: 1, message: "Must be at least 1" },
            })}
            />
        </div>
        {errors.expected_monthly_orders ? (
            <span className="text-sm text-red-500">{errors.expected_monthly_orders.message}</span>
        ) : (
            <p className="text-xs text-muted-foreground">Used to calculate overhead per order</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tax_rate">Tax Rate (%)</Label>
        <div className="relative">
            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
            id="tax_rate"
            type="number"
            step="0.01"
            className="pl-9"
            {...register("tax_rate", {
                min: { value: 0, message: "Must be 0 or greater" },
                max: { value: 100, message: "Cannot exceed 100%" },
            })}
            />
        </div>
        {errors.tax_rate ? (
            <span className="text-sm text-red-500">{errors.tax_rate.message}</span>
        ) : (
            <p className="text-xs text-muted-foreground">Applied tax rate (if applicable)</p>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}

