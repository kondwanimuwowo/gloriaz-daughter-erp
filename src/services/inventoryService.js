import { supabase } from "../lib/supabase";

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

  // Get material by ID
  async getMaterialById(id) {
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Add new material
  async addMaterial(material) {
    const { data, error } = await supabase
      .from("materials")
      .insert([material])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update material
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

  // Delete material
  async deleteMaterial(id) {
    const { error } = await supabase.from("materials").delete().eq("id", id);

    if (error) throw error;
  },

  // Update stock quantity
  async updateStock(id, quantity, operation = "add") {
    // Get current stock
    const { data: material } = await supabase
      .from("materials")
      .select("stock_quantity")
      .eq("id", id)
      .single();

    const newQuantity =
      operation === "add"
        ? parseFloat(material.stock_quantity) + parseFloat(quantity)
        : parseFloat(material.stock_quantity) - parseFloat(quantity);

    const { data, error } = await supabase
      .from("materials")
      .update({
        stock_quantity: newQuantity,
        last_restocked:
          operation === "add" ? new Date().toISOString() : undefined,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
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
};
