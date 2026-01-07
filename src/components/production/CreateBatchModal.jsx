import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, Package, Scissors } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import MaterialSelector from "../orders/MaterialSelector";
import { productionService } from "../../services/productionService";

const CreateBatchModal = ({ isOpen, onClose, onSuccess }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [useCustomProduct, setUseCustomProduct] = useState(false);
    const [customProductName, setCustomProductName] = useState("");
    const [selectedMaterials, setSelectedMaterials] = useState([]);
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
            setUseCustomProduct(false);
            setCustomProductName("");
            setSelectedMaterials([]);
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

        let productId = formData.product_id;

        // If using custom product, create it first
        if (useCustomProduct) {
            if (!customProductName.trim()) {
                toast.error("Please enter a product name");
                return;
            }

            try {
                const { data: newProduct, error: prodError } = await supabase
                    .from("products")
                    .insert([{
                        name: customProductName,
                        category: "custom",
                        base_price: 0
                    }])
                    .select()
                    .single();

                if (prodError) throw prodError;
                productId = newProduct.id;
                toast.success(`Created new product: ${customProductName}`);
            } catch (error) {
                console.error("Error creating product:", error);
                toast.error("Failed to create product");
                return;
            }
        } else if (!productId) {
            toast.error("Please select a product");
            return;
        }

        setLoading(true);

        try {
            const batchData = {
                product_id: productId,
                quantity: parseInt(formData.quantity),
                status: 'cutting',
                started_at: new Date().toISOString(),
                notes: formData.notes
            };

            // Use productionService to create batch with materials
            const result = await productionService.createBatchWithMaterials(
                batchData,
                selectedMaterials
            );

            const materialSummary = selectedMaterials.length > 0
                ? ` with ${selectedMaterials.length} material(s)`
                : '';

            toast.success(`Production batch created${materialSummary}!`);

            if (onSuccess) {
                onSuccess(result.batch);
            }
            onClose();
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
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Select Garment
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    setUseCustomProduct(!useCustomProduct);
                                    if (!useCustomProduct) {
                                        setFormData({ ...formData, product_id: "" });
                                    }
                                }}
                                className="text-xs text-primary hover:underline"
                            >
                                {useCustomProduct ? "Select from list" : "Create new product"}
                            </button>
                        </div>

                        {useCustomProduct ? (
                            <input
                                type="text"
                                value={customProductName}
                                onChange={(e) => setCustomProductName(e.target.value)}
                                placeholder="Enter new product name..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                required
                            />
                        ) : (
                            <select
                                value={formData.product_id}
                                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                                required={!useCustomProduct}
                            >
                                <option value="">Select a product...</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                            <Package size={14} />
                            <button
                                type="button"
                                onClick={() => {
                                    navigate("/products");
                                    onClose();
                                }}
                                className="hover:text-primary hover:underline"
                            >
                                Manage products in Products page
                            </button>
                        </div>
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

                    {/* Material Selection */}
                    <div className="border-t border-gray-200 pt-4 mt-2">
                        <div className="flex items-center gap-2 mb-3">
                            <Scissors size={18} className="text-primary" />
                            <h4 className="font-semibold text-gray-900">Materials (Optional)</h4>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Select materials to track inventory usage. Stock will be reduced automatically.
                        </p>
                        <MaterialSelector
                            selectedMaterials={selectedMaterials}
                            onChange={setSelectedMaterials}
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
