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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
              {/* Cost Breakdown */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Cost Breakdown
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Material Cost</span>
                    <span className="font-semibold text-foreground">
                      K{parseFloat(order.material_cost || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Labour Cost</span>
                    <span className="font-semibold text-foreground">
                      K{parseFloat(order.labour_cost || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overhead Cost</span>
                    <span className="font-semibold text-foreground">
                      K{parseFloat(order.overhead_cost || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-foreground">
                        Total Costs
                      </span>
                      <span className="font-bold text-foreground">
                        K
                        {(
                          parseFloat(order.material_cost || 0) +
                          parseFloat(order.labour_cost || 0) +
                          parseFloat(order.overhead_cost || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-900">
                  Total Revenue
                </span>
                <span className="text-xl font-bold text-blue-600">
                  K{parseFloat(order.total_cost).toFixed(2)}
                </span>
              </div>

              {/* Profit Margin */}
              {(() => {
                const totalCosts =
                  parseFloat(order.material_cost || 0) +
                  parseFloat(order.labour_cost || 0) +
                  parseFloat(order.overhead_cost || 0);
                const revenue = parseFloat(order.total_cost || 0);
                const profit = revenue - totalCosts;
                const profitPercentage =
                  revenue > 0 ? (profit / revenue) * 100 : 0;

                return (
                  <div
                    className={`p-4 rounded-lg border-2 ${
                      profit > 0
                        ? "bg-green-50 border-green-200"
                        : profit < 0
                        ? "bg-red-50 border-red-200"
                        : "bg-muted border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-semibold ${
                          profit > 0
                            ? "text-green-900"
                            : profit < 0
                            ? "text-red-900"
                            : "text-foreground"
                        }`}
                      >
                        Profit Margin
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          profit > 0
                            ? "bg-green-100 text-green-700"
                            : profit < 0
                            ? "bg-red-100 text-red-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {profitPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Revenue - Total Costs
                      </span>
                      <span
                        className={`text-2xl font-bold ${
                          profit > 0
                            ? "text-green-600"
                            : profit < 0
                            ? "text-red-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        K{profit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })()}

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
                    className={`text-xl font-bold ${
                      order.balance > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    K{parseFloat(order.balance).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
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
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline
                timeline={order.timeline || []}
                currentStatus={order.status}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

