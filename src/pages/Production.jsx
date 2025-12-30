import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, RefreshCw, Scissors, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { supabase } from "../lib/supabase";
import Layout from "../components/layout/Layout";
// import ProductionBatchCard from "../components/production/ProductionBatchCard";
import CreateBatchModal from "../components/production/CreateBatchModal";
import BatchDetailsModal from "../components/production/BatchDetailsModal";
import { toast } from "react-hot-toast";
import { notificationService } from "../services/notificationService";

const Production = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    useEffect(() => {
        fetchBatches();
    }, []);

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
            const { error } = await supabase
                .from("production_batches")
                .update({ status: newStatus })
                .eq("id", batchId);

            if (error) throw error;

            setBatches(batches.map(b =>
                b.id === batchId ? { ...b, status: newStatus } : b
            ));

            toast.success(`Batch status updated to ${newStatus}`);

            // Notify if completed
            if (newStatus === "completed") {
                await notificationService.notifyProductionComplete(
                    batch.batch_number,
                    batch.product?.name || "Product",
                    batch.quantity
                );
            }
        } catch (error) {
            console.error("Error updating batch:", error);
            toast.error("Failed to update status");
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
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                                    <span>
                                        {batch.status === 'completed' ? '100%' :
                                            batch.status === 'quality_check' ? '80%' :
                                                batch.status === 'finishing' ? '60%' :
                                                    batch.status === 'stitching' ? '40%' : '20%'}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500"
                                        style={{
                                            width: batch.status === 'completed' ? '100%' :
                                                batch.status === 'quality_check' ? '80%' :
                                                    batch.status === 'finishing' ? '60%' :
                                                        batch.status === 'stitching' ? '40%' : '20%'
                                        }}
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
