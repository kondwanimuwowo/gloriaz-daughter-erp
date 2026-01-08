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
    const [isViewMode, setIsViewMode] = useState(true);
    const [deleteId, setDeleteId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        category: "standard",
        description: "",
        base_price: 0,
        labor_cost: 0,
        estimated_days: 7,
        image_url: "",
        gallery_images: []
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

    const handleOpenModal = (product = null, viewMode = true) => {
        setIsViewMode(viewMode);
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category: product.category || "standard",
                description: product.description || "",
                base_price: product.base_price,
                labor_cost: product.labor_cost || 0,
                estimated_days: product.estimated_days || 7,
                image_url: product.image_url || "",
                gallery_images: product.gallery_images || []
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: "",
                category: "standard",
                description: "",
                base_price: 0,
                labor_cost: 0,
                estimated_days: 7,
                image_url: "",
                gallery_images: []
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
                <Button onClick={() => handleOpenModal(null, false)} className="bg-primary hover:bg-primary/90 gap-2">
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
                        onClick={() => handleOpenModal(product, true)}
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
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenModal(product, false);
                                    }}
                                    className="p-2 bg-white/90 text-slate-700 rounded-lg hover:text-primary shadow-sm"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteId(product.id);
                                    }}
                                    className="p-2 bg-white/90 text-red-600 rounded-lg hover:bg-red-50 shadow-sm"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="absolute bottom-3 left-3">
                                <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wide">
                                    {product.category}
                                </span>
                                {product.gallery_images && product.gallery_images.length > 0 && (
                                    <span className="bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium ml-2 flex items-center gap-1 shadow-sm">
                                        <ImageIcon size={10} />
                                        +{product.gallery_images.length}
                                    </span>
                                )}
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
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1" title="Estimated Days">
                                        <Tag size={12} />
                                        <span>{product.estimated_days} days</span>
                                    </div>
                                    <div className="flex items-center gap-1" title="Base Labor Cost">
                                        <DollarSign size={12} />
                                        <span>Labor: K{parseFloat(product.labor_cost || 0).toFixed(0)}</span>
                                    </div>
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

            {/* Create/Edit/View Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className={isViewMode ? "max-w-2xl px-0 overflow-hidden" : ""}>
                    <DialogHeader className={isViewMode ? "px-6" : ""}>
                        <DialogTitle>
                            {isViewMode ? "Product Details" : editingProduct ? "Edit Product" : "Create New Product"}
                        </DialogTitle>
                    </DialogHeader>

                    {isViewMode ? (
                        <div className="flex flex-col max-h-[85vh] overflow-hidden">
                            <div className="overflow-y-auto px-6 space-y-6 pb-6">
                                {/* Product Header/Image View */}
                                <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden relative border shadow-inner">
                                    {formData.image_url ? (
                                        <img src={formData.image_url} alt={formData.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ImageIcon size={64} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wider text-primary border border-primary/20">
                                            {formData.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <h2 className="text-2xl font-bold text-slate-900">{formData.name}</h2>
                                        <div className="text-2xl font-bold text-primary">K{parseFloat(formData.base_price).toFixed(2)}</div>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-around text-center">
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Labor Cost</p>
                                            <p className="font-bold text-slate-700">K{parseFloat(formData.labor_cost).toFixed(2)}</p>
                                        </div>
                                        <div className="w-px h-8 bg-slate-200" />
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Est. Time</p>
                                            <p className="font-bold text-slate-700">{formData.estimated_days} Days</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-400 uppercase text-[10px] tracking-widest">Description</Label>
                                        <p className="text-slate-600 leading-relaxed">
                                            {formData.description || "No description provided for this product."}
                                        </p>
                                    </div>

                                    {/* View Gallery */}
                                    {formData.gallery_images && formData.gallery_images.length > 0 && (
                                        <div className="space-y-3 pt-2">
                                            <Label className="text-slate-400 uppercase text-[10px] tracking-widest">Photo Gallery</Label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {formData.gallery_images.map((url, index) => (
                                                    <div key={index} className="aspect-square bg-slate-50 rounded-lg overflow-hidden border cursor-zoom-in hover:border-primary transition-colors">
                                                        <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-4 bg-slate-50 border-t mt-auto">
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                                <Button onClick={() => setIsViewMode(false)} className="gap-2">
                                    <Edit2 size={16} />
                                    Edit Product
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
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
                                <div className="space-y-2">
                                    <Label>Base Labor Cost (K)</Label>
                                    <Input
                                        type="number"
                                        value={formData.labor_cost}
                                        onChange={(e) => setFormData({ ...formData, labor_cost: e.target.value })}
                                        min="0"
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
                                <Label>Main Image URL (Optional)</Label>
                                <Input
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="space-y-4 border-t pt-4">
                                <Label>Photo Gallery (Optional)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Paste image URL (ends in .jpg/.png)"
                                        id="gallery-input"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const url = e.currentTarget.value;
                                                if (url) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        gallery_images: [...(prev.gallery_images || []), url]
                                                    }));
                                                    e.currentTarget.value = "";
                                                }
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            const input = document.getElementById("gallery-input");
                                            if (input && input.value) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    gallery_images: [...(prev.gallery_images || []), input.value]
                                                }));
                                                input.value = "";
                                            }
                                        }}
                                    >
                                        Add
                                    </Button>
                                </div>

                                {/* Gallery Preview Grid */}
                                {formData.gallery_images && formData.gallery_images.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        {formData.gallery_images.map((url, index) => (
                                            <div key={index} className="relative group aspect-square bg-slate-100 rounded-lg overflow-hidden border">
                                                <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            gallery_images: prev.gallery_images.filter((_, i) => i !== index)
                                                        }));
                                                    }}
                                                    className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                {editingProduct && (
                                    <Button type="button" variant="outline" onClick={() => setIsViewMode(true)}>Back to View</Button>
                                )}
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Product</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product?</DialogTitle>
                    </DialogHeader>
                    <p className="text-slate-600">
                        Are you sure you want to delete this product? It will be moved to the recycle bin.
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
