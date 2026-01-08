import { supabase } from "../lib/supabase";
import { inventoryService } from "./inventoryService";
import { getZambianDate } from "../utils/dateUtils";

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
      .order("created_at", { ascending: false })
      .is("deleted_at", null);

    if (error) throw error;
    return data;
  },

  // Get order by ID with all relations
  // Get order by ID with all relations (OPTIMIZED)
  async getOrderById(id) {
    try {
      // Fetch order with relations in parallel (faster)
      const [orderResult, itemsResult, materialsResult, timelineResult] =
        await Promise.all([
          // Main order data
          supabase
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
            .eq("id", id)
            .single(),

          // Order items
          supabase.from("order_items").select("*").eq("order_id", id),

          // Order materials with material details
          supabase
            .from("order_materials")
            .select(
              `
          *,
          materials (
            id,
            name,
            unit,
            cost_per_unit,
            category
          )
        `
            )
            .eq("order_id", id),

          // Order timeline
          supabase
            .from("order_timeline")
            .select("*")
            .eq("order_id", id)
            .order("created_at", { ascending: true }),
        ]);

      if (orderResult.error) throw orderResult.error;

      return {
        ...orderResult.data,
        items: itemsResult.data || [],
        materials: materialsResult.data || [],
        timeline: timelineResult.data || [],
      };
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },

  // Create new order with costs (UPDATED)
  async createOrder(orderData) {
    // Calculate material cost from materials array
    const materialCost = (orderData.materials || []).reduce(
      (sum, m) => sum + parseFloat(m.cost || 0),
      0
    );

    const { data: order, error } = await supabase
      .from("orders")
      .insert([
        {
          customer_id: orderData.customer_id,
          status: "enquiry",
          order_date: new Date().toISOString(),
          due_date: orderData.due_date,
          total_cost: orderData.total_cost,
          material_cost: materialCost,
          labour_cost: orderData.labour_cost || 0,
          overhead_cost: orderData.overhead_cost || 0,
          profit_margin: orderData.profit_margin || 0,
          deposit: orderData.deposit || 0,
          balance: orderData.total_cost - (orderData.deposit || 0),
          description: orderData.description,
          notes: orderData.notes,
          assigned_tailor_id: orderData.assigned_tailor_id,
          order_type: orderData.order_type || "custom",
          product_id: orderData.product_id || null,
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
        "subtract",
        `Order #${orderId} deduction`
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

    // Notify on key status changes
    if (["completed", "delivered", "cancelled"].includes(status)) {
      notificationService.notifyOrderUpdate(
        data.order_number,
        status,
        data.customer_id
      ).catch(console.error);
    }

    return data;
  },

  // Update order with recalculation (UPDATED)
  async updateOrder(id, updates) {
    // If materials are included in updates, recalculate material_cost
    if (updates.materials) {
      const materialCost = (updates.materials || []).reduce(
        (sum, m) => sum + parseFloat(m.cost || 0),
        0
      );
      updates.material_cost = materialCost;

      // Recalculate total cost if needed
      if (!updates.total_cost) {
        const { data: existingOrder } = await this.getOrderById(id);
        updates.total_cost =
          materialCost +
          (updates.labour_cost || existingOrder.labour_cost || 0) +
          (updates.overhead_cost || existingOrder.overhead_cost || 0);
      }
    }

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
    const { error } = await supabase
      .from("orders")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },

  // Restore order
  async restoreOrder(id) {
    const { error } = await supabase
      .from("orders")
      .update({ deleted_at: null })
      .eq("id", id);

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
      .is("deleted_at", null)
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
      .is("deleted_at", null)
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
      .is("deleted_at", null)
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

  // NEW: Get analytics view data (optimized)
  async getOrderAnalytics(filters = {}) {
    let query = supabase.from("orders").select(`
      *,
      customers (id, name, phone),
      employees:assigned_tailor_id (id, name, role)
    `);

    if (filters.startDate) {
      query = query.gte("order_date", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("order_date", filters.endDate);
    }
    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    if (filters.customerId) {
      query = query.eq("customer_id", filters.customerId);
    }
    if (filters.tailorId) {
      query = query.eq("assigned_tailor_id", filters.tailorId);
    }

    const { data, error } = await query.order("order_date", {
      ascending: false,
    });

    if (error) throw error;
    return data;
  },

  // NEW: Get monthly stats (if you have a materialized view in Supabase)
  async getMonthlyStats() {
    try {
      // First try to use materialized view if it exists
      const { data, error } = await supabase
        .from("monthly_order_stats")
        .select("*")
        .order("month", { ascending: false })
        .limit(24); // Last 24 months

      if (!error) return data;

      // Fallback: Calculate manually if materialized view doesn't exist
      console.warn(
        "Materialized view 'monthly_order_stats' not found, calculating manually..."
      );
      return this.calculateMonthlyStats();
    } catch (error) {
      // Fallback to manual calculation
      console.warn("Using fallback monthly stats calculation:", error.message);
      return this.calculateMonthlyStats();
    }
  },

  // NEW: Fallback monthly stats calculation
  async calculateMonthlyStats() {
    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        "total_cost, material_cost, labour_cost, overhead_cost, created_at, status"
      )
      .order("created_at", { ascending: false })
      .limit(1000); // Limit for performance

    if (error) throw error;

    const monthlyStats = {};

    orders.forEach((order) => {
      const date = new Date(order.created_at);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;

      if (!monthlyStats[monthYear]) {
        monthlyStats[monthYear] = {
          month: monthYear,
          total_orders: 0,
          total_revenue: 0,
          material_cost: 0,
          labour_cost: 0,
          overhead_cost: 0,
          completed_orders: 0,
          active_orders: 0,
        };
      }

      const stats = monthlyStats[monthYear];
      stats.total_orders += 1;
      stats.total_revenue += parseFloat(order.total_cost || 0);
      stats.material_cost += parseFloat(order.material_cost || 0);
      stats.labour_cost += parseFloat(order.labour_cost || 0);
      stats.overhead_cost += parseFloat(order.overhead_cost || 0);

      if (order.status === "delivered" || order.status === "completed") {
        stats.completed_orders += 1;
      } else if (!["cancelled"].includes(order.status)) {
        stats.active_orders += 1;
      }
    });

    // Convert to array and sort by month
    return Object.values(monthlyStats)
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 24);
  },

  // NEW: Get cost breakdown for an order
  async getOrderCostBreakdown(orderId) {
    const order = await this.getOrderById(orderId);

    if (!order) return null;

    return {
      material_cost: order.material_cost || 0,
      labour_cost: order.labour_cost || 0,
      overhead_cost: order.overhead_cost || 0,
      total_cost: order.total_cost || 0,
      profit:
        (order.total_cost || 0) -
        ((order.material_cost || 0) +
          (order.labour_cost || 0) +
          (order.overhead_cost || 0)),
      profit_margin:
        order.total_cost > 0
          ? (
            (((order.total_cost || 0) -
              ((order.material_cost || 0) +
                (order.labour_cost || 0) +
                (order.overhead_cost || 0))) /
              (order.total_cost || 0)) *
            100
          ).toFixed(2)
          : 0,
    };
  },

  // NEW: Bulk update order statuses
  async bulkUpdateStatus(orderIds, status, notes = "") {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .in("id", orderIds)
      .select();

    if (error) throw error;

    // Add timeline entries for each order
    const timelineEntries = orderIds.map((orderId) => ({
      order_id: orderId,
      status,
      notes,
    }));

    await supabase.from("order_timeline").insert(timelineEntries);

    // If moving to production, deduct materials for all orders
    if (status === "production") {
      for (const orderId of orderIds) {
        await this.deductMaterials(orderId);
      }
    }

    return data;
  },

  // NEW: Get orders due soon (within X days)
  async getOrdersDueSoon(days = 7) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const todayString = getZambianDate(today);
    const futureString = getZambianDate(futureDate);

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        customers (id, name, phone)
      `
      )
      .not("due_date", "is", null)
      .lte("due_date", futureString)
      .gte("due_date", todayString)
      .is("deleted_at", null)
      .in("status", ["production", "fitting"])
      .order("due_date", { ascending: true });

    if (error) throw error;
    return data;
  },

  // NEW: Get orders with pending balance
  async getOrdersWithBalance() {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        customers (id, name, phone)
      `
      )
      .gt("balance", 0)
      .not("status", "in", "('cancelled')")
      .is("deleted_at", null)
      .order("due_date", { ascending: true });

    if (error) throw error;
    return data;
  },
  // Permanent Delete (Hard Delete)
  async permanentDeleteOrder(id) {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;
  },
};
