import { supabase } from "../lib/supabase";

export const customerService = {
  // Get all customers
  async getAllCustomers() {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get customer by ID
  async getCustomerById(id) {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get customer with orders
  async getCustomerWithOrders(id) {
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (customerError) throw customerError;

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", id)
      .order("created_at", { ascending: false });

    if (ordersError) throw ordersError;

    return {
      ...customer,
      orders: orders || [],
    };
  },

  // Add new customer
  async addCustomer(customer) {
    const { data, error } = await supabase
      .from("customers")
      .insert([customer])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update customer
  async updateCustomer(id, updates) {
    const { data, error } = await supabase
      .from("customers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete customer
  async deleteCustomer(id) {
    const { error } = await supabase.from("customers").delete().eq("id", id);

    if (error) throw error;
  },

  // Update measurements
  async updateMeasurements(id, measurements) {
    const { data, error } = await supabase
      .from("customers")
      .update({ measurements })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Search customers
  async searchCustomers(searchTerm) {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .or(
        `name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getCustomerStats(customerId) {
    const { data: orders } = await supabase
      .from("orders")
      .select("total_amount, status, created_at")
      .eq("customer_id", customerId);

    if (!orders) return null;

    const stats = {
      totalOrders: orders.length,
      totalSpent: orders.reduce(
        (sum, o) => sum + parseFloat(o.total_amount || 0),
        0
      ),
      completedOrders: orders.filter((o) => o.status === "delivered").length,
      activeOrders: orders.filter(
        (o) => !["delivered", "cancelled"].includes(o.status)
      ).length,
      lastOrderDate: orders.length > 0 ? orders[0].created_at : null,
    };

    return stats;
  },
};
