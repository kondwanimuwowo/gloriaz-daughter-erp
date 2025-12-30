import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";

const CreateBatchModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        product_id: "",
        quantity: 1,
        notes: ""
    });

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
            // Reset form
            setFormData({
                product_id: "",
                quantity: 1,
                notes: ""
            });
        }
    }, [isOpen]);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from("products")
                .select("id, name, base_price")
                .order("name");

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Failed to load products");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.product_id) {
            toast.error("Please select a product");
            return;
        }

        try {
            setLoading(true);

            // Create the batch
            // Trigger will handle batch number generation
            const { data: batch, error: batchError } = await supabase
                .from("production_batches")
                .insert([{
                    product_id: formData.product_id,
                    quantity: parseInt(formData.quantity),
                    status: 'cutting',
                    started_at: new Date().toISOString(),
                    notes: formData.notes
                }])
                .select()
                .single();

            if (batchError) throw batchError;

            // Create initial stages
            const stages = [
                { batch_id: batch.id, stage_name: 'cutting', status: 'in_progress', started_at: new Date().toISOString() },
                { batch_id: batch.id, stage_name: 'stitching', status: 'pending' },
                { batch_id: batch.id, stage_name: 'finishing', status: 'pending' },
                { batch_id: batch.id, stage_name: 'quality_check', status: 'pending' }
            ];

            const { error: stagesError } = await supabase
                .from("production_stages")
                .insert(stages);

            if (stagesError) throw stagesError;

            toast.success("Production batch created!");
            onSuccess();
        } catch (error) {
            console.error("Error creating batch:", error);
            toast.error(error.message || "Failed to create batch");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">New Production Batch</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Garment
                        </label>
                        <select
                            value={formData.product_id}
                            onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                            required
                        >
                            <option value="">Select a product...</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity to Produce
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes (Optional)
                        </label>
                        <textarea
                            rows="3"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                            placeholder="Special instructions, priority, etc."
                        />
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg flex gap-2 items-start text-sm text-blue-700">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <p>
                            This will automatically generate production stages (Cutting, Stitching, Finishing, QC) and assign a unique batch number.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>Start Production</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBatchModal;
