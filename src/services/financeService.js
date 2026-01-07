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

  async getOverheadCosts(startDate, endDate) {
    // If only one arg provided and it's a date object/string for month
    let start, end;
    if (arguments.length === 1 && !endDate) {
      start = startOfMonth(new Date(startDate));
      end = endOfMonth(new Date(startDate));
    } else {
      start = new Date(startDate);
      end = new Date(endDate);
    }

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

  async getFinancialSummary(startDate, endDate) {
    // Determine range
    let start, end;
    if (arguments.length === 1 && !endDate) {
      // Support legacy call with single 'month' arg
      start = startOfMonth(new Date(startDate));
      end = endOfMonth(new Date(startDate));
    } else {
      start = new Date(startDate);
      end = new Date(endDate);
    }

    const startStr = format(start, "yyyy-MM-dd");
    const endStr = format(end, "yyyy-MM-dd");

    // Fetch data in parallel
    const [
      { data: newOrders },
      { data: completedOrdersData },
      { data: overhead },
      { data: expenses },
      { data: payments },
    ] = await Promise.all([
      // Orders PLACED in this period (for volume stats)
      supabase
        .from("orders")
        .select("*")
        .gte("order_date", start.toISOString())
        .lte("order_date", end.toISOString()),
      // Orders COMPLETED in this period (for recognized revenue/production costs)
      supabase
        .from("orders")
        .select("*")
        .in("status", ["completed", "delivered"])
        .gte("updated_at", start.toISOString())
        .lte("updated_at", end.toISOString()),
      supabase
        .from("overhead_costs")
        .select("amount")
        .gte("month", startStr)
        .lte("month", endStr),
      supabase
        .from("expenses")
        .select("amount")
        .gte("expense_date", startStr)
        .lte("expense_date", endStr),
      supabase
        .from("payments")
        .select("amount")
        .gte("payment_date", startStr)
        .lte("payment_date", endStr),
    ]);

    // Recognized Revenue & Production Costs (Accrual basis)
    const totalRevenue =
      completedOrdersData?.reduce((s, o) => s + parseFloat(o.total_cost || 0), 0) || 0;
    const totalMaterial =
      completedOrdersData?.reduce((s, o) => s + parseFloat(o.material_cost || 0), 0) || 0;
    const totalLabour =
      completedOrdersData?.reduce((s, o) => s + parseFloat(o.labour_cost || 0), 0) || 0;

    // Fixed Overheads for the business (Rent, Utilities, etc.)
    const totalOverhead =
      overhead?.reduce((s, o) => s + parseFloat(o.amount || 0), 0) || 0;

    // Other miscellaneous expenses
    const totalExpenses =
      expenses?.reduce((s, e) => s + parseFloat(e.amount || 0), 0) || 0;

    // Total Payments received in period (Cash basis)
    const totalPayments =
      payments?.reduce((s, p) => s + parseFloat(p.amount || 0), 0) || 0;

    const totalProductionCosts = totalMaterial + totalLabour;
    const totalCosts = totalProductionCosts + totalOverhead + totalExpenses;
    const netProfit = totalRevenue - totalCosts;
    const profitMargin =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      periodStart: startStr,
      periodEnd: endStr,
      totalOrders: newOrders?.length || 0,
      completedOrders: completedOrdersData?.length || 0,
      pendingOrders:
        newOrders?.filter(
          (o) => !["completed", "delivered", "cancelled"].includes(o.status)
        ).length || 0,
      cancelledOrders:
        newOrders?.filter((o) => o.status === "cancelled").length || 0,
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
      avgOrderValue: newOrders?.length > 0 ? totalRevenue / newOrders.length : 0,
    };
  },

  // Legacy alias for backward compatibility (though we'll update store)
  async getMonthlyFinancialSummary(month) {
    return this.getFinancialSummary(month);
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

  async getCompletedOrders(startDate, endDate) {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        customer_id,
        customers(name),
        total_cost,
        material_cost,
        labour_cost,
        overhead_cost,
        created_at,
        updated_at
      `)
      .in("status", ["completed", "delivered"])
      .gte("updated_at", startDate)
      .lte("updated_at", endDate)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
