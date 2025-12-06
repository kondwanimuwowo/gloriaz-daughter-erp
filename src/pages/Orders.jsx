import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  ShoppingCart,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useOrderStore } from "../store/useOrderStore";
import { orderService } from "../services/orderService";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import OrderCard from "../components/orders/OrderCard";
import CreateOrderForm from "../components/orders/CreateOrderForm";
import OrderDetailsView from "../components/orders/OrderDetailsView";
import toast from "react-hot-toast";

const STATUS_FILTERS = [
  { key: "all", label: "All Orders" },
  { key: "enquiry", label: "Enquiry" },
  { key: "contacted", label: "Contacted" },
  { key: "measurements", label: "Measurements" },
  { key: "production", label: "Production" },
  { key: "fitting", label: "Fitting" },
  { key: "completed", label: "Completed" },
  { key: "delivered", label: "Delivered" },
];

export default function Orders() {
  const {
    orders,
    loading,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    deleteOrder,
  } = useOrderStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [fetchOrders]);

  const fetchStats = async () => {
    try {
      const data = await orderService.getOrderStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = async (data) => {
    try {
      const order = await createOrder(data);

      // Add materials to the order
      if (data.materials && data.materials.length > 0) {
        for (const material of data.materials) {
          await orderService.addOrderMaterial({
            order_id: order.id,
            material_id: material.material_id,
            quantity_used: material.quantity_used,
            cost: material.cost,
          });
        }
      }

      setShowCreateModal(false);
      toast.success("Order created successfully!");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to create order");
    }
  };

  const handleViewOrder = async (order) => {
    try {
      const fullOrder = await orderService.getOrderById(order.id);
      setViewingOrder(fullOrder);
    } catch (error) {
      toast.error("Failed to load order details");
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setViewingOrder(null);
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      await deleteOrder(id);
    }
  };

  const handleStatusChange = async (orderId, newStatus, notes) => {
    await updateOrderStatus(orderId, newStatus, notes);
    // Refresh the order details
    const fullOrder = await orderService.getOrderById(orderId);
    setViewingOrder(fullOrder);
    fetchOrders();
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Management
          </h1>
          <p className="text-gray-600">Track and manage customer orders</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} icon={Plus}>
          Create Order
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Production</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.byStatus?.production || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.thisMonth}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  K{stats.totalRevenue.toFixed(0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="search"
              placeholder="Search by order number, customer name, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              {STATUS_FILTERS.map((filter) => (
                <option key={filter.key} value={filter.key}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <Card className="text-center py-12">
          <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first order"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button onClick={() => setShowCreateModal(true)} icon={Plus}>
              Create Your First Order
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onView={handleViewOrder}
              onEdit={handleEditOrder}
              onDelete={handleDeleteOrder}
            />
          ))}
        </div>
      )}

      {/* Create Order Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Order"
        size="lg"
      >
        <CreateOrderForm
          onSubmit={handleCreateOrder}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* View Order Modal */}
      <Modal
        isOpen={!!viewingOrder}
        onClose={() => setViewingOrder(null)}
        title="Order Details"
        size="xl"
      >
        {viewingOrder && (
          <OrderDetailsView
            order={viewingOrder}
            onEdit={handleEditOrder}
            onStatusChange={handleStatusChange}
          />
        )}
      </Modal>

      {/* Edit Order Modal */}
      <Modal
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        title="Edit Order"
        size="lg"
      >
        <CreateOrderForm
          order={editingOrder}
          onSubmit={async (data) => {
            // Handle order update
            toast.info("Order editing coming soon!");
            setEditingOrder(null);
          }}
          onCancel={() => setEditingOrder(null)}
        />
      </Modal>
    </div>
  );
}
