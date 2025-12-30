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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import MaterialSelector from "./MaterialSelector";
import AddCustomerForm from "../customers/AddCustomerForm";
import { supabase } from "../../lib/supabase";
import { useFinancialStore } from "../../store/useFinancialStore";
import { productService } from "../../services/productService";
import toast from "react-hot-toast";

export default function CreateOrderForm({ order, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [orderType, setOrderType] = useState("custom");
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

  const [quantity, setQuantity] = useState(order?.quantity || 1);

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
      order_type: "custom",
      product_id: "",
      quantity: 1,
    },
  });

  useEffect(() => {
    fetchCustomers();
    fetchEmployees();
    fetchGarmentTypes();
    fetchFinancialSettings();
    fetchProducts();
  }, [fetchGarmentTypes, fetchFinancialSettings]);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    if (order) {
      reset(order);
      setOrderType(order.order_type || "custom");
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

    // Apply profit margin (Markup) to calculate suggested selling price
    // Formula: Selling Price = Cost * (1 + Margin%)
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

  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setValue("product_id", productId);
      setValue("description", product.name + (product.description ? ` - ${product.description}` : ""));

      const price = parseFloat(product.base_price || 0);
      setValue("total_cost", price.toFixed(2), { shouldValidate: true, shouldDirty: true });
    }
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
        order_type: orderType,
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
      {/* Order Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scissors size={18} className="text-primary" />
            Order Type
            <Tooltip>
              <TooltipTrigger asChild>
                <Info size={14} className="text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-1">Choose Order Type:</p>
                <p className="text-xs"><strong>Custom:</strong> Made-to-measure garment with material selection</p>
                <p className="text-xs mt-1"><strong>Pre-designed:</strong> Ready-made garment from finished goods inventory</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            defaultValue="custom"
            value={orderType}
            onValueChange={(val) => {
              setOrderType(val);
              setValue("order_type", val);
            }}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom" className="cursor-pointer">Custom Order (Tailor Made)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="standard" id="standard" />
              <Label htmlFor="standard" className="cursor-pointer">Pre-designed Garment</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Product Selection (Standard Only) */}
      {orderType === "standard" && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <Label className="mb-2 block">Select Garment / Product</Label>
          <Select onValueChange={handleProductChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a predesigned garment..." />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} - K{parseFloat(product.base_price).toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" {...register("product_id")} />
        </div>
      )}

      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User size={18} className="text-primary" />
            Customer Information
            <Tooltip>
              <TooltipTrigger asChild>
                <Info size={14} className="text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                Select an existing customer or add a new one
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Garment Details - Only for Custom Orders */}
      {orderType === "custom" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Scissors size={18} className="text-primary" />
              Garment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
            <div>
              <Label className="mb-3 flex items-center gap-2 text-base font-semibold">
                <Package size={18} className="text-primary" />
                Materials Selection
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={14} className="text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Select fabrics and accessories needed for this garment
                  </TooltipContent>
                </Tooltip>
              </Label>
              <MaterialSelector
                selectedMaterials={selectedMaterials}
                onChange={handleMaterialsChange}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quantity & Pricing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package size={20} className="text-primary" />
            Order Quantity & Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Quantity Input */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <Label className="mb-2 flex items-center gap-2 font-semibold">
              <Package size={16} className="text-primary" />
              Quantity
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} className="text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  Number of units for this order (for bulk orders)
                </TooltipContent>
              </Tooltip>
            </Label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                const newQty = parseInt(e.target.value) || 1;
                setQuantity(newQty);
                // Recalculate pricing with new quantity
                recalculatePricing(costs.material / (order?.quantity || 1) * newQty, costs.labour / (order?.quantity || 1) * newQty, costs.overhead / (order?.quantity || 1) * newQty);
              }}
              className="max-w-[150px] text-lg font-semibold"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {quantity > 1 ? `Bulk order: ${quantity} units` : 'Single unit order'}
            </p>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={18} className="text-slate-600" />
              <h3 className="font-semibold text-slate-900">Cost Breakdown</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} className="text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="font-semibold mb-1">Production Costs:</p>
                  <p className="text-xs">• Materials: Fabrics & accessories</p>
                  <p className="text-xs">• Labour: Tailor's time</p>
                  <p className="text-xs">• Overhead: Business expenses</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-200">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Materials</span>
                <span className="font-semibold text-slate-900">
                  K{costs.material.toFixed(2)}
                  {quantity > 1 && <span className="text-xs text-slate-500 ml-1">(K{(costs.material / quantity).toFixed(2)} × {quantity})</span>}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Labour</span>
                <span className="font-semibold text-slate-900">
                  K{costs.labour.toFixed(2)}
                  {quantity > 1 && <span className="text-xs text-slate-500 ml-1">(K{(costs.labour / quantity).toFixed(2)} × {quantity})</span>}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Overhead</span>
                <span className="font-semibold text-slate-900">
                  K{costs.overhead.toFixed(2)}
                  {quantity > 1 && <span className="text-xs text-slate-500 ml-1">(K{(costs.overhead / quantity).toFixed(2)} × {quantity})</span>}
                </span>
              </div>
              <div className="pt-2 mt-2 border-t border-slate-300">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900">Total Cost</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info size={12} className="inline-block ml-1 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Break-even point (no profit)
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-lg font-bold text-slate-900">K{costs.total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Break-even point (no profit)</p>
              </div>
            </div>
          </div>

          {/* SELLING PRICE - Most Prominent */}
          <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/30">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign size={24} className="text-primary" />
                <h3 className="text-lg font-bold text-primary uppercase tracking-wide">Selling Price</h3>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="text-center text-3xl font-bold h-16 border-2 border-primary/50 focus:border-primary"
                  {...register("total_cost", {
                    required: "Selling price is required",
                    min: {
                      value: costs.total,
                      message: `Must be at least K${costs.total.toFixed(2)} (total costs)`,
                    },
                  })}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary">K</span>
              </div>
              {errors.total_cost && (
                <p className="text-sm text-red-600 font-semibold">
                  {errors.total_cost.message}
                </p>
              )}
              <p className="text-sm text-slate-600 font-medium">
                Total amount to charge customer
              </p>

            </div>
          </div>

          {/* Profit Analysis - Subtle */}
          {costs.total > 0 && totalCost > 0 && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-slate-700">📊 Profit Analysis</span>
              </div>
              {(() => {
                const revenue = parseFloat(totalCost || 0);
                const totalCosts = costs.total;
                const profit = revenue - totalCosts;
                // Use Markup formula: (Profit / Cost) * 100
                const markupPercentage = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;
                const isLoss = profit < 0;
                const isLowMarkup = markupPercentage < 20 && markupPercentage >= 0;

                return (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Profit Amount</span>
                      <span className={`font-bold ${isLoss ? 'text-red-600' : 'text-green-600'}`}>
                        K{Math.abs(profit).toFixed(2)}
                        {isLoss && <span className="text-xs ml-1">(LOSS)</span>}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Markup (Profit %)</span>
                      <span className={`font-bold ${isLoss ? 'text-red-600' : isLowMarkup ? 'text-yellow-600' : 'text-green-600'}`}>
                        {markupPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      {isLoss ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50 px-3 py-2 rounded">
                          <span>⚠️</span>
                          <span>Warning: Selling below cost (losing money)</span>
                        </div>
                      ) : isLowMarkup ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-yellow-700 bg-yellow-50 px-3 py-2 rounded">
                          <span>⚡</span>
                          <span>Low markup (below 20%)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 px-3 py-2 rounded">
                          <span>✅</span>
                          <span>Healthy profit margin</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Deposit & Balance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div>
              <Label className="mb-2 block font-semibold">Deposit (K)</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-8"
                  {...register("deposit", {
                    min: { value: 0, message: "Must be 0 or greater" },
                  })}
                />
                <DollarSign
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
              </div>
              {errors.deposit && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.deposit.message}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-1">Initial payment from customer</p>
            </div>

            <div>
              <Label className="mb-2 block font-semibold">Balance Due (K)</Label>
              <div
                className={`h-10 px-3 py-2 rounded-md border border-input bg-slate-100 font-bold flex items-center ${balance > 0 ? "text-orange-600" : "text-green-600"
                  }`}
              >
                {balance.toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Remaining amount to collect</p>
            </div>
          </div>

        </CardContent>
      </Card>



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

