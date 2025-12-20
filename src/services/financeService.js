import { supabase } from "../lib/supabase";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export const financeService = {
  // ==================== GARMENT TYPES ====================

  async getAllGarmentTypes() {
    const { data, error } = await supabase
      .from("garment_types")
      .select("*")
      .eq("active", true)
      .order("name");

    if (error) throw error;
    return data || [];
  },

  async addGarmentType(garmentType) {
    const { data, error } = await supabase
      .from("garment_types")
      .insert([garmentType])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateGarmentType(id, updates) {
    const { data, error } = await supabase
      .from("garment_types")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteGarmentType(id) {
    const { data, error } = await supabase
      .from("garment_types")
      .update({ active: false })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ==================== OVERHEAD COSTS ====================

  async getOverheadCosts(month = new Date()) {
    const start = startOfMonth(month);
    const end = endOfMonth(month);

    const { data, error } = await supabase
      .from("overhead_costs")
      .select("*")
      .gte("month", format(start, "yyyy-MM-dd"))
      .lte("month", format(end, "yyyy-MM-dd"))
      .order("category");

    if (error) throw error;
    return data || [];
  },

  async addOverheadCost(cost) {
    const { data, error } = await supabase
      .from("overhead_costs")
      .insert([cost])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateOverheadCost(id, updates) {
    const { data, error } = await supabase
      .from("overhead_costs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteOverheadCost(id) {
    const { error } = await supabase
      .from("overhead_costs")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async getTotalOverheadForMonth(month) {
    const costs = await this.getOverheadCosts(month);
    return costs.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
  },

  // ==================== EXPENSES ====================

  async getAllExpenses(startDate = null, endDate = null) {
    let query = supabase
      .from("expenses")
      .select(
        `
        *,
        employees (id, name, role),
        orders (id, order_number)
      `
      )
      .order("expense_date", { ascending: false });

    if (startDate) query = query.gte("expense_date", startDate);
    if (endDate) query = query.lte("expense_date", endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async addExpense(expense) {
    const { data, error } = await supabase
      .from("expenses")
      .insert([expense])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateExpense(id, updates) {
    const { data, error } = await supabase
      .from("expenses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteExpense(id) {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) throw error;
  },

  // ==================== PAYMENTS ====================

  async getPayments(startDate = null, endDate = null) {
    let query = supabase
      .from("payments")
      .select(
        `
        *,
        orders (
          id,
          order_number,
          total_cost,
          customers (name, phone)
        )
      `
      )
      .order("payment_date", { ascending: false });

    if (startDate) query = query.gte("payment_date", startDate);
    if (endDate) query = query.lte("payment_date", endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async addPayment(payment) {
    const { data, error } = await supabase
      .from("payments")
      .insert([payment])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePayment(id) {
    const { error } = await supabase.from("payments").delete().eq("id", id);
    if (error) throw error;
  },

  // ==================== FINANCIAL SETTINGS ====================

  async getFinancialSettings() {
    const { data, error } = await supabase
      .from("financial_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  },

  async updateFinancialSettings(updates) {
    const { data: current } = await supabase
      .from("financial_settings")
      .select("id")
      .limit(1)
      .single();

    if (current) {
      const { data, error } = await supabase
        .from("financial_settings")
        .update(updates)
        .eq("id", current.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  // ==================== ANALYTICS & CALCULATIONS ====================

  async getMonthlyFinancialSummary(month = new Date()) {
    const start = startOfMonth(month);
    const end = endOfMonth(month);

    // Get all data in parallel
    const [
      { data: orders },
      { data: overhead },
      { data: expenses },
      { data: payments },
    ] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .gte("order_date", start.toISOString())
        .lte("order_date", end.toISOString()),
      supabase
        .from("overhead_costs")
        .select("amount")
        .gte("month", format(start, "yyyy-MM-dd"))
        .lte("month", format(end, "yyyy-MM-dd")),
      supabase
        .from("expenses")
        .select("amount")
        .gte("expense_date", format(start, "yyyy-MM-dd"))
        .lte("expense_date", format(end, "yyyy-MM-dd")),
      supabase
        .from("payments")
        .select("amount")
        .gte("payment_date", format(start, "yyyy-MM-dd"))
        .lte("payment_date", format(end, "yyyy-MM-dd")),
    ]);

    const totalRevenue =
      orders?.reduce((s, o) => s + parseFloat(o.total_cost || 0), 0) || 0;
    const totalMaterial =
      orders?.reduce((s, o) => s + parseFloat(o.material_cost || 0), 0) || 0;
    const totalLabour =
      orders?.reduce((s, o) => s + parseFloat(o.labour_cost || 0), 0) || 0;
    const totalOverhead =
      overhead?.reduce((s, o) => s + parseFloat(o.amount || 0), 0) || 0;
    const totalExpenses =
      expenses?.reduce((s, e) => s + parseFloat(e.amount || 0), 0) || 0;
    const totalPayments =
      payments?.reduce((s, p) => s + parseFloat(p.amount || 0), 0) || 0;

    const totalCosts =
      totalMaterial + totalLabour + totalOverhead + totalExpenses;
    const netProfit = totalRevenue - totalCosts;
    const profitMargin =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      month: format(month, "MMMM yyyy"),
      totalOrders: orders?.length || 0,
      completedOrders:
        orders?.filter((o) => ["completed", "delivered"].includes(o.status))
          .length || 0,
      pendingOrders:
        orders?.filter(
          (o) => !["completed", "delivered", "cancelled"].includes(o.status)
        ).length || 0,
      cancelledOrders:
        orders?.filter((o) => o.status === "cancelled").length || 0,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalMaterial: parseFloat(totalMaterial.toFixed(2)),
      totalLabour: parseFloat(totalLabour.toFixed(2)),
      totalOverhead: parseFloat(totalOverhead.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      totalCosts: parseFloat(totalCosts.toFixed(2)),
      totalPayments: parseFloat(totalPayments.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
      profitMargin: parseFloat(profitMargin.toFixed(2)),
      cashFlow: parseFloat((totalPayments - totalCosts).toFixed(2)),
      avgOrderValue: orders?.length > 0 ? totalRevenue / orders.length : 0,
    };
  },

  async getOverheadPerOrder(month = new Date()) {
    const { data: settings } = await supabase
      .from("financial_settings")
      .select("expected_monthly_orders")
      .limit(1)
      .single();

    const totalOverhead = await this.getTotalOverheadForMonth(month);
    const expectedOrders = settings?.expected_monthly_orders || 40;

    return totalOverhead / expectedOrders;
  },

  async getOrdersDetailedView(startDate, endDate) {
    let query = supabase
      .from("orders")
      .select(
        `
        *,
        customers (id, name, phone),
        employees:assigned_tailor_id (id, name),
        garment_types (id, name, complexity)
      `
      )
      .order("order_date", { ascending: false });

    if (startDate) query = query.gte("order_date", startDate);
    if (endDate) query = query.lte("order_date", endDate);

    const { data, error } = await query;
    if (error) throw error;

    return (
      data?.map((order) => ({
        ...order,
        calculatedProfit:
          parseFloat(order.total_cost || 0) -
          (parseFloat(order.material_cost || 0) +
            parseFloat(order.labour_cost || 0) +
            parseFloat(order.overhead_cost || 0)),
        profitMargin:
          parseFloat(order.total_cost || 0) > 0
            ? ((parseFloat(order.total_cost || 0) -
                (parseFloat(order.material_cost || 0) +
                  parseFloat(order.labour_cost || 0) +
                  parseFloat(order.overhead_cost || 0))) /
                parseFloat(order.total_cost || 0)) *
              100
            : 0,
      })) || []
    );
  },
};
