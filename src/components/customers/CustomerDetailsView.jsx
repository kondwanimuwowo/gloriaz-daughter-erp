import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingCart,
  Ruler,
  Edit,
  Plus,
  Calendar,
  DollarSign,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import Modal from "../common/Modal";
import MeasurementsForm from "./MeasurementsForm";
import OrderStatusBadge from "../orders/OrderStatusBadge";

export default function CustomerDetailsView({
  customer,
  onEdit,
  onUpdateMeasurements,
  stats,
}) {
  const [showMeasurementsModal, setShowMeasurementsModal] = useState(false);

  const handleSaveMeasurements = async (measurements) => {
    await onUpdateMeasurements(customer.id, measurements);
    setShowMeasurementsModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
            {customer.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              {customer.name}
            </h2>
            <p className="text-gray-600">
              Customer since{" "}
              {format(new Date(customer.created_at), "MMMM dd, yyyy")}
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          icon={Edit}
          onClick={() => onEdit(customer)}
        >
          Edit Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-primary-600" />
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900">
                    {customer.phone}
                  </p>
                </div>
              </div>
              {customer.email && (
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">
                      {customer.email}
                    </p>
                  </div>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="font-semibold text-gray-900">
                      {customer.address}
                    </p>
                  </div>
                </div>
              )}
              {customer.notes && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-700">{customer.notes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Measurements */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Ruler size={20} className="text-primary-600" />
                Body Measurements
              </h3>
              <Button
                variant="secondary"
                icon={customer.measurements ? Edit : Plus}
                onClick={() => setShowMeasurementsModal(true)}
              >
                {customer.measurements ? "Update" : "Add Measurements"}
              </Button>
            </div>

            {customer.measurements ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(customer.measurements)
                  .filter(([key]) => key !== "notes")
                  .map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1 capitalize">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="font-semibold text-gray-900">{value}"</p>
                    </div>
                  ))}
                {customer.measurements.notes && (
                  <div className="col-span-2 md:col-span-3 bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 mb-1">Notes</p>
                    <p className="text-sm text-blue-900">
                      {customer.measurements.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Ruler className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-600 mb-1">No measurements recorded</p>
                <p className="text-sm text-gray-500">
                  Add measurements to help with future orders
                </p>
              </div>
            )}
          </Card>

          {/* Order History */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart size={20} className="text-primary-600" />
              Order History
            </h3>

            {customer.orders && customer.orders.length > 0 ? (
              <div className="space-y-3">
                {customer.orders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-gray-900">
                          {order.order_number}
                        </p>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {order.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {format(new Date(order.order_date), "MMM dd, yyyy")}
                        </span>
                        {order.due_date && (
                          <span>
                            Due: {format(new Date(order.due_date), "MMM dd")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-gray-900">
                        K{parseFloat(order.total_cost).toFixed(2)}
                      </p>
                      {order.balance > 0 && (
                        <p className="text-xs text-red-600">
                          Balance: K{parseFloat(order.balance).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <ShoppingCart
                  className="mx-auto text-gray-400 mb-2"
                  size={32}
                />
                <p className="text-gray-600">No orders yet</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Statistics */}
        <div className="space-y-6">
          {/* Customer Stats */}
          {stats && (
            <>
              <Card className="bg-gradient-to-br from-blue-50 to-white">
                <div className="text-center">
                  <ShoppingCart
                    className="mx-auto text-blue-600 mb-2"
                    size={32}
                  />
                  <p className="text-sm text-blue-600 mb-1">Total Orders</p>
                  <p className="text-4xl font-bold text-blue-900">
                    {stats.totalOrders}
                  </p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-white">
                <div className="text-center">
                  <DollarSign
                    className="mx-auto text-green-600 mb-2"
                    size={32}
                  />
                  <p className="text-sm text-green-600 mb-1">Total Spent</p>
                  <p className="text-4xl font-bold text-green-900">
                    K{stats.totalSpent.toFixed(0)}
                  </p>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Completed Orders
                    </span>
                    <span className="font-semibold text-gray-900">
                      {stats.completedOrders}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Orders</span>
                    <span className="font-semibold text-gray-900">
                      {stats.activeOrders}
                    </span>
                  </div>
                  {stats.lastOrderDate && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Last Order</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {format(new Date(stats.lastOrderDate), "MMM dd, yyyy")}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Measurements Modal */}
      <Modal
        isOpen={showMeasurementsModal}
        onClose={() => setShowMeasurementsModal(false)}
        title={
          customer.measurements ? "Update Measurements" : "Add Measurements"
        }
        size="lg"
      >
        <MeasurementsForm
          customer={customer}
          onSubmit={handleSaveMeasurements}
          onCancel={() => setShowMeasurementsModal(false)}
        />
      </Modal>
    </div>
  );
}
