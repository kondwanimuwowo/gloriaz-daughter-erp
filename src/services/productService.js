import { supabase } from "../lib/supabase";

// Timeout wrapper with retry - prevents infinite loading after idle
const withTimeout = async (queryFn, timeoutMs = 10000, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await Promise.race([
        queryFn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
        )
      ]);
      return result;
    } catch (error) {
      if (attempt === retries) throw error;
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
};

export const productService = {
  // Get all active products (public - for catalog)
  async getAllProducts() {
    const { data, error } = await withTimeout(async () => {
      return supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("name");
    });

    if (error) throw error;
    return data;
  },

  // Get featured products (public - for catalog homepage)
  async getFeaturedProducts() {
    const { data, error } = await withTimeout(async () => {
      return supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(6);
    });

    if (error) throw error;
    return data || [];
  },

  // Get products by category (public)
  async getProductsByCategory(category) {
    const { data, error } = await withTimeout(async () => {
      return supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .eq("category", category)
        .order("name");
    });

    if (error) throw error;
    return data || [];
  },

  // Get product by ID with full details (public)
  async getProductById(id) {
    const { data, error } = await withTimeout(async () => {
      return supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("active", true)
        .single();
    });

    if (error) throw error;
    return data;
  },

  // Get related products (same category, different product)
  async getRelatedProducts(productId, category, limit = 4) {
    const { data, error } = await withTimeout(async () => {
      return supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .eq("category", category)
        .neq("id", productId)
        .limit(limit);
    });

    if (error) throw error;
    return data || [];
  },

  // Search products (public)
  async searchProducts(searchTerm) {
    const { data, error } = await withTimeout(async () => {
      return supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order("name");
    });

    if (error) throw error;
    return data || [];
  },

  // Get all unique categories
  async getCategories() {
    const { data, error } = await withTimeout(async () => {
      return supabase
        .from("products")
        .select("category")
        .eq("active", true);
    });

    if (error) throw error;
    
    // Extract unique categories
    const categories = [...new Set(data.map(p => p.category))].filter(Boolean);
    return categories;
  },
};

