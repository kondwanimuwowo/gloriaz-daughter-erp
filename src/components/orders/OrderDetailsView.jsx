import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Package,
  Scissors,
  FileText,
  Edit,
  ArrowRight,
  Printer,
  Info,
  TrendingUp,
  Calculator,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderTimeline from "./OrderTimeline";

const STATUS_FLOW = [
  "enquiry",
  "contacted",
  "measurements",
  "production",
  "fitting",
  "completed",
  "delivered",
];

export default function OrderDetailsView({ order, onEdit, onStatusChange }) {
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusNotes, setStatusNotes] = useState("");

  const getNextStatus = () => {
    const currentIndex = STATUS_FLOW.indexOf(order.status);
    return currentIndex < STATUS_FLOW.length - 1
      ? STATUS_FLOW[currentIndex + 1]
      : null;
  };

  const handleStatusChange = async () => {
    const nextStatus = getNextStatus();
    if (!nextStatus) return;

    setChangingStatus(true);
    try {
      await onStatusChange(order.id, nextStatus, statusNotes);
      setStatusNotes("");
    } catch (error) {
      console.error(error);
    } finally {
      setChangingStatus(false);
    }
  };

  const nextStatus = getNextStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {order.order_number}
          </h2>
          <p className="text-muted-foreground">
            Created on {format(new Date(order.order_date), "MMMM dd, yyyy")}
          </p>
        </div>
        <div className="flex gap-3">
          <OrderStatusBadge status={order.status} />
          <Button variant="secondary" onClick={() => onEdit(order)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Order
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="print:hidden">
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold text-foreground">
                  {order.customers?.name || "N/A"}
                </p>
              </div>
              {order.customers?.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-muted-foreground" />
                  <p className="text-foreground">{order.customers.phone}</p>
                </div>
              )}
              {order.customers?.email && (
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-muted-foreground" />
                  <p className="text-foreground">{order.customers.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-foreground">
                  {order.description || "No description provided"}
                </p>
              </div>

              {order.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-muted-foreground text-sm">{order.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <p className="font-semibold text-foreground">
                      {order.due_date
                        ? format(new Date(order.due_date), "MMM dd, yyyy")
                        : "Not set"}
                    </p>
                  </div>
                </div>

                {order.employees && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Assigned Tailor
                    </p>
                    <div className="flex items-center gap-2">
                      <Scissors size={16} className="text-muted-foreground" />
                      <p className="font-semibold text-foreground">
                        {order.employees.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Materials Used */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Materials Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.materials && order.materials.length > 0 ? (
                <div className="space-y-3">
                  {order.materials.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {item.materials?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {parseFloat(item.quantity_used).toFixed(2)}{" "}
                          {item.materials?.unit}
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">
                        K{parseFloat(item.cost).toFixed(2)}
                      </p>
                    </motion.div>
                  ))}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="font-semibold text-foreground">
                      Total Material Cost
                    </span>
                    <span className="text-lg font-bold text-primary">
                      K
                      {order.materials
                        .reduce((sum, m) => sum + parseFloat(m.cost), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No materials recorded
                </p>
              )}
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Pricing & Profitability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TooltipProvider>
                {/* Cost Breakdown with Icons and Tooltips */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-5 border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Package size={16} className="text-slate-600" />
                    Production Cost Breakdown
                  </h4>
                  <div className="space-y-3">
                    {/* Material Cost */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">Material Cost</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info size={14} className="text-slate-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p className="font-semibold mb-1">What is Material Cost?</p>
                            <p className="text-xs">This is the total cost of all fabrics, threads, buttons, zippers, and other materials used to make this garment.</p>
                            <p className="text-xs mt-2 text-muted-foreground">Calculated from the materials list below.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <span className="font-semibold text-slate-900">
                        K{parseFloat(order.material_cost || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Labour Cost */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">Labour Cost</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info size={14} className="text-slate-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p className="font-semibold mb-1">How is Labour Cost Calculated?</p>
                            <p className="text-xs">This is the cost of the tailor's time to make this garment.</p>
                            <p className="text-xs mt-2 font-mono bg-slate-100 p-2 rounded">
                              Labour Cost = Employee Hourly Rate × Hours Worked
                            </p>
                            <p className="text-xs mt-2 text-muted-foreground">Based on the assigned tailor's rate and estimated production time.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <span className="font-semibold text-slate-900">
                        K{parseFloat(order.labour_cost || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Overhead Cost */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">Overhead Cost</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info size={14} className="text-slate-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p className="font-semibold mb-1">How is Overhead Cost Calculated?</p>
                            <p className="text-xs">This covers rent, electricity, equipment, and other business expenses.</p>
                            <p className="text-xs mt-2 font-mono bg-slate-100 p-2 rounded">
                              Overhead per Order = Monthly Overhead ÷ Expected Monthly Orders
                            </p>
                            <p className="text-xs mt-2 text-muted-foreground">This ensures each order contributes to covering our fixed business costs.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <span className="font-semibold text-slate-900">
                        K{parseFloat(order.overhead_cost || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Cost Composition Progress Bar */}
                    {(() => {
                      const materialCost = parseFloat(order.material_cost || 0);
                      const labourCost = parseFloat(order.labour_cost || 0);
                      const overheadCost = parseFloat(order.overhead_cost || 0);
                      const totalCosts = materialCost + labourCost + overheadCost;

                      const materialPercent = totalCosts > 0 ? (materialCost / totalCosts) * 100 : 0;
                      const labourPercent = totalCosts > 0 ? (labourCost / totalCosts) * 100 : 0;
                      const overheadPercent = totalCosts > 0 ? (overheadCost / totalCosts) * 100 : 0;

                      return (
                        <div className="pt-3 mt-3 border-t border-slate-300">
                          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                            <span>Cost Composition</span>
                            <span className="font-medium">100%</span>
                          </div>
                          <div className="h-3 bg-slate-200 rounded-full overflow-hidden flex">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="bg-blue-500 hover:bg-blue-600 transition-colors cursor-help"
                                  style={{ width: `${materialPercent}%` }}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Materials: {materialPercent.toFixed(1)}%</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="bg-green-500 hover:bg-green-600 transition-colors cursor-help"
                                  style={{ width: `${labourPercent}%` }}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Labour: {labourPercent.toFixed(1)}%</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="bg-amber-500 hover:bg-amber-600 transition-colors cursor-help"
                                  style={{ width: `${overheadPercent}%` }}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Overhead: {overheadPercent.toFixed(1)}%</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-blue-500 rounded"></div>
                              <span className="text-slate-600">Materials</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-green-500 rounded"></div>
                              <span className="text-slate-600">Labour</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-amber-500 rounded"></div>
                              <span className="text-slate-600">Overhead</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Total Base Cost */}
                    <div className="pt-3 border-t border-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Total Base Cost</span>
                        <span className="font-bold text-lg text-slate-900">
                          K{(
                            parseFloat(order.material_cost || 0) +
                            parseFloat(order.labour_cost || 0) +
                            parseFloat(order.overhead_cost || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Base Cost (Break-Even Point) */}
                <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-2 border-orange-300 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-orange-200 rounded-lg">
                        <Package size={20} className="text-orange-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-orange-900">
                            Break-Even Price
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={14} className="text-orange-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p className="font-semibold mb-1">What is Break-Even Price?</p>
                              <p className="text-xs">This is the minimum price you need to charge to cover all production costs without making a loss.</p>
                              <p className="text-xs mt-2 bg-orange-100 p-2 rounded font-semibold text-orange-900">
                                ⚠️ Selling below this price means losing money!
                              </p>
                              <p className="text-xs mt-2 text-muted-foreground">This does NOT include any profit - it's just covering costs.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-xs text-orange-700">Minimum price to cover costs</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-orange-900">
                      K{(
                        parseFloat(order.material_cost || 0) +
                        parseFloat(order.labour_cost || 0) +
                        parseFloat(order.overhead_cost || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Recommended Price */}
                {(() => {
                  const baseCost =
                    parseFloat(order.material_cost || 0) +
                    parseFloat(order.labour_cost || 0) +
                    parseFloat(order.overhead_cost || 0);
                  const recommendedMargin = 30;
                  const markupAmount = baseCost * (recommendedMargin / 100);
                  const recommendedPrice = baseCost + markupAmount;

                  return (
                    <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-300 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-purple-200 rounded-lg">
                            <Calculator size={20} className="text-purple-700" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-purple-900">
                                Recommended Selling Price
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info size={14} className="text-purple-600 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                  <p className="font-semibold mb-1">Why This Price?</p>
                                  <p className="text-xs">This price includes a healthy {recommendedMargin}% profit margin, which is standard in the tailoring industry.</p>
                                  <div className="mt-3 bg-purple-100 p-3 rounded text-xs space-y-1">
                                    <p className="font-semibold text-purple-900">Calculation:</p>
                                    <p className="font-mono">Base Cost: K{baseCost.toFixed(2)}</p>
                                    <p className="font-mono">+ Markup ({recommendedMargin}%): K{markupAmount.toFixed(2)}</p>
                                    <p className="font-mono border-t border-purple-300 pt-1 mt-1">= Recommended: K{recommendedPrice.toFixed(2)}</p>
                                  </div>
                                  <p className="text-xs mt-2 text-muted-foreground">This ensures your business stays profitable and sustainable.</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <p className="text-xs text-purple-700">Suggested price with {recommendedMargin}% profit</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-purple-900">
                          K{recommendedPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-purple-700 bg-purple-200/50 p-2 rounded">
                        <span className="font-medium">Profit if sold at this price:</span>
                        <span className="font-bold">K{markupAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Actual Selling Price */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign size={18} className="text-blue-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-blue-900">
                            Actual Selling Price
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={14} className="text-blue-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">This is the final price you're charging the customer for this order.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-xs text-blue-700">Price charged to customer</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-blue-900">
                      K{parseFloat(order.total_cost).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Profit Analysis - Visual Calculator */}
                {(() => {
                  const totalCosts =
                    parseFloat(order.material_cost || 0) +
                    parseFloat(order.labour_cost || 0) +
                    parseFloat(order.overhead_cost || 0);
                  const sellingPrice = parseFloat(order.total_cost || 0);
                  const profitAmount = sellingPrice - totalCosts;
                  const profitPercentage =
                    sellingPrice > 0 ? (profitAmount / sellingPrice) * 100 : 0;

                  // Determine profit status
                  let profitStatus = "break-even";
                  let statusColor = "slate";
                  let statusIcon = "⚖️";
                  let statusMessage = "Break Even";

                  if (profitAmount < 0) {
                    profitStatus = "loss";
                    statusColor = "red";
                    statusIcon = "🔴";
                    statusMessage = "Loss Alert";
                  } else if (profitPercentage < 15) {
                    profitStatus = "low";
                    statusColor = "yellow";
                    statusIcon = "🟡";
                    statusMessage = "Low Margin";
                  } else if (profitPercentage < 30) {
                    profitStatus = "healthy";
                    statusColor = "green";
                    statusIcon = "🟢";
                    statusMessage = "Healthy Margin";
                  } else {
                    profitStatus = "excellent";
                    statusColor = "emerald";
                    statusIcon = "💚";
                    statusMessage = "Excellent Margin";
                  }

                  return (
                    <div
                      className={`p-5 rounded-lg border-2 shadow-md ${profitStatus === "loss"
                          ? "bg-gradient-to-br from-red-50 to-red-100 border-red-300"
                          : profitStatus === "low"
                            ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300"
                            : profitStatus === "healthy"
                              ? "bg-gradient-to-br from-green-50 to-green-100 border-green-300"
                              : profitStatus === "excellent"
                                ? "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300"
                                : "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300"
                        }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${profitStatus === "loss" ? "bg-red-200" :
                              profitStatus === "low" ? "bg-yellow-200" :
                                profitStatus === "healthy" ? "bg-green-200" :
                                  profitStatus === "excellent" ? "bg-emerald-200" :
                                    "bg-slate-200"
                            }`}>
                            <TrendingUp
                              size={20}
                              className={
                                profitStatus === "loss" ? "text-red-700" :
                                  profitStatus === "low" ? "text-yellow-700" :
                                    profitStatus === "healthy" ? "text-green-700" :
                                      profitStatus === "excellent" ? "text-emerald-700" :
                                        "text-slate-700"
                              }
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-bold ${profitStatus === "loss" ? "text-red-900" :
                                    profitStatus === "low" ? "text-yellow-900" :
                                      profitStatus === "healthy" ? "text-green-900" :
                                        profitStatus === "excellent" ? "text-emerald-900" :
                                          "text-slate-900"
                                  }`}
                              >
                                Profit Analysis
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info
                                    size={14}
                                    className={`cursor-help ${profitStatus === "loss" ? "text-red-600" :
                                        profitStatus === "low" ? "text-yellow-600" :
                                          profitStatus === "healthy" ? "text-green-600" :
                                            profitStatus === "excellent" ? "text-emerald-600" :
                                              "text-slate-600"
                                      }`}
                                  />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                  <p className="font-semibold mb-2">Understanding Profit Margins</p>
                                  <div className="space-y-2 text-xs">
                                    <div className="flex items-center gap-2">
                                      <span>🔴</span>
                                      <span><strong>Loss:</strong> Selling below cost - losing money</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span>🟡</span>
                                      <span><strong>Low (0-15%):</strong> Barely profitable - risky</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span>🟢</span>
                                      <span><strong>Healthy (15-30%):</strong> Good profit - sustainable</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span>💚</span>
                                      <span><strong>Excellent (30%+):</strong> Great profit - thriving</span>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <p className={`text-xs ${profitStatus === "loss" ? "text-red-700" :
                                profitStatus === "low" ? "text-yellow-700" :
                                  profitStatus === "healthy" ? "text-green-700" :
                                    profitStatus === "excellent" ? "text-emerald-700" :
                                      "text-slate-700"
                              }`}>
                              Step-by-step calculation
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 ${profitStatus === "loss" ? "bg-red-200 text-red-800" :
                              profitStatus === "low" ? "bg-yellow-200 text-yellow-800" :
                                profitStatus === "healthy" ? "bg-green-200 text-green-800" :
                                  profitStatus === "excellent" ? "bg-emerald-200 text-emerald-800" :
                                    "bg-slate-200 text-slate-800"
                            }`}
                        >
                          <span>{statusIcon}</span>
                          <span>{statusMessage}</span>
                        </span>
                      </div>

                      {/* Visual Profit Calculator */}
                      <div className="space-y-2 mb-4 p-4 bg-white/70 rounded-lg border border-current/20">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700">Selling Price:</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info size={12} className="text-slate-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">What you're charging the customer</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="font-bold text-slate-900">K{sellingPrice.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700">Base Cost:</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info size={12} className="text-slate-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Total production costs (materials + labour + overhead)</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="font-bold text-slate-900">- K{totalCosts.toFixed(2)}</span>
                        </div>

                        <div className="h-px bg-slate-300 my-2"></div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${profitAmount < 0 ? "text-red-900" :
                                "text-green-900"
                              }`}>
                              = Profit Amount:
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info size={12} className="text-slate-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">The money you earn after covering all costs</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className={`text-xl font-bold ${profitAmount < 0 ? "text-red-900" : "text-green-900"
                            }`}>
                            K{profitAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Profit Percentage */}
                      <div className={`p-3 rounded-lg text-center ${profitStatus === "loss" ? "bg-red-200/50" :
                          profitStatus === "low" ? "bg-yellow-200/50" :
                            profitStatus === "healthy" ? "bg-green-200/50" :
                              profitStatus === "excellent" ? "bg-emerald-200/50" :
                                "bg-slate-200/50"
                        }`}>
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-700">Profit Margin:</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={12} className="text-slate-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs font-semibold mb-1">How Profit Margin is Calculated:</p>
                              <p className="text-xs font-mono bg-slate-100 p-2 rounded">
                                (Profit Amount ÷ Selling Price) × 100
                              </p>
                              <p className="text-xs mt-2">
                                = (K{profitAmount.toFixed(2)} ÷ K{sellingPrice.toFixed(2)}) × 100
                              </p>
                              <p className="text-xs mt-1 font-bold">
                                = {profitPercentage.toFixed(1)}%
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <span className={`text-3xl font-bold ${profitStatus === "loss" ? "text-red-900" :
                            profitStatus === "low" ? "text-yellow-900" :
                              profitStatus === "healthy" ? "text-green-900" :
                                profitStatus === "excellent" ? "text-emerald-900" :
                                  "text-slate-900"
                          }`}>
                          {profitPercentage.toFixed(1)}%
                        </span>
                      </div>

                      {/* Status Message */}
                      {profitStatus === "loss" && (
                        <div className="mt-3 p-3 bg-red-200 rounded-lg border border-red-300">
                          <p className="text-xs font-semibold text-red-900">⚠️ Warning: This order is being sold at a loss!</p>
                          <p className="text-xs text-red-800 mt-1">Consider increasing the price to at least K{totalCosts.toFixed(2)} to break even.</p>
                        </div>
                      )}
                      {profitStatus === "low" && (
                        <div className="mt-3 p-3 bg-yellow-200 rounded-lg border border-yellow-300">
                          <p className="text-xs font-semibold text-yellow-900">⚡ Low profit margin - consider pricing higher</p>
                          <p className="text-xs text-yellow-800 mt-1">A 30% margin (K{(totalCosts * 1.3).toFixed(2)}) would be healthier for your business.</p>
                        </div>
                      )}
                      {profitStatus === "healthy" && (
                        <div className="mt-3 p-3 bg-green-200 rounded-lg border border-green-300">
                          <p className="text-xs font-semibold text-green-900">✅ Good profit margin - sustainable pricing</p>
                          <p className="text-xs text-green-800 mt-1">This order contributes well to your business growth.</p>
                        </div>
                      )}
                      {profitStatus === "excellent" && (
                        <div className="mt-3 p-3 bg-emerald-200 rounded-lg border border-emerald-300">
                          <p className="text-xs font-semibold text-emerald-900">🎉 Excellent profit margin - great pricing!</p>
                          <p className="text-xs text-emerald-800 mt-1">This is a highly profitable order for your business.</p>
                        </div>
                      )}
                    </div>
                  );
                })()}>
                <span className="font-semibold">Profit Amount:</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={12} className="cursor-help opacity-60" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>The actual money earned after covering all production costs.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span
                className={`font-bold ${profitAmount > 0 ? "text-green-600" : profitAmount < 0 ? "text-red-600" : "text-muted-foreground"}`}
              >
                K{profitAmount.toFixed(2)}
              </span>
            </div>
        </div>
      </div>

      {/* Final Profit Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Profit Margin %:</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info size={12} className="cursor-help opacity-60" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>The percentage of the selling price that is profit. Higher is better!</p>
              <p className="mt-1 text-xs font-mono">
                ({profitAmount.toFixed(2)} ÷ {sellingPrice.toFixed(2)}) × 100 = {profitPercentage.toFixed(1)}%
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <span
          className={`text-2xl font-bold ${profitAmount > 0 ? "text-green-600" : profitAmount < 0 ? "text-red-600" : "text-muted-foreground"}`}
        >
          {profitPercentage.toFixed(1)}%
        </span>
      </div>

      {/* Status Message */}
      {profitAmount < 0 && (
        <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-800">
          ⚠️ <strong>Loss Alert:</strong> This order is priced below cost!
        </div>
      )}
      {profitAmount >= 0 && profitPercentage < 20 && (
        <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
          ⚡ <strong>Low Margin:</strong> Consider increasing price for better profitability.
        </div>
      )}
      {profitPercentage >= 20 && (
        <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-800">
          ✅ <strong>Healthy Margin:</strong> Good profitability on this order!
        </div>
      )}
    </div>
  );
}) ()}

{/* Payment Status */ }
<div className="border-t border-border pt-4">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm text-muted-foreground">
      Deposit Paid
    </span>
    <span className="font-semibold text-green-600">
      K{parseFloat(order.deposit).toFixed(2)}
    </span>
  </div>
  <div className="flex items-center justify-between">
    <span className="font-bold text-foreground">Balance Due</span>
    <span
      className={`text-xl font-bold ${order.balance > 0
        ? "text-red-600"
        : "text-green-600"
        }`}
    >
      K{parseFloat(order.balance).toFixed(2)}
    </span>
  </div>
</div>
              </TooltipProvider >
            </CardContent >
          </Card >
        </div >

  {/* Right Column - Timeline & Actions */ }
  < div className = "space-y-6" >
    {/* Status Actions */ }
{
  nextStatus &&
  order.status !== "delivered" &&
  order.status !== "cancelled" && (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle>Update Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Notes (Optional)
          </label>
          <textarea
            rows={3}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Add notes about this status change..."
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
          />
        </div>

        <Button
          onClick={handleStatusChange}
          disabled={changingStatus}
          className="w-full"
        >
          Move to{" "}
          {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        {nextStatus === "production" && (
          <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded mt-2">
            ⚠️ Materials will be deducted from inventory
          </p>
        )}
      </CardContent>
    </Card>
  )
}

{/* Order Timeline */ }
<Card>
  <CardHeader>
    <CardTitle>Order Timeline</CardTitle>
  </CardHeader>
  <CardContent>
    <OrderTimeline
      timeline={order.timeline || []}
      currentStatus={order.status}
    />
  </CardContent>
</Card>
        </div >
      </div >
    </div >
  );
}

