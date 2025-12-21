import { supabase } from "../lib/supabase";

export const productService = {
  // Get all active products
  async getAllProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
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
    return data;
  },
};
