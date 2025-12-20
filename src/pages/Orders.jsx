import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  ShoppingCart,
  TrendingUp,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import { useOrderStore } from "../store/useOrderStore";
import { orderService } from "../services/orderService";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import StatsCard from "../components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import CreateOrderForm from "../components/orders/CreateOrderForm";
import OrderDetailsView from "../components/orders/OrderDetailsView";
import toast from "react-hot-toast";

export default function Orders() {
  const {
    orders,
    loading,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
  } = useOrderStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [fetchOrders]);

  // Handle deep linking for specific order
  useEffect(() => {
    if (location.state?.openOrderId && orders.length > 0) {
      const orderToView = orders.find(o => o.id === location.state.openOrderId);
      if (orderToView) {
        handleViewOrder(orderToView);
        // Clear state to avoid opening on refresh
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, orders]);

  const fetchStats = async () => {
    try {
      const data = await orderService.getOrderStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

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
      fetchStats();
    } catch (error) {
      toast.error("Failed to create order");
    }
  };

  const handleViewOrder = async (order) => {
    if (loadingOrderDetails) return;
    setLoadingOrderDetails(true);
    try {
      const fullOrder = await orderService.getOrderById(order.id);
      setViewingOrder(fullOrder);
    } catch (error) {
      toast.error("Failed to load order details");
      console.error("Order fetch error:", error);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setViewingOrder(null);
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      await deleteOrder(id);
      toast.success("Order deleted");
    }
  };

  const handleStatusChange = async (orderId, newStatus, notes) => {
    await updateOrderStatus(orderId, newStatus, notes);
    const fullOrder = await orderService.getOrderById(orderId);
    setViewingOrder(fullOrder);
    fetchOrders();
    fetchStats();
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "completed":
      case "delivered":
        return "default"; // primary color
      case "production":
      case "fitting":
        return "secondary";
      case "enquiry":
      case "contacted":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "order_number",
        header: "Order #",
        cell: ({ row }) => <span className="font-medium">{row.getValue("order_number")}</span>,
      },
      {
        accessorKey: "customers.name",
        header: "Customer",
        id: "customer_name", // explicit id for filtering if needed
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status");
          return (
            <Badge variant={getStatusBadgeVariant(status)} className="uppercase text-[10px]">
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "total_cost",
        header: "Amount",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("total_cost"));
          return new Intl.NumberFormat("en-ZM", {
            style: "currency",
            currency: "ZMW",
          }).format(amount);
        },
      },
      {
        accessorKey: "due_date",
        header: "Due Date",
        cell: ({ row }) => {
          const date = row.getValue("due_date");
          return date ? format(new Date(date), "MMM d, yyyy") : "N/A";
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
            const order = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewOrder(order)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditOrder(order)}>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteOrder(order.id)} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and production workflow.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Order
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Orders"
            value={stats.total}
            icon={ShoppingCart}
            color="blue"
          />
          <StatsCard
            title="In Production"
            value={stats.byStatus?.production || 0}
            icon={Clock}
            color="orange"
          />
          <StatsCard
            title="This Month"
            value={stats.thisMonth}
            icon={TrendingUp}
            color="purple"
          />
          <StatsCard
            title="Revenue"
            value={`K${stats.totalRevenue.toFixed(0)}`}
            icon={TrendingUp}
            color="green"
          />
        </div>
      )}

      <Card className="overflow-hidden border-border/60">
        <DataTable 
            columns={columns} 
            data={orders} 
            filterColumn="order_number" 
            searchPlaceholder="Filter orders..." 
            onRowClick={handleViewOrder}
        />
      </Card>


      {/* Create Order Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
          </DialogHeader>
          <CreateOrderForm
            onSubmit={handleCreateOrder}
            onCancel={() => setShowCreateModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={!!viewingOrder} onOpenChange={(open) => !open && setViewingOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            {loadingOrderDetails ? (
                <div className="flex justify-center p-8">Loading...</div>
            ) : viewingOrder ? (
                <OrderDetailsView
                    order={viewingOrder}
                    onEdit={handleEditOrder}
                    onStatusChange={handleStatusChange}
                />
            ) : null}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={(open) => !open && setEditingOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Edit Order</DialogTitle>
            </DialogHeader>
            <CreateOrderForm
                order={editingOrder}
                onSubmit={async (data) => {
                    try {
                        await updateOrder(editingOrder.id, data);
                        setEditingOrder(null);
                        fetchOrders();
                        fetchStats();
                    } catch (error) {
                        // error handled by store/toast
                    }
                }}
                onCancel={() => setEditingOrder(null)}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}

