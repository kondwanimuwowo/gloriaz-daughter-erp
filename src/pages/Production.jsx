import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, RefreshCw, Scissors, CheckCircle, AlertCircle, Clock, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import Layout from "../components/layout/Layout";
import CreateBatchModal from "../components/production/CreateBatchModal";
import BatchDetailsModal from "../components/production/BatchDetailsModal";
import { toast } from "react-hot-toast";
import { notificationService } from "../services/notificationService";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "../store/useAuthStore";
import { calculateProgress } from "../utils/productionUtils";
import { productionService } from "../services/productionService";
import { analyticsService } from "../services/analyticsService";
import { Badge } from "@/components/ui/badge";

const Production = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [deleteConfirmBatch, setDeleteConfirmBatch] = useState(null);
    const [bottlenecks, setBottlenecks] = useState([]);
    const [averages, setAverages] = useState({});
    const { profile } = useAuthStore();

    useEffect(() => {
        fetchBatches();
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [bottleneckData, averageData] = await Promise.all([
                analyticsService.getBottlenecks(),
                analyticsService.getAverageStageDurations()
            ]);
            setBottlenecks(bottleneckData);
            setAverages(averageData);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        }
    };

    const fetchBatches = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("production_batches")
                .select(`
          *,
          product:products(name, image_url),
          stages:production_stages(*)
        `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setBatches(data || []);
        } catch (error) {
            console.error("Error fetching batches:", error);
            toast.error("Failed to load production batches");
        } finally {
            setLoading(false);
        }
    };

    const filteredBatches = batches.filter((batch) => {
        const matchesSearch =
            batch.batch_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            batch.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || batch.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleUpdateStatus = async (batchId, newStatus, batch) => {
        try {
            // Use service to update status and handle inventory automation
            const updatedBatch = await productionService.updateBatchStatus(batchId, newStatus);

            setBatches(batches.map(b =>
                b.id === batchId ? { ...b, ...updatedBatch } : b
            ));

            toast.success(`Batch status updated to ${newStatus}`);

            // Notify if completed
            if (newStatus === "completed") {
                await notificationService.notifyProductionComplete(
                    batch.batch_number,
                    batch.product?.name || "Product",
                    batch.quantity
                );

                toast.success(`${batch.quantity} ${batch.product?.name || 'items'} added to finished goods inventory!`, {
                    icon: '📦',
                    duration: 5000
                });
            }
        } catch (error) {
            console.error("Error updating batch:", error);
            toast.error("Failed to update status");
        }
    };

    const handleDeleteBatch = async (batchId) => {
        try {
            const { error } = await supabase
                .from("production_batches")
                .delete()
                .eq("id", batchId);

            if (error) throw error;

            setBatches(batches.filter(b => b.id !== batchId));
            setDeleteConfirmBatch(null);
            toast.success("Production batch deleted successfully");
        } catch (error) {
            console.error("Error deleting batch:", error);
            toast.error("Failed to delete batch");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-800";
            case "quality_check": return "bg-purple-100 text-purple-800";
            case "finishing": return "bg-blue-100 text-blue-800";
            case "stitching": return "bg-yellow-100 text-yellow-800";
            case "cutting": return "bg-orange-100 text-orange-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Production Tracking</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage garment production workflow</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus size={20} />
                    <span>New Batch</span>
                </button>
            </div>

            {/* Efficiency Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="text-blue-500" size={20} />
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg. Stitching</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                        {averages['stitching'] ? `${averages['stitching'].toFixed(1)}h` : "N/A"}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Based on completed work</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <Scissors className="text-orange-500" size={20} />
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg. Cutting</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                        {averages['cutting'] ? `${averages['cutting'].toFixed(1)}h` : "N/A"}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Efficiency baseline</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="text-green-500" size={20} />
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Weekly Output</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                        {batches.filter(b => b.status === 'completed' && new Date(b.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Completed this week</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <AlertCircle className={bottlenecks.length > 0 ? "text-red-500" : "text-slate-300"} size={20} />
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bottlenecks</span>
                    </div>
                    <div className={`text-2xl font-bold ${bottlenecks.length > 0 ? "text-red-600" : "text-slate-900"}`}>
                        {bottlenecks.length}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Active delays flagged</p>
                </div>
            </div>

            {/* Bottleneck Alerts */}
            {bottlenecks.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
                        <AlertCircle size={18} />
                        <span>Workshop Bottlenecks Detected</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {bottlenecks.map(b => (
                            <Badge key={b.id} variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200 py-1 px-3">
                                Batch {b.batch_number}: {b.stage_name} ({b.current_duration}h vs avg {b.average_duration || '??'}h)
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by batch # or product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                    >
                        <option value="all">All Stages</option>
                        <option value="cutting">✂️ Cutting</option>
                        <option value="stitching">🧵 Stitching</option>
                        <option value="finishing">✨ Finishing</option>
                        <option value="quality_check">🔍 Quality Check</option>
                        <option value="completed">✅ Completed</option>
                    </select>
                    <button
                        onClick={fetchBatches}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
                        title="Refresh"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Production Batches List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
                            <div className="flex justify-between">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                            <div className="flex gap-3">
                                <Skeleton className="w-12 h-12 rounded-lg" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-2 w-full" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredBatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBatches.map((batch) => (
                        <div
                            key={batch.id}
                            onClick={() => {
                                setSelectedBatch(batch);
                                setIsViewModalOpen(true);
                            }}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 cursor-pointer hover:border-primary/30 group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                                    {batch.batch_number}
                                </span>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={batch.status}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => handleUpdateStatus(batch.id, e.target.value, batch)}
                                        className={`text-xs font-semibold px-2 py-1 rounded-full border-none focus:ring-0 focus:outline-none cursor-pointer appearance-none ${getStatusColor(batch.status)}`}
                                    >
                                        <option value="cutting">✂️ Cutting</option>
                                        <option value="stitching">🧵 Stitching</option>
                                        <option value="finishing">✨ Finishing</option>
                                        <option value="quality_check">🔍 Checking</option>
                                        <option value="completed">✅ Done</option>
                                    </select>
                                    {profile?.role === "admin" && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteConfirmBatch(batch);
                                            }}
                                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700 transition-colors"
                                            title="Delete batch"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {batch.product?.image_url ? (
                                        <img
                                            src={batch.product.image_url}
                                            alt={batch.product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className={`w-full h-full flex items-center justify-center text-gray-400 ${batch.product?.image_url ? 'hidden' : 'flex'}`}
                                    >
                                        <Scissors size={20} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 line-clamp-1">{batch.product?.name || "Unknown Product"}</h3>
                                    <p className="text-sm text-gray-500">Qty: {batch.quantity}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-1 mb-4">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Progress</span>
                                    <span>{calculateProgress(batch.status)}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500"
                                        style={{ width: `${calculateProgress(batch.status)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm text-gray-500 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    <span>{new Date(batch.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Scissors className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No active production batches</h3>
                    <p className="text-gray-500 mt-1">Start a new batch to track garment production.</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-4 text-primary font-semibold hover:underline"
                    >
                        Create your first batch
                    </button>
                </div>
            )}

            {/* Create Batch Modal */}
            <CreateBatchModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                    fetchBatches();
                }}
            />

            {/* Delete Confirmation Dialog */}
            {deleteConfirmBatch && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertCircle className="text-red-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Delete Production Batch?</h3>
                                    <p className="text-sm text-gray-500">Item will be moved to recycle bin</p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete batch <strong>{deleteConfirmBatch.batch_number}</strong> ({deleteConfirmBatch.product?.name})?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirmBatch(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteBatch(deleteConfirmBatch.id)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    Delete Batch
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <BatchDetailsModal
                isOpen={isViewModalOpen}
                audio={false}
                onClose={() => setIsViewModalOpen(false)}
                batch={selectedBatch}
                onStatusUpdate={(id, status, batch) => {
                    handleUpdateStatus(id, status, batch);
                    setIsViewModalOpen(false);
                }}
            />
        </div>
    );
};

export default Production;
