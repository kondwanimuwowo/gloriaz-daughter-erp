import { supabase } from "../lib/supabase";
import { inventoryService } from "./inventoryService";

export const orderService = {
  // Get all orders
  async getAllOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        customers (
          id,
          name,
          phone,
          email
        ),
        employees:assigned_tailor_id (
          id,
          name,
          role
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get order by ID with all relations
  async getOrderById(id) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        customers (
          id,
          name,
          phone,
          email,
          measurements
        ),
        employees:assigned_tailor_id (
          id,
          name,
          role
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    // Get order items
    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id);

    // Get order materials
    const { data: materials } = await supabase
      .from("order_materials")
      .select(
        `
        *,
        materials (
          id,
          name,
          unit,
          cost_per_unit
        )
      `
      )
      .eq("order_id", id);

    // Get order timeline
    const { data: timeline } = await supabase
      .from("order_timeline")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: true });

    return {
      ...data,
      items: items || [],
      materials: materials || [],
      timeline: timeline || [],
    };
  },

  // Create new order
  async createOrder(orderData) {
    const { data: order, error } = await supabase
      .from("orders")
      .insert([
        {
          customer_id: orderData.customer_id,
          status: "enquiry",
          order_date: new Date().toISOString(),
          due_date: orderData.due_date,
          total_cost: orderData.total_cost,
          deposit: orderData.deposit || 0,
          balance: orderData.total_cost - (orderData.deposit || 0),
          description: orderData.description,
          notes: orderData.notes,
          assigned_tailor_id: orderData.assigned_tailor_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Add initial timeline entry
    await supabase.from("order_timeline").insert([
      {
        order_id: order.id,
        status: "enquiry",
        notes: "Order created",
      },
    ]);

    return order;
  },

  // Add order item
  async addOrderItem(orderItem) {
    const { data, error } = await supabase
      .from("order_items")
      .insert([orderItem])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Add material to order
  async addOrderMaterial(orderMaterial) {
    const { data, error } = await supabase
      .from("order_materials")
      .insert([orderMaterial])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Deduct materials from inventory
  async deductMaterials(orderId) {
    // Get order materials
    const { data: materials } = await supabase
      .from("order_materials")
      .select("material_id, quantity_used")
      .eq("order_id", orderId);

    if (!materials) return;

    // Deduct each material from inventory
    for (const material of materials) {
      await inventoryService.updateStock(
        material.material_id,
        material.quantity_used,
        "subtract"
      );
    }
  },

  // Update order status
  async updateOrderStatus(orderId, status, notes = "") {
    // Update order
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;

    // Add timeline entry
    await supabase.from("order_timeline").insert([
      {
        order_id: orderId,
        status,
        notes,
      },
    ]);

    // If status is 'production', deduct materials
    if (status === "production") {
      await this.deductMaterials(orderId);
    }

    return data;
  },

  // Update order
  async updateOrder(id, updates) {
    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete order
  async deleteOrder(id) {
    const { error } = await supabase.from("orders").delete().eq("id", id);

    if (error) throw error;
  },

  // Get orders by status
  async getOrdersByStatus(status) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        customers (
          id,
          name,
          phone
        )
      `
      )
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get orders by customer
  async getOrdersByCustomer(customerId) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Search orders
  async searchOrders(searchTerm) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        customers (
          id,
          name,
          phone
        )
      `
      )
      .or(
        `order_number.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get order statistics
  async getOrderStats() {
    const { data: orders } = await supabase
      .from("orders")
      .select("status, total_cost, created_at");

    if (!orders) return null;

    const stats = {
      total: orders.length,
      byStatus: {},
      totalRevenue: 0,
      thisMonth: 0,
    };

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    orders.forEach((order) => {
      // Count by status
      stats.byStatus[order.status] = (stats.byStatus[order.status] || 0) + 1;

      // Total revenue
      stats.totalRevenue += parseFloat(order.total_cost || 0);

      // This month
      const orderDate = new Date(order.created_at);
      if (
        orderDate.getMonth() === thisMonth &&
        orderDate.getFullYear() === thisYear
      ) {
        stats.thisMonth += 1;
      }
    });

    return stats;
  },
};
