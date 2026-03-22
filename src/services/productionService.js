import { supabase } from "../lib/supabase";

/**
 * Production Service
 * Handles production batch operations including material management
 */

export const productionService = {
    /**
     * Create a production batch with materials
     * @param {Object} batchData - Batch information
     * @param {Array} materials - Array of materials with {material_id, quantity_used, cost}
     * @returns {Object} Created batch with materials
     */
    async createBatchWithMaterials(batchData, materials = []) {
        try {
            // Validate material availability first
            if (materials.length > 0) {
                const validation = await this.validateMaterialAvailability(materials);
                if (!validation.valid) {
                    throw new Error(validation.message);
                }
            }

            // Create the batch
            const { data: batch, error: batchError } = await supabase
                .from("production_batches")
                .insert([batchData])
                .select()
                .single();

            if (batchError) throw batchError;

            // Fetch current user for logging
            const { data: { user } } = await supabase.auth.getUser();

            // Log batch creation
            await supabase.from("production_logs").insert([{
                batch_id: batch.id,
                user_id: user?.id,
                action: "batch_created",
                details: `Production batch ${batch.batch_number} created`,
                metadata: { quantity: batch.quantity, product_id: batch.product_id }
            }]);

            // If materials provided, link them and reduce stock
            if (materials.length > 0) {
                // Fetch material names for better logging
                const materialIds = materials.map(m => m.material_id);
                const { data: materialNames } = await supabase
                    .from("materials")
                    .select("id, name, unit")
                    .in("id", materialIds);

                // Insert production materials
                const productionMaterials = materials.map((m) => ({
                    batch_id: batch.id,
                    material_id: m.material_id,
                    quantity_used: m.quantity_used,
                    cost: m.cost,
                }));

                const { error: materialsError } = await supabase
                    .from("production_materials")
                    .insert(productionMaterials);

                if (materialsError) throw materialsError;

                // Log material additions
                const materialLogs = materials.map(m => {
                    const matInfo = materialNames?.find(mn => mn.id === m.material_id);
                    return {
                        batch_id: batch.id,
                        user_id: user?.id,
                        action: "material_added",
                        details: `Added ${m.quantity_used} ${matInfo?.unit || ''} of ${matInfo?.name || 'material'}`,
                        metadata: { material_id: m.material_id, quantity: m.quantity_used, cost: m.cost }
                    };
                });

                if (materialLogs.length > 0) {
                    await supabase.from("production_logs").insert(materialLogs);
                }

                // Reduce inventory stock for each material
                for (const material of materials) {
                    await this.updateInventoryStock(
                        material.material_id,
                        material.quantity_used
                    );
                }
            }

            return { batch, materials };
        } catch (error) {
            console.error("Error creating batch with materials:", error);
            throw error;
        }
    },

    /**
     * Get materials used in a production batch
     * @param {string} batchId - Batch ID
     * @returns {Array} Materials with details
     */
    async getBatchMaterials(batchId) {
        try {
            const { data, error } = await supabase
                .from("production_materials")
                .select(
                    `
          *,
          material:materials(id, name, unit, category)
        `
                )
                .eq("batch_id", batchId);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Error fetching batch materials:", error);
            throw error;
        }
    },

    /**
     * Update inventory stock (reduce by quantity used)
     * @param {string} materialId - Material ID
     * @param {number} quantityUsed - Quantity to reduce
     */
    async updateInventoryStock(materialId, quantityUsed) {
        try {
            // Get current stock
            const { data: material, error: fetchError } = await supabase
                .from("materials")
                .select("stock_quantity, name")
                .eq("id", materialId)
                .single();

            if (fetchError) throw fetchError;

            // Calculate new stock
            const newStock = parseFloat(material.stock_quantity) - parseFloat(quantityUsed);

            // Update stock
            const { error: updateError } = await supabase
                .from("materials")
                .update({ stock_quantity: newStock })
                .eq("id", materialId);

            if (updateError) throw updateError;

            // Record transaction
            await supabase.from("inventory_transactions").insert([
                {
                    material_id: materialId,
                    quantity_change: -parseFloat(quantityUsed),
                    operation_type: "production_use",
                    notes: `Used in production batch`,
                },
            ]);

            return { success: true, newStock };
        } catch (error) {
            console.error("Error updating inventory stock:", error);
            throw error;
        }
    },

    /**
     * Validate that sufficient materials are available
     * @param {Array} materials - Materials to validate
     * @returns {Object} Validation result
     */
    async validateMaterialAvailability(materials) {
        try {
            const materialIds = materials.map((m) => m.material_id);

            const { data: stockData, error } = await supabase
                .from("materials")
                .select("id, name, stock_quantity, unit")
                .in("id", materialIds);

            if (error) throw error;

            // Check each material
            for (const material of materials) {
                const stock = stockData.find((s) => s.id === material.material_id);
                if (!stock) {
                    return {
                        valid: false,
                        message: `Material not found in inventory`,
                    };
                }

                if (parseFloat(stock.stock_quantity) < parseFloat(material.quantity_used)) {
                    return {
                        valid: false,
                        message: `Insufficient stock for ${stock.name}. Available: ${stock.stock_quantity} ${stock.unit}, Required: ${material.quantity_used} ${stock.unit}`,
                    };
                }
            }

            return { valid: true };
        } catch (error) {
            console.error("Error validating material availability:", error);
            return {
                valid: false,
                message: "Error checking material availability",
            };
        }
    },

    /**
     * Get all production batches with materials
     * @returns {Array} Batches with material counts
     */
    async getAllBatchesWithMaterials() {
        try {
            const { data, error } = await supabase
                .from("production_batches")
                .select(
                    `
          *,
          product:products(name, image_url),
          materials:production_materials(count)
        `
                )
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Error fetching batches:", error);
            throw error;
        }
    },

    /**
     * Calculate total material cost for a batch
     * @param {string} batchId - Batch ID
     * @returns {number} Total cost
     */
    async getBatchMaterialCost(batchId) {
        try {
            const { data, error } = await supabase
                .from("production_materials")
                .select("cost")
                .eq("batch_id", batchId);

            if (error) throw error;

            const total = data.reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);
            return total;
        } catch (error) {
            console.error("Error calculating batch material cost:", error);
            return 0;
        }
    },

    /**
     * Update batch status and handle finished goods inventory
     * @param {string} batchId - Batch ID
     * @param {string} newStatus - New status
     */
    async updateBatchStatus(batchId, newStatus) {
        try {
            // Update status
            const { data: updatedBatch, error: updateError } = await supabase
                .from("production_batches")
                .update({ status: newStatus })
                .eq("id", batchId)
                .select(`
                    *,
                    product:products(id, name, base_price, product_type, stock_quantity)
                `)
                .single();

            if (updateError) throw updateError;

            // If completed, update the product to a finished good with stock
            if (newStatus === "completed") {
                await this.addFinishedGoodsToInventory(updatedBatch);
            }

            return updatedBatch;
        } catch (error) {
            console.error("Error updating batch status:", error);
            throw error;
        }
    },

    /**
     * When a batch completes, update the PRODUCT itself to be a finished good.
     * The product already has the correct base_price (selling price).
     * We add stock and calculate cost_per_unit from production materials.
     *
     * Single pathway: products table is the only destination.
     * The old DB trigger has been disabled (migration 009).
     */
    async addFinishedGoodsToInventory(batch) {
        try {
            if (!batch.product_id) {
                console.warn("Batch has no product_id, skipping finished goods update");
                return;
            }

            // Calculate actual production cost from materials used
            const materialCost = await this.getBatchMaterialCost(batch.id);
            const costPerUnit = batch.quantity > 0 ? materialCost / batch.quantity : 0;

            // Get current product state
            const currentStock = parseFloat(batch.product?.stock_quantity || 0);
            const newStock = currentStock + parseFloat(batch.quantity);

            // Update the product: mark as finished good, add stock
            const { error: updateError } = await supabase
                .from("products")
                .update({
                    product_type: "finished_good",
                    stock_quantity: newStock,
                    cost_per_unit: costPerUnit,
                    min_stock_level: Math.max(batch.product?.min_stock_level || 10, 5),
                    active: true,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", batch.product_id);

            if (updateError) throw updateError;
        } catch (error) {
            console.error("Error updating product as finished good:", error);
        }
    },
};
