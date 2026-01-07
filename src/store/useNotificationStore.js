import { create } from "zustand";
import { notificationService } from "../services/notificationService";
import toast from "react-hot-toast";

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    subscription: null,

    // Fetch all notifications
    fetchNotifications: async () => {
        set({ loading: true, error: null });
        try {
            const notifications = await notificationService.getUserNotifications();
            const unreadCount = notifications.filter((n) => !n.read).length;
            set({ notifications, unreadCount, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error("Failed to fetch notifications:", error);
        }
    },

    // Fetch unread count only
    fetchUnreadCount: async () => {
        try {
            const unreadCount = await notificationService.getUnreadCount();
            set({ unreadCount });
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        }
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        try {
            // Update in database first
            await notificationService.markAsRead(notificationId);

            // Only update local state after successful database update
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n.id === notificationId ? { ...n, read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            toast.error("Failed to mark as read");
            throw error; // Re-throw to allow caller to handle
        }
    },

    // Mark all as read
    markAllAsRead: async () => {
        try {
            await notificationService.markAllAsRead();
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, read: true })),
                unreadCount: 0,
            }));
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("Failed to mark all as read:", error);
            toast.error("Failed to mark all as read");
        }
    },

    // Delete notification
    deleteNotification: async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            set((state) => {
                const notification = state.notifications.find(
                    (n) => n.id === notificationId
                );
                const wasUnread = notification && !notification.read;
                return {
                    notifications: state.notifications.filter(
                        (n) => n.id !== notificationId
                    ),
                    unreadCount: wasUnread
                        ? Math.max(0, state.unreadCount - 1)
                        : state.unreadCount,
                };
            });
            toast.success("Notification deleted");
        } catch (error) {
            console.error("Failed to delete notification:", error);
            toast.error("Failed to delete notification");
        }
    },

    // Subscribe to real-time updates
    subscribeToNotifications: () => {
        const unsubscribe = notificationService.subscribeToNotifications(
            (payload) => {
                const { eventType, new: newRecord, old: oldRecord } = payload;

                if (eventType === "INSERT") {
                    set((state) => ({
                        notifications: [newRecord, ...state.notifications],
                        unreadCount: newRecord.read
                            ? state.unreadCount
                            : state.unreadCount + 1,
                    }));
                    // Show toast for new notification
                    toast(newRecord.title, {
                        icon: "🔔",
                        duration: 4000,
                    });
                } else if (eventType === "UPDATE") {
                    set((state) => ({
                        notifications: state.notifications.map((n) =>
                            n.id === newRecord.id ? newRecord : n
                        ),
                        unreadCount:
                            !oldRecord.read && newRecord.read
                                ? Math.max(0, state.unreadCount - 1)
                                : state.unreadCount,
                    }));
                } else if (eventType === "DELETE") {
                    set((state) => {
                        const wasUnread = !oldRecord.read;
                        return {
                            notifications: state.notifications.filter(
                                (n) => n.id !== oldRecord.id
                            ),
                            unreadCount: wasUnread
                                ? Math.max(0, state.unreadCount - 1)
                                : state.unreadCount,
                        };
                    });
                }
            }
        );

        set({ subscription: unsubscribe });
    },

    // Unsubscribe from real-time updates
    unsubscribeFromNotifications: () => {
        const { subscription } = get();
        if (subscription) {
            subscription();
            set({ subscription: null });
        }
    },
}));
