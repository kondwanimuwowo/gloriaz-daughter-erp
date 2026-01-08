import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Trash2,
    RefreshCw,
    Search,
    AlertTriangle,
    Package,
    ShoppingCart,
    Users,
    Scissors,
    Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { orderService } from "../services/orderService";
import { customerService } from "../services/customerService";
import { productService } from "../services/productService";
import { productionService } from "../services/productionService";
import { getZambianDate } from "../utils/dateUtils";

export default function RecycleBin() {
    const [activeTab, setActiveTab] = useState("orders");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    const tabs = [
        { id: "orders", label: "Orders", icon: ShoppingCart },
        { id: "customers", label: "Customers", icon: Users },
        { id: "products", label: "Products", icon: Package },
        { id: "batches", label: "Production Batches", icon: Scissors },
    ];

    useEffect(() => {
        fetchDeletedItems();
    }, [activeTab]);

    const fetchDeletedItems = async () => {
        setLoading(true);
        setItems([]);
        try {
            let query;

            switch (activeTab) {
                case "orders":
                    query = supabase
                        .from("orders")
                        .select("*")
                        .not("deleted_at", "is", null)
                        .order("deleted_at", { ascending: false });
                    break;
                case "customers":
                    query = supabase
                        .from("customers")
                        .select("*")
                        .not("deleted_at", "is", null)
                        .order("deleted_at", { ascending: false });
                    break;
                case "products":
                    query = supabase
                        .from("products")
                        .select("*")
                        .not("deleted_at", "is", null)
                        .order("deleted_at", { ascending: false });
                    break;
                case "batches":
                    query = supabase
                        .from("production_batches")
                        .select("*, product:products(name)")
                        .not("deleted_at", "is", null)
                        .order("deleted_at", { ascending: false });
                    break;
                default:
                    return;
            }

            const { data, error } = await query;
            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error("Error fetching deleted items:", error);
            toast.error("Failed to load deleted items");
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id, type) => {
        if (!window.confirm("Are you sure you want to restore this item?")) return;

        setActionLoading(id);
        try {
            switch (activeTab) {
                case "orders":
                    await orderService.restoreOrder(id);
                    break;
                case "customers":
                    await customerService.restoreCustomer(id);
                    break;
                case "products":
                    await productService.restoreProduct(id);
                    break;
                case "batches":
                    await productionService.restoreBatch(id);
                    break;
            }
            toast.success("Item restored successfully");
            fetchDeletedItems(); // Refresh list
        } catch (error) {
            console.error("Error restoring item:", error);
            toast.error("Failed to restore item");
        } finally {
            setActionLoading(null);
        }
    };

    const handlePermanentDelete = async (id) => {
        if (
            !window.confirm(
                "WARNING: This action cannot be undone. Are you sure you want to PERMANENTLY delete this item?"
            )
        )
            return;

        setActionLoading(id);
        try {
            switch (activeTab) {
                case "orders":
                    await orderService.permanentDeleteOrder(id);
                    break;
                case "customers":
                    await customerService.permanentDeleteCustomer(id);
                    break;
                case "products":
                    await productService.permanentDeleteProduct(id);
                    break;
                case "batches":
                    await productionService.permanentDeleteBatch(id);
                    break;
            }
            toast.success("Item permanently deleted");
            fetchDeletedItems(); // Refresh list
        } catch (error) {
            console.error("Error deleting item:", error);
            toast.error("Failed to delete item");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredItems = items.filter((item) => {
        const search = searchTerm.toLowerCase();
        if (activeTab === "orders") {
            return (
                item.order_number?.toLowerCase().includes(search) ||
                item.description?.toLowerCase().includes(search)
            );
        } else if (activeTab === "customers") {
            return (
                item.name?.toLowerCase().includes(search) ||
                item.email?.toLowerCase().includes(search)
            );
        } else if (activeTab === "products") {
            return item.name?.toLowerCase().includes(search);
        } else if (activeTab === "batches") {
            return (
                item.batch_number?.toLowerCase().includes(search) ||
                item.product?.name?.toLowerCase().includes(search)
            );
        }
        return true;
    });

    const getDisplayInfo = (item) => {
        switch (activeTab) {
            case "orders":
                return {
                    title: item.order_number,
                    subtitle: item.description || "No description",
                    details: `Date: ${getZambianDate(item.created_at)}`,
                };
            case "customers":
                return {
                    title: item.name,
                    subtitle: item.email || item.phone,
                    details: item.address || "No address",
                };
            case "products":
                return {
                    title: item.name,
                    subtitle: item.category,
                    details: `Price: ${item.base_price}`,
                };
            case "batches":
                return {
                    title: item.batch_number,
                    subtitle: item.product?.name || "Unknown Product",
                    details: `Qty: ${item.quantity} | Status: ${item.status}`,
                };
            default:
                return { title: "Unknown", subtitle: "", details: "" };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
                        <Trash2 className="text-primary" />
                        Recycle Bin
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Restore deleted items or permanently remove them.
                    </p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search deleted items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 p-1 bg-muted/30 rounded-lg border border-border/50">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium whitespace-nowrap ${activeTab === tab.id
                                ? "bg-primary text-white shadow-sm"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-card rounded-xl border border-border overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="ml-2">Loading...</span>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <Trash2 className="w-12 h-12 mb-4 opacity-20" />
                        <p>No deleted items found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/30 border-b border-border/50 text-left">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                        Item Details
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                        Deleted At
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {filteredItems.map((item) => {
                                    const info = getDisplayInfo(item);
                                    return (
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            key={item.id}
                                            className="group hover:bg-muted/20 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-foreground">
                                                        {info.title}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {info.subtitle}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground/70 mt-1">
                                                        {info.details}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {getZambianDate(item.deleted_at)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleRestore(item.id)}
                                                        disabled={actionLoading === item.id}
                                                        className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors tooltip"
                                                        title="Restore"
                                                    >
                                                        {actionLoading === item.id ? (
                                                            <Loader2 size={18} className="animate-spin" />
                                                        ) : (
                                                            <RefreshCw size={18} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handlePermanentDelete(item.id)}
                                                        disabled={actionLoading === item.id}
                                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors tooltip"
                                                        title="Delete Permanently"
                                                    >
                                                        {actionLoading === item.id ? (
                                                            <Loader2 size={18} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={18} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-blue-600/80">
                    <p className="font-semibold mb-1">About Recycle Bin</p>
                    <p>
                        Items in the recycle bin are automatically permanently deleted after
                        10 days. Restoring an item will make it visible again in the main
                        lists.
                    </p>
                </div>
            </div>
        </div>
    );
}
