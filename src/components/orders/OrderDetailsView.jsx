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
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {order.order_number}
          </h2>
          <p className="text-gray-600">
            Created on {format(new Date(order.order_date), "MMMM dd, yyyy")}
          </p>
        </div>
        <div className="flex gap-3">
          <OrderStatusBadge status={order.status} />
          <Button variant="secondary" icon={Edit} onClick={() => onEdit(order)}>
            Edit Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-primary-600" />
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold text-gray-900">
                  {order.customers?.name || "N/A"}
                </p>
              </div>
              {order.customers?.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <p className="text-gray-900">{order.customers.phone}</p>
                </div>
              )}
              {order.customers?.email && (
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <p className="text-gray-900">{order.customers.email}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Order Details */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-primary-600" />
              Order Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-900">
                  {order.description || "No description provided"}
                </p>
              </div>

              {order.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-600 text-sm">{order.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Due Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <p className="font-semibold text-gray-900">
                      {order.due_date
                        ? format(new Date(order.due_date), "MMM dd, yyyy")
                        : "Not set"}
                    </p>
                  </div>
                </div>

                {order.employees && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Assigned Tailor
                    </p>
                    <div className="flex items-center gap-2">
                      <Scissors size={16} className="text-gray-400" />
                      <p className="font-semibold text-gray-900">
                        {order.employees.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Materials Used */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={20} className="text-primary-600" />
              Materials Used
            </h3>
            {order.materials && order.materials.length > 0 ? (
              <div className="space-y-3">
                {order.materials.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.materials?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {parseFloat(item.quantity_used).toFixed(2)}{" "}
                        {item.materials?.unit}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      K{parseFloat(item.cost).toFixed(2)}
                    </p>
                  </motion.div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">
                    Total Material Cost
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    K
                    {order.materials
                      .reduce((sum, m) => sum + parseFloat(m.cost), 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No materials recorded</p>
            )}
          </Card>

          {/* Pricing Summary */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-primary-600" />
              Pricing Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Cost</span>
                <span className="font-semibold text-gray-900">
                  K{parseFloat(order.total_cost).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Deposit Paid</span>
                <span className="font-semibold text-green-600">
                  K{parseFloat(order.deposit).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="font-bold text-gray-900">Balance Due</span>
                <span
                  className={`text-xl font-bold ${
                    order.balance > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  K{parseFloat(order.balance).toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Timeline & Actions */}
        <div className="space-y-6">
          {/* Status Actions */}
          {nextStatus &&
            order.status !== "delivered" &&
            order.status !== "cancelled" && (
              <Card className="bg-gradient-to-br from-primary-50 to-white">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Update Status
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Add notes about this status change..."
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleStatusChange}
                  loading={changingStatus}
                  className="w-full"
                  icon={ArrowRight}
                >
                  Move to{" "}
                  {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                </Button>

                {nextStatus === "production" && (
                  <p className="text-xs text-yellow-700 mt-2 bg-yellow-50 p-2 rounded">
                    ⚠️ Materials will be deducted from inventory
                  </p>
                )}
              </Card>
            )}

          {/* Order Timeline */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Order Timeline
            </h3>
            <OrderTimeline
              timeline={order.timeline || []}
              currentStatus={order.status}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
