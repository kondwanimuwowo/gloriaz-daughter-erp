import { create } from "zustand";
import { orderService } from "../services/orderService";
import toast from "react-hot-toast";

export const useOrderStore = create((set, get) => ({
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,

  // Fetch all orders
  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await orderService.getAllOrders();
      set({ orders, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch orders");
    }
  },

  // Fetch order by ID
  fetchOrderById: async (id) => {
    set({ loading: true });
    try {
      const order = await orderService.getOrderById(id);
      set({ selectedOrder: order, loading: false });
      return order;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to fetch order details");
      throw error;
    }
  },

  // Create order
  createOrder: async (orderData) => {
    set({ loading: true });
    try {
      const newOrder = await orderService.createOrder(orderData);
      set((state) => ({
        orders: [newOrder, ...state.orders],
        loading: false,
      }));
      toast.success(`Order ${newOrder.order_number} created successfully!`);
      return newOrder;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to create order");
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status, notes) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(
        orderId,
        status,
        notes
      );
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status } : o
        ),
        selectedOrder:
          state.selectedOrder?.id === orderId
            ? { ...state.selectedOrder, status }
            : state.selectedOrder,
      }));
      toast.success("Order status updated successfully!");
      return updatedOrder;
    } catch (error) {
      toast.error("Failed to update order status");
      throw error;
    }
  },

  // Update order
  updateOrder: async (id, updates) => {
    set({ loading: true });
    try {
      const updatedOrder = await orderService.updateOrder(id, updates);
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id ? { ...updatedOrder, ...o } : o
        ),
        loading: false,
      }));
      toast.success("Order updated successfully!");
      return updatedOrder;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to update order");
      throw error;
    }
  },

  // Delete order
  deleteOrder: async (id) => {
    set({ loading: true });
    try {
      await orderService.deleteOrder(id);
      set((state) => ({
        orders: state.orders.filter((o) => o.id !== id),
        loading: false,
      }));
      toast.success("Order deleted successfully!");
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to delete order");
      throw error;
    }
  },

  // Set selected order
  setSelectedOrder: (order) => set({ selectedOrder: order }),

  // Clear selected order
  clearSelectedOrder: () => set({ selectedOrder: null }),
}));
