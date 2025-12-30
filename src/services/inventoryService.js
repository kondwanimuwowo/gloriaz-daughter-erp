import { supabase } from "../lib/supabase";
import { notificationService } from "./notificationService";

export const inventoryService = {
  // Get all materials
  async getAllMaterials() {
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Add a new material
  async addMaterial(materialData) {
    const { data, error } = await supabase
      .from("materials")
      .insert([materialData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a material
  async updateMaterial(id, updates) {
    const { data, error } = await supabase
      .from("materials")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a material
  async deleteMaterial(id) {
    const { error } = await supabase
      .from("materials")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Update stock quantity
  async updateStock(id, quantity, operation = "add", notes = "", orderId = null, unitCost = null) {
    // Get current stock and cost
    const { data: material } = await supabase
      .from("materials")
      .select("name, stock_quantity, cost_per_unit, min_stock_level")
      .eq("id", id)
      .single();

    const currentQuantity = parseFloat(material.stock_quantity);
    const currentCost = parseFloat(material.cost_per_unit);
    const minStock = parseFloat(material.min_stock_level || 0);

    const newQuantity =
      operation === "add"
        ? currentQuantity + parseFloat(quantity)
        : currentQuantity - parseFloat(quantity);

    // ... cost calculation logic ...

    // Check for low stock
    if (newQuantity <= minStock && currentQuantity > minStock) {
      // Only notify if we crossed the threshold downwards
      notificationService.notifyLowStock(material.name, newQuantity, minStock).catch(console.error);
    }

    // ... rest of the function ...

    // Calculate new cost per unit if restocking with a different price
    let newCostPerUnit = currentCost;
    if (operation === "add" && unitCost !== null && unitCost !== currentCost) {
      // Weighted average cost calculation
      const currentValue = currentQuantity * currentCost;
      const newStockValue = parseFloat(quantity) * parseFloat(unitCost);
      newCostPerUnit = (currentValue + newStockValue) / newQuantity;
    }

    // Prepare update object
    const updateData = {
      stock_quantity: newQuantity,
      last_restocked: operation === "add" ? new Date().toISOString() : undefined,
    };

    // Only update cost_per_unit if it changed
    if (newCostPerUnit !== currentCost) {
      updateData.cost_per_unit = newCostPerUnit;
    }

    const { data, error } = await supabase
      .from("materials")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Log transaction with order_id and unit_cost
    try {
      await supabase.from("inventory_transactions").insert([
        {
          material_id: id,
          quantity_change: operation === "add" ? quantity : -quantity,
          operation_type: operation === "add" ? "restock" : "usage",
          notes: notes,
          order_id: orderId,
          unit_cost: unitCost || currentCost, // Use provided cost or current cost
        },
      ]);
    } catch (logError) {
      console.error("Failed to log inventory transaction:", logError);
      // Don't fail the main operation if logging fails, but warn
    }

    return data;
  },

  // Get low stock materials
  async getLowStockMaterials() {
    // Supabase REST does not support column-to-column comparisons in filters.
    // Fetch materials and compute low-stock client-side.
    const { data: materials, error } = await supabase
      .from("materials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const lowStock = (materials || []).filter(
      (m) =>
        parseFloat(m.stock_quantity || 0) <= parseFloat(m.min_stock_level || 0)
    );

    return lowStock;
  },

  // Search materials
  async searchMaterials(searchTerm) {
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .or(
        `name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,supplier.ilike.%${searchTerm}%`
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get materials by category
  async getMaterialsByCategory(category) {
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .eq("category", category)
      .order("name");

    if (error) throw error;
    return data;
  },
  // Get transaction history for a material
  async getMaterialHistory(materialId) {
    const { data, error } = await supabase
      .from("inventory_transactions")
      .select("*")
      .eq("material_id", materialId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
};
