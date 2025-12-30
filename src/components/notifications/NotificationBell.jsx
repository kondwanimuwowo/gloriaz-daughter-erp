import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useNotificationStore } from "../../store/useNotificationStore";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../ui/popover";
import { Button } from "../ui/button";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const {
        notifications,
        unreadCount,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        subscribeToNotifications,
        unsubscribeFromNotifications,
    } = useNotificationStore();

    // Fetch notifications on mount and subscribe to real-time updates
    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
        subscribeToNotifications();

        return () => {
            unsubscribeFromNotifications();
        };
    }, []);

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
        setOpen(false);
    };

    const recentNotifications = notifications.slice(0, 5);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                            {unreadCount} unread
                        </span>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {recentNotifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {recentNotifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${!notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {!notification.read && (
                                            <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm mb-1">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(new Date(notification.created_at), {
                                                    addSuffix: true,
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="p-2 border-t">
                        <Button
                            variant="ghost"
                            className="w-full text-sm"
                            onClick={() => {
                                navigate("/notifications");
                                setOpen(false);
                            }}
                        >
                            View All Notifications
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
