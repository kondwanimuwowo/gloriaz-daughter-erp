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
import { StatusTimeline } from "./StatusTimeline";

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

          {/* Pricing & Profitability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Order Pricing & Profitability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

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
                    <div className="flex items-center gap-1">
                      <span className="text-slate-600">Materials</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info size={12} className="text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>Total cost of fabrics and accessories</TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="font-semibold text-slate-900">K{parseFloat(order.material_cost || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-600">Labour</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info size={12} className="text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>Cost of the tailor's time</TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="font-semibold text-slate-900">K{parseFloat(order.labour_cost || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-600">Overhead</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info size={12} className="text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>Business costs (rent, power, etc)</TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="font-semibold text-slate-900">K{parseFloat(order.overhead_cost || 0).toFixed(2)}</span>
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
                      <span className="text-lg font-bold text-slate-900">
                        K{(
                          parseFloat(order.material_cost || 0) +
                          parseFloat(order.labour_cost || 0) +
                          parseFloat(order.overhead_cost || 0)
                        ).toFixed(2)}
                      </span>
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
                  <div className="text-5xl font-bold text-primary">
                    K{parseFloat(order.total_amount || order.total_cost || 0).toFixed(2)}
                  </div>
                  <p className="text-sm text-slate-600 font-medium">
                    Total amount charged to customer
                  </p>
                </div>
              </div>

              {/* Profit Analysis - Subtle */}
              {(() => {
                const baseCost =
                  parseFloat(order.material_cost || 0) +
                  parseFloat(order.labour_cost || 0) +
                  parseFloat(order.overhead_cost || 0);
                const revenue = parseFloat(order.total_amount || order.total_cost || 0);
                const profitAmount = revenue - baseCost;
                // Use Markup formula: (Profit / Cost) * 100
                const markup = baseCost > 0 ? (profitAmount / baseCost) * 100 : 0;
                const isLoss = profitAmount < 0;
                const isLowMarkup = markup < 20 && markup >= 0;

                return (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-slate-700">📊 Profit Analysis</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Profit Amount</span>
                        <span className={`font-bold ${isLoss ? 'text-red-600' : 'text-green-600'}`}>
                          K{Math.abs(profitAmount).toFixed(2)}
                          {isLoss && <span className="text-xs ml-1">(LOSS)</span>}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Markup (Profit %)</span>
                        <span className={`font-bold ${isLoss ? 'text-red-600' : isLowMarkup ? 'text-yellow-600' : 'text-green-600'}`}>
                          {markup.toFixed(1)}%
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        {isLoss ? (
                          <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50 px-3 py-2 rounded">
                            <span>⚠️</span>
                            <span>Order sold below cost (loss)</span>
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
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Materials Used */}
          {/* Payment Status */}
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
        </div>

        {/* Right Column - Timeline & Actions */}
        <div className="space-y-6">
          {/* Status Actions */}
          {nextStatus &&
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
            )}

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline
                currentStatus={order.status}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
