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
import { PageHeader } from "@/components/PageHeader";
import { PageSkeleton } from "@/components/PageSkeleton";

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
            default: return "bg-muted text-gray-800";
        }
    };

    return (
        <div className="space-y-5">
            <PageHeader title="Production Tracking" description="Manage garment production workflow">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                    <Plus size={16} />
                    <span>New Batch</span>
                </button>
            </PageHeader>

            {/* Efficiency Stats */}
            <div className="flex flex-wrap gap-3">
                <div className="bg-card p-4 rounded-lg border border-border shadow-sm relative overflow-hidden">
                    <p className="text-xs text-muted-foreground mb-0.5 font-medium">Avg. Stitching</p>
                    <p className="text-2xl font-bold text-foreground">{averages['stitching'] ? `${averages['stitching'].toFixed(1)}h` : "N/A"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Based on completed work</p>
                    <div className="absolute top-3.5 right-3.5 w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500">
                        <Clock size={16} />
                    </div>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border shadow-sm relative overflow-hidden">
                    <p className="text-xs text-muted-foreground mb-0.5 font-medium">Avg. Cutting</p>
                    <p className="text-2xl font-bold text-foreground">{averages['cutting'] ? `${averages['cutting'].toFixed(1)}h` : "N/A"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Efficiency baseline</p>
                    <div className="absolute top-3.5 right-3.5 w-9 h-9 rounded-lg flex items-center justify-center bg-orange-50 text-orange-500">
                        <Scissors size={16} />
                    </div>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border shadow-sm relative overflow-hidden">
                    <p className="text-xs text-muted-foreground mb-0.5 font-medium">Weekly Output</p>
                    <p className="text-2xl font-bold text-foreground">{batches.filter(b => b.status === 'completed' && new Date(b.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Completed this week</p>
                    <div className="absolute top-3.5 right-3.5 w-9 h-9 rounded-lg flex items-center justify-center bg-green-50 text-green-500">
                        <CheckCircle size={16} />
                    </div>
                </div>
                <div className={`bg-card p-4 rounded-lg border border-border shadow-sm relative overflow-hidden`}>
                    <p className="text-xs text-muted-foreground mb-0.5 font-medium">Bottlenecks</p>
                    <p className={`text-2xl font-bold ${bottlenecks.length > 0 ? "text-red-600" : "text-foreground"}`}>{bottlenecks.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Active delays flagged</p>
                    <div className={`absolute top-3.5 right-3.5 w-9 h-9 rounded-lg flex items-center justify-center ${bottlenecks.length > 0 ? "bg-red-50 text-red-500" : "bg-muted text-muted-foreground/60"}`}>
                        <AlertCircle size={16} />
                    </div>
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
            <div className="flex flex-col sm:flex-row gap-3 bg-card p-3 rounded-lg border border-border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        placeholder="Search by batch # or product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-background"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-background"
                    >
                        <option value="all">All Stages</option>
                        <option value="cutting">Cutting</option>
                        <option value="stitching">Stitching</option>
                        <option value="finishing">Finishing</option>
                        <option value="quality_check">Quality Check</option>
                        <option value="completed">Completed</option>
                    </select>
                    <button
                        onClick={fetchBatches}
                        className="p-2 border border-input rounded-md hover:bg-muted text-muted-foreground"
                        title="Refresh"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Production Batches List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-card rounded-lg border border-border p-4 space-y-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredBatches.map((batch) => (
                        <div
                            key={batch.id}
                            onClick={() => {
                                setSelectedBatch(batch);
                                setIsViewModalOpen(true);
                            }}
                            className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all p-3 cursor-pointer hover:border-primary/30 group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                    {batch.batch_number}
                                </span>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={batch.status}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => handleUpdateStatus(batch.id, e.target.value, batch)}
                                        className={`text-xs font-semibold px-2 py-1 rounded-full border-none focus:ring-0 focus:outline-none cursor-pointer appearance-none ${getStatusColor(batch.status)}`}
                                    >
                                        <option value="cutting">Cutting</option>
                                        <option value="stitching">Stitching</option>
                                        <option value="finishing">Finishing</option>
                                        <option value="quality_check">Checking</option>
                                        <option value="completed">Done</option>
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

                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden flex-shrink-0">
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
                                        className={`w-full h-full flex items-center justify-center text-muted-foreground ${batch.product?.image_url ? 'hidden' : 'flex'}`}
                                    >
                                        <Scissors size={16} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground text-xs line-clamp-1">{batch.product?.name || "Unknown Product"}</h3>
                                    <p className="text-[10px] text-muted-foreground">Qty: {batch.quantity}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-0.5 mb-2">
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>Progress</span>
                                    <span>{calculateProgress(batch.status)}%</span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500"
                                        style={{ width: `${calculateProgress(batch.status)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-2 border-t border-border">
                                <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    <span>{new Date(batch.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-card rounded-lg border border-dashed border-border">
                    <div className="mx-auto w-10 h-10 bg-muted rounded-full flex items-center justify-center mb-3">
                        <Scissors className="text-muted-foreground" size={18} />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">No active production batches</h3>
                    <p className="text-xs text-muted-foreground mt-1">Start a new batch to track garment production.</p>
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
                    <div className="bg-card rounded-lg shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertCircle className="text-red-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">Delete Production Batch?</h3>
                                    <p className="text-xs text-muted-foreground">This action cannot be undone</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-5">
                                Are you sure you want to delete batch <strong>{deleteConfirmBatch.batch_number}</strong> ({deleteConfirmBatch.product?.name})?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirmBatch(null)}
                                    className="flex-1 px-4 py-2 text-sm border border-border text-foreground rounded-md hover:bg-muted transition-colors"
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
