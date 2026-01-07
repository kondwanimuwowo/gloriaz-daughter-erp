import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
    Bell,
    Check,
    CheckCheck as CheckDouble,
    Trash2,
    Calendar,
    AlertCircle,
    Package,
    ShoppingCart
} from "lucide-react";
import { useNotificationStore } from "../store/useNotificationStore";
import { notificationService } from "../services/notificationService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
    const navigate = useNavigate();
    const {
        notifications,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    } = useNotificationStore();

    const [filter, setFilter] = useState("all"); // "all", "unread"

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("Failed to mark all as read:", error);
            toast.error("Failed to update notifications");
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            await notificationService.deleteNotification(id);
            fetchNotifications(); // Refresh list
            toast.success("Notification deleted");
        } catch (error) {
            console.error("Failed to delete notification:", error);
            toast.error("Failed to delete notification");
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === "unread") return !n.read;
        return true;
    });

    const getIcon = (type) => {
        switch (type) {
            case "low_stock": return <AlertCircle className="text-red-500" />;
            case "production_complete": return <Package className="text-green-500" />;
            case "order_update": return <ShoppingCart className="text-blue-500" />;
            default: return <Bell className="text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-sm text-gray-500 mt-1">Stay updated with system alerts and activities</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "all"
                            ? "bg-primary text-primary-foreground"
                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter("unread")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "unread"
                            ? "bg-primary text-primary-foreground"
                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                            }`}
                    >
                        Unread
                    </button>
                    {notifications.some(n => !n.read) && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-600 hover:text-primary border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors ml-2"
                        >
                            <CheckDouble size={16} />
                            <span>Mark all read</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {filteredNotifications.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer group ${!notification.read ? "bg-blue-50/40" : ""
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!notification.read ? "bg-white shadow-sm" : "bg-gray-100"
                                    }`}>
                                    {getIcon(notification.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`text-sm font-semibold ${!notification.read ? "text-gray-900" : "text-gray-700"
                                            }`}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap ml-2">
                                            <Calendar size={12} />
                                            {format(new Date(notification.created_at), "MMM d, h:mm a")}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                        {notification.message}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => handleDelete(e, notification.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete notification"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
                        <p className="text-gray-500 mt-1">
                            {filter === "unread"
                                ? "You're all caught up! No unread messages."
                                : "You don't have any notifications properly."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
