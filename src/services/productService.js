import { supabase } from "../lib/supabase";

export const productService = {
  // Get all active products
  async getAllProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .is("deleted_at", null)
      .order("name");

    if (error) throw error;
    return data;
  },

  // Get product by ID
  async getProductById(id) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (error) throw error;
    return data;
  },

  // Soft delete product
  async deleteProduct(id) {
    const { error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },

  // Restore product
  async restoreProduct(id) {
    const { error } = await supabase
      .from("products")
      .update({ deleted_at: null })
      .eq("id", id);

    if (error) throw error;
  },
  // Permanent Delete (Hard Delete)
  async permanentDeleteProduct(id) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },
};
