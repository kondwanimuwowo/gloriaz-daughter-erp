/**
 * Migration Service
 * Utilities for managing the finished goods consolidation migration
 * from materials table to products table
 */

import { supabase } from "@/lib/supabase";

/**
 * Verify migration completion
 * Checks that finished goods have been properly migrated
 */
export async function verifyMigration() {
  try {
    // Count finished products in materials table
    const { data: materialsFinished, error: materialError } = await supabase
      .from("materials")
      .select("*", { count: "exact" })
      .eq("material_type", "finished_product")
      .is("deleted_at", null);

    if (materialError) throw materialError;

    // Count finished goods in products table
    const { data: productsFinished, error: productError } = await supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("product_type", "finished_good")
      .is("deleted_at", null);

    if (productError) throw productError;

    return {
      success: true,
      stats: {
        finishedGoodsInMaterials: materialsFinished?.length || 0,
        finishedGoodsInProducts: productsFinished?.length || 0,
        migrationComplete:
          (productsFinished?.length || 0) >= (materialsFinished?.length || 0),
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Migration verification failed:", error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get a summary of product inventory by type
 */
export async function getInventorySummary() {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("product_type, COUNT(*) as count, SUM(stock_quantity) as total_stock", {
        count: "exact",
      })
      .is("deleted_at", null)
      .group_by("product_type");

    if (error) throw error;

    const summary = {
      custom_designs: 0,
      finished_goods: 0,
      total_stock: 0,
    };

    products?.forEach((row) => {
      if (row.product_type === "custom_design") {
        summary.custom_designs = row.count;
      } else if (row.product_type === "finished_good") {
        summary.finished_goods = row.count;
        summary.total_stock = row.total_stock || 0;
      }
    });

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    console.error("Failed to get inventory summary:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check for low stock items
 * Returns finished goods below minimum stock level
 */
export async function getLowStockItems() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, stock_quantity, min_stock_level, category")
      .eq("product_type", "finished_good")
      .eq("active", true)
      .is("deleted_at", null)
      .lte("stock_quantity", "min_stock_level")
      .order("stock_quantity", { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      count: data?.length || 0,
    };
  } catch (error) {
    console.error("Failed to get low stock items:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get finished goods that are out of stock
 */
export async function getOutOfStockItems() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, stock_quantity, category")
      .eq("product_type", "finished_good")
      .eq("active", true)
      .is("deleted_at", null)
      .eq("stock_quantity", 0)
      .order("name");

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      count: data?.length || 0,
    };
  } catch (error) {
    console.error("Failed to get out of stock items:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Update stock for a finished good
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 */
export async function updateStock(productId, quantity) {
  try {
    if (quantity < 0) {
      throw new Error("Stock quantity cannot be negative");
    }

    const { data, error } = await supabase
      .from("products")
      .update({
        stock_quantity: quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .eq("product_type", "finished_good")
      .select();

    if (error) throw error;

    return {
      success: true,
      data: data?.[0] || null,
    };
  } catch (error) {
    console.error("Failed to update stock:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Adjust stock by delta (add or subtract)
 * @param {string} productId - Product ID
 * @param {number} delta - Amount to add (positive) or subtract (negative)
 */
export async function adjustStock(productId, delta) {
  try {
    if (!delta) {
      throw new Error("Delta must be non-zero");
    }

    // Get current stock first
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", productId)
      .eq("product_type", "finished_good")
      .single();

    if (fetchError) throw fetchError;
    if (!product) throw new Error("Product not found");

    const newQuantity = (product.stock_quantity || 0) + delta;

    if (newQuantity < 0) {
      throw new Error("Adjustment would result in negative stock");
    }

    return updateStock(productId, newQuantity);
  } catch (error) {
    console.error("Failed to adjust stock:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export default {
  verifyMigration,
  getInventorySummary,
  getLowStockItems,
  getOutOfStockItems,
  updateStock,
  adjustStock,
};
