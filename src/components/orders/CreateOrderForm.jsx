import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import {
  User,
  Calendar,
  DollarSign,
  FileText,
  Scissors,
  Package,
  Wrench,
  Building2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import MaterialSelector from "./MaterialSelector";
import AddCustomerForm from "../customers/AddCustomerForm";
import { supabase } from "../../lib/supabase";
import { useFinancialStore } from "../../store/useFinancialStore";
import toast from "react-hot-toast";

export default function CreateOrderForm({ order, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const { 
    garmentTypes, 
    fetchGarmentTypes, 
    financialSettings, 
    fetchFinancialSettings 
  } = useFinancialStore();

  const [costs, setCosts] = useState({
    material: 0,
    labour: 0,
    overhead: 0,
    total: 0,
    tax: 0,
    recommendedPrice: 0
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: order || {
      customer_id: "",
      garment_type_id: "",
      due_date: "",
      total_cost: 0,
      deposit: 0,
      description: "",
      notes: "",
      assigned_tailor_id: "",
    },
  });

  useEffect(() => {
    fetchCustomers();
    fetchEmployees();
    fetchGarmentTypes();
    fetchFinancialSettings();
  }, [fetchGarmentTypes, fetchFinancialSettings]);

  useEffect(() => {
    if (order) {
      reset(order);
      setCosts({
        material: order.material_cost || 0,
        labour: order.labour_cost || 0,
        overhead: order.overhead_cost || 0,
        total:
          (order.material_cost || 0) +
          (order.labour_cost || 0) +
          (order.overhead_cost || 0),
      });
    }
  }, [order, reset]);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, phone, email")
      .order("name");

    if (!error) {
      setCustomers(data || []);
    }
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("id, name, role")
      .eq("active", true)
      .in("role", ["tailor", "designer"])
      .order("name");

    if (!error) {
      setEmployees(data || []);
    }
  };

  const handleAddNewCustomer = async (customerData) => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .insert([customerData])
        .select()
        .single();

      if (error) throw error;

      toast.success("Customer added successfully!");
      setCustomers((prev) => [data, ...prev]);
      setValue("customer_id", data.id);
      setShowAddCustomerDialog(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add customer");
    }
  };

  // Centralized Pricing Logic
  const recalculatePricing = (materialCost, labourCost, overheadCost) => {
    const settings = financialSettings;
    const baseTotal = materialCost + labourCost + overheadCost;
    
    const defaultMargin = parseFloat(settings?.default_profit_margin || 0);
    const taxRate = parseFloat(settings?.tax_rate || 0);
    
    // Apply profit margin to calculate suggested selling price
    const suggestedPrice = baseTotal * (1 + defaultMargin / 100);
    
    // Apply tax if applicable
    const finalPrice = suggestedPrice * (1 + taxRate / 100);
    
    // Auto-update selling price for new orders or if currently 0
    const currentSellingPrice = watch("total_cost");
    if (!order || currentSellingPrice === 0 || currentSellingPrice === "0.00") {
      setValue("total_cost", finalPrice.toFixed(2));
    }
    
    setCosts({
      material: materialCost,
      labour: labourCost,
      overhead: overheadCost,
      total: baseTotal,
      tax: finalPrice - suggestedPrice,
      recommendedPrice: finalPrice
    });
  };

  // Handle garment type change
  const handleGarmentTypeChange = async (garmentTypeId) => {
    if (!garmentTypeId) return;

    setValue("garment_type_id", garmentTypeId);

    const selectedType = garmentTypes.find((g) => g.id === garmentTypeId);
    if (selectedType) {
      try {
        const settings = financialSettings || await financeService.getFinancialSettings();
        const customHourlyRate = parseFloat(settings?.custom_hourly_rate || 0);
        const estimatedHours = parseFloat(selectedType.estimated_hours || 0);
        
        // Calculate labour cost: use hourly rate if hours are set, otherwise use base labour cost
        const labourCost = estimatedHours > 0 && customHourlyRate > 0 
          ? estimatedHours * customHourlyRate 
          : parseFloat(selectedType.base_labour_cost || 0);

        // Calculate overhead
        const currentMonth = new Date();
        const monthStart = format(
          new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
          "yyyy-MM-dd"
        );
        const monthEnd = format(
          new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
          "yyyy-MM-dd"
        );

        const { data: overheadData } = await supabase
          .from("overhead_costs")
          .select("amount")
          .gte("month", monthStart)
          .lte("month", monthEnd);

        const totalOverhead = overheadData?.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0) || 0;
        const expectedOrders = settings?.expected_monthly_orders || 40;
        const overheadPerOrder = expectedOrders > 0 ? totalOverhead / expectedOrders : 0;

        recalculatePricing(costs.material, labourCost, overheadPerOrder);

        if (overheadPerOrder > 0) {
          toast.success("Labour and overhead costs updated based on settings.");
        }
      } catch (error) {
        console.error("Error calculating costs:", error);
      }
    }
  };

  // Handle materials change
  const handleMaterialsChange = (materials) => {
    setSelectedMaterials(materials);
    const materialCost = materials.reduce(
      (sum, m) => sum + parseFloat(m.cost || 0),
      0
    );

    recalculatePricing(materialCost, costs.labour, costs.overhead);
  };

  // Watch for total cost and deposit changes
  const totalCost = watch("total_cost") || 0;
  const deposit = watch("deposit") || 0;
  const balance = parseFloat(totalCost) - parseFloat(deposit);

  const watchGarmentType = watch("garment_type_id");
  const watchCustomer = watch("customer_id");
  const watchTailor = watch("assigned_tailor_id");

  const handleFormSubmit = async (data) => {
    if (selectedMaterials.length === 0) {
      toast.error("Please add at least one material");
      return;
    }

    if (!data.garment_type_id) {
      toast.error("Please select a garment type");
      return;
    }

    setLoading(true);
    try {
      // Calculate profit margin
      const sellingPrice = parseFloat(data.total_cost || 0);
      const totalCosts = costs.total;
      const profit = sellingPrice - totalCosts;
      const profitMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

      const orderData = {
        ...data,
        materials: selectedMaterials,
        labour_cost: costs.labour,
        overhead_cost: costs.overhead,
        material_cost: costs.material,
        profit_margin: parseFloat(profitMargin.toFixed(2)),
      };
      await onSubmit(orderData);
      if (!order) {
        reset();
        setSelectedMaterials([]);
        setCosts({ material: 0, labour: 0, overhead: 0, total: 0 });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Customer Selection */}
      <div>
        <Label className="mb-2 block">Customer</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Select
              value={watchCustomer}
              onValueChange={(value) => setValue("customer_id", value)}
            >
              <SelectTrigger className="pl-10">
                 <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-600 z-10"
                  size={16}
                />
                <SelectValue placeholder="Select customer..." />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="hidden"
              {...register("customer_id", { required: "Customer is required" })}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowAddCustomerDialog(true)}
            title="Add New Customer"
          >
            <Plus size={16} />
          </Button>
        </div>
        {errors.customer_id && (
          <p className="mt-1 text-sm text-red-600">
            {errors.customer_id.message}
          </p>
        )}

        <Dialog open={showAddCustomerDialog} onOpenChange={setShowAddCustomerDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <AddCustomerForm
              onSubmit={handleAddNewCustomer}
              onCancel={() => setShowAddCustomerDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Garment Type Selection */}
      <div>
        <Label className="mb-2 flex items-center gap-2">
          <Scissors size={16} />
          Garment Type
        </Label>
        <Select
          value={watchGarmentType}
          onValueChange={handleGarmentTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select garment type..." />
          </SelectTrigger>
          <SelectContent>
            {garmentTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name} - K{parseFloat(type.base_labour_cost).toFixed(2)}{" "}
                labour
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          type="hidden"
          {...register("garment_type_id", {
            required: "Garment type is required",
          })}
        />
        {errors.garment_type_id && (
          <p className="mt-1 text-sm text-red-600">
            {errors.garment_type_id.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Labour cost will be automatically set based on garment type
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Due Date */}
        <div>
          <Label className="mb-2 block">Due Date</Label>
          <div className="relative">
            <Input
              type="date"
              className="pl-10"
              {...register("due_date", { required: "Due date is required" })}
            />
             <Calendar
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
          </div>
           {errors.due_date && (
            <p className="mt-1 text-sm text-red-600">
              {errors.due_date.message}
            </p>
          )}
        </div>

        {/* Assigned Tailor */}
        <div>
          <Label className="mb-2 flex items-center gap-2">
            Assign to Tailor (Optional)
          </Label>
          <div className="relative">
             <Select
              value={watchTailor}
              onValueChange={(value) => setValue("assigned_tailor_id", value)}
            >
              <SelectTrigger className="pl-10">
                 <Scissors
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-600 z-10"
                  size={16}
                />
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name} ({employee.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
             <input type="hidden" {...register("assigned_tailor_id")} />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <Label className="mb-2 flex items-center gap-2">
          <FileText size={16} />
          Order Description
        </Label>
        <Textarea
          rows={4}
          className="resize-none"
          placeholder="Describe the garment(s) to be made, style, color, special requirements, etc."
          {...register("description", { required: "Description is required" })}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Materials Section */}
      <MaterialSelector
        selectedMaterials={selectedMaterials}
        onChange={handleMaterialsChange}
      />

      {/* Cost Breakdown Section */}
      <div className="border-t border-border pt-6">
        <h3 className="font-semibold text-foreground mb-4">Cost Breakdown</h3>

        {/* Material Cost (Auto-calculated) */}
        <div className="mb-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Material Cost
              </span>
            </div>
            <span className="text-lg font-bold text-foreground">
              K{costs.material.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Auto-calculated from materials
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Labour Cost */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wrench size={18} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  Labour Cost
                </span>
              </div>
              <span className="text-lg font-bold text-purple-900">
                K{costs.labour.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-purple-700">Set by garment type</p>
          </div>

          {/* Overhead Cost */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Overhead Cost
                </span>
              </div>
              <span className="text-lg font-bold text-blue-900">
                K{costs.overhead.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-blue-700">Auto-calculated per order</p>
          </div>
        </div>

        {/* Cost Summary Card */}
        <div className="mt-4 p-4 bg-gradient-to-br from-primary/10 to-purple-50 rounded-lg border border-primary/20">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Materials:</span>
              <span className="font-semibold text-foreground">
                K{costs.material.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Labour:</span>
              <span className="font-semibold text-foreground">
                K{costs.labour.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overhead:</span>
              <span className="font-semibold text-foreground">
                K{costs.overhead.toFixed(2)}
              </span>
            </div>
            {costs.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-semibold text-foreground">
                  K{costs.tax.toFixed(2)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-primary/20">
              <div className="flex justify-between">
                <span className="font-bold text-foreground">Recommended Price:</span>
                <span className="text-xl font-bold text-primary">
                  K{parseFloat(watch("total_cost") || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="border-t border-border pt-6">
        <h3 className="font-semibold text-foreground mb-4">Final Pricing</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Cost */}
          <div>
            <Label className="mb-2 block">Selling Price (K)</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-10"
                {...register("total_cost", {
                  required: "Selling price is required",
                  min: {
                    value: costs.total,
                    message: `Must be at least K${costs.total.toFixed(2)} (total costs)`,
                  },
                })}
              />
              <DollarSign
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
            </div>
            {errors.total_cost && (
              <p className="mt-1 text-sm text-red-600">
                {errors.total_cost.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Set your selling price (minimum: K{costs.total.toFixed(2)})
            </p>
          </div>

          {/* Deposit */}
          <div>
            <Label className="mb-2 block">Deposit (K)</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-10"
                {...register("deposit", {
                  min: { value: 0, message: "Must be 0 or greater" },
                })}
              />
                <DollarSign
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
            </div>
            {errors.deposit && (
              <p className="mt-1 text-sm text-red-600">
                {errors.deposit.message}
              </p>
            )}
          </div>

          {/* Balance (Calculated) */}
          <div>
            <Label className="mb-2 block">Balance Due (K)</Label>
            <div
              className={`h-10 px-3 py-2 rounded-md border border-input bg-muted/50 font-bold flex items-center ${
                balance > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {balance.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Profit Margin Preview - Enhanced with Visual Indicators */}
        {costs.total > 0 && (
          <div className={`mt-4 p-4 rounded-lg border-2 transition-all ${
            (() => {
              const revenue = parseFloat(totalCost || 0);
              const totalCosts = costs.total;
              const profit = revenue - totalCosts;
              const profitPercentage = revenue > 0 ? (profit / revenue) * 100 : 0;
              
              if (profit < 0) return "bg-red-50 border-red-300";
              if (profitPercentage < 20) return "bg-yellow-50 border-yellow-300";
              return "bg-green-50 border-green-300";
            })()
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm font-semibold mb-1 ${
                  (() => {
                    const revenue = parseFloat(totalCost || 0);
                    const totalCosts = costs.total;
                    const profit = revenue - totalCosts;
                    
                    if (profit < 0) return "text-red-800";
                    if (((profit / revenue) * 100) < 20) return "text-yellow-800";
                    return "text-green-800";
                  })()
                }`}>
                  💰 Expected Profit
                </p>
                <p className="text-xs text-muted-foreground">
                  Selling Price - Total Costs
                </p>
              </div>
              <div className="text-right">
                {(() => {
                  const revenue = parseFloat(totalCost || 0);
                  const totalCosts = costs.total;
                  const profit = revenue - totalCosts;
                  const profitPercentage =
                    revenue > 0 ? (profit / revenue) * 100 : 0;

                  return (
                    <>
                      <p
                        className={`text-3xl font-bold mb-1 ${
                          profit > 0
                            ? "text-green-600"
                            : profit < 0
                              ? "text-red-600"
                              : "text-gray-500"
                        }`}
                      >
                        K{Math.abs(profit).toFixed(2)}
                        {profit < 0 && <span className="text-sm ml-1">LOSS</span>}
                      </p>
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            profit > 0
                              ? profitPercentage >= 20
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                              : profit < 0
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {profitPercentage.toFixed(1)}% margin
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
            
            {/* Warnings and Recommendations */}
            {(() => {
              const revenue = parseFloat(totalCost || 0);
              const totalCosts = costs.total;
              const profit = revenue - totalCosts;
              const profitPercentage = revenue > 0 ? (profit / revenue) * 100 : 0;
              
              if (profit < 0) {
                return (
                  <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded">
                    <p className="text-sm font-semibold text-red-900 flex items-center gap-2">
                      ⚠️ Pricing Below Cost!
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Minimum recommended price: K{(costs.total * 1.2).toFixed(2)} (20% margin)
                    </p>
                  </div>
                );
              }
              
              if (profitPercentage < 20) {
                return (
                  <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
                    <p className="text-sm font-semibold text-yellow-900 flex items-center gap-2">
                      ⚡ Low Profit Margin
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Consider pricing at K{(costs.total * 1.2).toFixed(2)} for a healthier 20% margin
                    </p>
                  </div>
                );
              }
              
              return (
                <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded">
                  <p className="text-sm font-semibold text-green-900 flex items-center gap-2">
                    ✅ Healthy Profit Margin!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Your pricing ensures good profitability
                  </p>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <Label className="mb-2 block">Additional Notes (Optional)</Label>
        <Textarea
          rows={3}
          className="resize-none"
          placeholder="Any additional information, special instructions, or reminders..."
          {...register("notes")}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-border">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
            {loading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
          {order ? "Update Order" : "Create Order"}
        </Button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Smart Pricing:</strong> Labour and overhead costs are
          automatically calculated based on garment type and monthly expenses.
          You can adjust the final selling price as needed.
        </p>
      </div>
    </form>
  );
}

