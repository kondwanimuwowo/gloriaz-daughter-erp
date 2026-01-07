import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Package, Tag, DollarSign, Image as ImageIcon, Filter } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        category: "standard",
        description: "",
        base_price: 0,
        estimated_days: 7,
        image_url: ""
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .order("name");

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category: product.category || "standard",
                description: product.description || "",
                base_price: product.base_price,
                estimated_days: product.estimated_days || 7,
                image_url: product.image_url || ""
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: "",
                category: "standard",
                description: "",
                base_price: 0,
                estimated_days: 7,
                image_url: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                const { error } = await supabase
                    .from("products")
                    .update(formData)
                    .eq("id", editingProduct.id);
                if (error) throw error;
                toast.success("Product updated successfully");
            } else {
                const { error } = await supabase
                    .from("products")
                    .insert([formData]);
                if (error) throw error;
                toast.success("Product created successfully");
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            console.error("Error saving product:", error);
            toast.error("Failed to save product");
        }
    };

    const handleDelete = async (id) => {
        try {
            const { error } = await supabase
                .from("products")
                .delete()
                .eq("id", id);
            if (error) throw error;
            toast.success("Product deleted");
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Failed to delete product");
        } finally {
            setDeleteId(null);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Products Catalog</h1>
                    <p className="text-slate-500 mt-1">Manage standard garment designs and offerings</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 gap-2">
                    <Plus size={20} />
                    Add Product
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border shadow-sm max-w-md">
                <Search className="text-slate-400 ml-2" size={20} />
                <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-none focus-visible:ring-0"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        onClick={() => handleOpenModal(product)}
                        className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full cursor-pointer hover:border-primary/50"
                    >
                        <div className="aspect-video bg-slate-100 relative overflow-hidden">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center text-slate-300 bg-slate-50 ${product.image_url ? 'hidden' : 'flex'}`}>
                                <ImageIcon size={48} />
                            </div>

                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenModal(product)}
                                    className="p-2 bg-white/90 text-slate-700 rounded-lg hover:text-primary shadow-sm"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => setDeleteId(product.id)}
                                    className="p-2 bg-white/90 text-red-600 rounded-lg hover:bg-red-50 shadow-sm"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="absolute bottom-3 left-3">
                                <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wide">
                                    {product.category}
                                </span>
                            </div>
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-2 gap-2">
                                <h3 className="font-bold text-lg text-slate-900 leading-tight">{product.name}</h3>
                                <span className="font-bold text-primary whitespace-nowrap">
                                    K{parseFloat(product.base_price).toFixed(2)}
                                </span>
                            </div>

                            <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">
                                {product.description || "No description provided."}
                            </p>

                            <div className="pt-4 border-t flex items-center justify-between text-xs text-slate-400">
                                <div className="flex items-center gap-1">
                                    <Tag size={12} />
                                    <span>Est. {product.estimated_days} days</span>
                                </div>
                                <span>Updated {new Date(product.updated_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed">
                    <Package className="mx-auto text-slate-300 mb-3" size={48} />
                    <h3 className="text-lg font-medium text-slate-900">No products found</h3>
                    <p className="text-slate-500">Create your first product directly or import from inventory.</p>
                </div>
            )}

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? "Edit Product" : "Create New Product"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Product Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g. Summer Chitenge Dress"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <select
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="standard">Standard</option>
                                    <option value="custom">Custom</option>
                                    <option value="premium">Premium</option>
                                    <option value="uniform">Uniform</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Base Price (K)</Label>
                                <Input
                                    type="number"
                                    value={formData.base_price}
                                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                                    required
                                    min="0"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Details about materials, sizing, etc."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Image URL (Optional)</Label>
                            <Input
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Est. Production Days</Label>
                            <Input
                                type="number"
                                value={formData.estimated_days}
                                onChange={(e) => setFormData({ ...formData, estimated_days: e.target.value })}
                                min="1"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Product</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product?</DialogTitle>
                    </DialogHeader>
                    <p className="text-slate-600">
                        Are you sure you want to delete this product? This action cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => handleDelete(deleteId)}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Products;
