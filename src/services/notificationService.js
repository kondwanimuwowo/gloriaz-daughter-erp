import { supabase } from "../lib/supabase";

export const notificationService = {
    // Create a new notification
    async createNotification(type, title, message, link = null, userId = null) {
        const { data, error } = await supabase
            .from("notifications")
            .insert([
                {
                    user_id: userId,
                    type,
                    title,
                    message,
                    link,
                },
            ])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Get all notifications for the current user
    async getUserNotifications(limit = 50) {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .or(`user_id.eq.${user.id},user_id.is.null`)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    // Get unread notifications count
    async getUnreadCount() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return 0;

        const { count, error } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .or(`user_id.eq.${user.id},user_id.is.null`)
            .eq("read", false);

        if (error) throw error;
        return count || 0;
    },

    // Mark a notification as read
    async markAsRead(notificationId) {
        const { data, error } = await supabase
            .from("notifications")
            .update({ read: true })
            .eq("id", notificationId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Mark all notifications as read
    async markAllAsRead() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase
            .from("notifications")
            .update({ read: true })
            .eq("user_id", user.id)
            .eq("read", false);

        if (error) throw error;
    },

    // Delete a notification
    async deleteNotification(notificationId) {
        const { error } = await supabase
            .from("notifications")
            .delete()
            .eq("id", notificationId);

        if (error) throw error;
    },

    // Subscribe to real-time notifications
    subscribeToNotifications(callback) {
        const channel = supabase
            .channel("notifications")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "notifications",
                },
                (payload) => {
                    callback(payload);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },

    // Helper: Create low stock notification
    async notifyLowStock(materialName, currentStock, minStock) {
        return this.createNotification(
            "low_stock",
            "⚠️ Low Stock Alert",
            `${materialName} is running low (${currentStock} ${currentStock === 1 ? "unit" : "units"
            } remaining, minimum: ${minStock})`,
            "/inventory"
        );
    },

    // Helper: Create order update notification
    async notifyOrderUpdate(orderNumber, status, customerId = null) {
        const statusMessages = {
            completed: "✅ Order completed and ready for delivery",
            delivered: "🎉 Order has been delivered to customer",
            cancelled: "❌ Order has been cancelled",
        };

        const message =
            statusMessages[status] || `Order status updated to ${status}`;

        return this.createNotification(
            "order_update",
            `Order ${orderNumber}`,
            message,
            `/orders`,
            customerId
        );
    },

    // Helper: Create production complete notification
    async notifyProductionComplete(batchNumber, productName, quantity) {
        return this.createNotification(
            "production_complete",
            "🎉 Production Batch Complete",
            `Batch ${batchNumber} (${productName}) - ${quantity} pieces completed and added to inventory`,
            "/production"
        );
    },
};
