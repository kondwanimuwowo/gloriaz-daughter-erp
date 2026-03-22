import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Package, Tag, DollarSign, Image as ImageIcon, Filter, Upload } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";
import { uploadProductImage, validateImageFile, deleteProductImage } from "../services/storageService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/PageHeader";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isViewMode, setIsViewMode] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        category: "standard",
        description: "",
        base_price: 0,
        labor_cost: 0,
        estimated_days: 7,
        image_url: "",
        gallery_images: [],
        product_type: "custom_design",
        stock_quantity: 0,
        min_stock_level: 10,
        cost_per_unit: 0,
        active: true
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
                gallery_images: product.gallery_images || [],
                product_type: product.product_type || "custom_design",
                stock_quantity: product.stock_quantity || 0,
                min_stock_level: product.min_stock_level || 10,
                cost_per_unit: product.cost_per_unit || 0,
                active: product.active !== undefined ? product.active : true
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
                gallery_images: [],
                product_type: "custom_design",
                stock_quantity: 0,
                min_stock_level: 10,
                cost_per_unit: 0,
                active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);

            // Prepare data for save
            const dataToSave = { ...formData };

            if (editingProduct) {
                const { error } = await supabase
                    .from("products")
                    .update(dataToSave)
                    .eq("id", editingProduct.id);
                if (error) throw error;
                toast.success("Product updated successfully");
            } else {
                const { error } = await supabase
                    .from("products")
                    .insert([dataToSave]);
                if (error) throw error;
                toast.success("Product created successfully");
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            console.error("Error saving product:", error);
            toast.error("Failed to save product");
        } finally {
            setUploading(false);
        }
    };

    const handleMainImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!validateImageFile(file)) return;

        try {
            setUploading(true);
            const tempId = editingProduct?.id || 'new-' + Date.now();
            const imageUrl = await uploadProductImage(file, tempId);
            setFormData(prev => ({ ...prev, image_url: imageUrl }));
            toast.success("Image uploaded successfully");
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error(error.message || "Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleGalleryImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!validateImageFile(file)) return;

        try {
            setUploading(true);
            const tempId = editingProduct?.id || 'new-' + Date.now();
            const imageUrl = await uploadProductImage(file, tempId);
            setFormData(prev => ({
                ...prev,
                gallery_images: [...(prev.gallery_images || []), imageUrl]
            }));
            toast.success("Image added to gallery");
        } catch (error) {
            console.error("Error uploading gallery image:", error);
            toast.error(error.message || "Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveGalleryImage = (indexToRemove) => {
        const imageUrl = formData.gallery_images[indexToRemove];
        // Attempt to delete from storage (async, don't block)
        deleteProductImage(imageUrl);
        setFormData(prev => ({
            ...prev,
            gallery_images: prev.gallery_images.filter((_, i) => i !== indexToRemove)
        }));
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
        <div className="max-w-7xl mx-auto space-y-5">
            <PageHeader title="Products Catalog" description="Manage standard garment designs and offerings">
                <Button onClick={() => handleOpenModal(null, false)} className="gap-2">
                    <Plus size={16} />
                    Add Product
                </Button>
            </PageHeader>

            {/* Filters */}
            <div className="flex items-center space-x-2 bg-card p-2 rounded-lg border border-border shadow-sm max-w-md">
                <Search className="text-muted-foreground ml-2" size={18} />
                <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-none focus-visible:ring-0"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        onClick={() => handleOpenModal(product, true)}
                        className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full cursor-pointer hover:border-primary/50"
                    >
                        <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center text-muted-foreground/40 bg-muted/50 ${product.image_url ? 'hidden' : 'flex'}`}>
                                <ImageIcon size={28} />
                            </div>

                            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenModal(product, false);
                                    }}
                                    className="p-1.5 bg-background/90 text-foreground rounded-md hover:text-primary shadow-sm"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteId(product.id);
                                    }}
                                    className="p-1.5 bg-background/90 text-red-600 rounded-md hover:bg-red-50 shadow-sm"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="absolute bottom-2 left-2 flex items-center flex-wrap gap-1.5">
                                <span className="bg-background/90 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wide">
                                    {product.category}
                                </span>
                                {product.product_type === "finished_good" && (
                                    <span className="bg-blue-500/90 text-white px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm uppercase tracking-wide">
                                        In Stock: {product.stock_quantity || 0}
                                    </span>
                                )}
                                {product.gallery_images && product.gallery_images.length > 0 && (
                                    <span className="bg-black/70 text-white px-1.5 py-0.5 rounded text-[10px] font-medium inline-flex items-center gap-0.5 shadow-sm">
                                        <ImageIcon size={9} />
                                        +{product.gallery_images.length}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-1.5 gap-2">
                                <h3 className="font-semibold text-sm text-foreground leading-tight">{product.name}</h3>
                                <span className="font-bold text-sm text-primary whitespace-nowrap">
                                    K{parseFloat(product.base_price).toFixed(2)}
                                </span>
                            </div>

                            <p className="text-muted-foreground text-xs mb-3 line-clamp-2 flex-1">
                                {product.description || "No description provided."}
                            </p>

                            <div className="pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex items-center gap-1" title="Estimated Days">
                                        <Tag size={11} />
                                        <span>{product.estimated_days} days</span>
                                    </div>
                                    <div className="flex items-center gap-1" title="Base Labor Cost">
                                        <DollarSign size={11} />
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
                <div className="text-center py-10 bg-muted/30 rounded-lg border-2 border-dashed border-border">
                    <Package className="mx-auto text-muted-foreground/40 mb-3" size={36} />
                    <h3 className="text-sm font-semibold text-foreground">No products found</h3>
                    <p className="text-xs text-muted-foreground mt-1">Create your first product directly or import from inventory.</p>
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
                            <div className="overflow-y-auto px-6 space-y-5 pb-6">
                                {/* Product Header/Image View */}
                                <div className="aspect-video bg-muted rounded-lg overflow-hidden relative border shadow-inner">
                                    {formData.image_url ? (
                                        <img src={formData.image_url} alt={formData.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                            <ImageIcon size={40} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wider text-primary border border-primary/20">
                                            {formData.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1">
                                            <h2 className="text-lg font-bold text-foreground">{formData.name}</h2>
                                            <div className="flex gap-2 mt-2">
                                                <span className="inline-block px-2 py-1 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 uppercase tracking-wide">
                                                    {formData.product_type === "finished_good" ? "Finished Good" : "Custom Design"}
                                                </span>
                                                {!formData.active && (
                                                    <span className="inline-block px-2 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 uppercase tracking-wide">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-lg font-bold text-primary">K{parseFloat(formData.base_price).toFixed(2)}</div>
                                    </div>

                                    {formData.product_type === "finished_good" ? (
                                        <div className="bg-muted/30 p-3 rounded-lg border border-border grid grid-cols-3 gap-3 text-center">
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">In Stock</p>
                                                <p className="font-bold text-sm text-foreground">{formData.stock_quantity} units</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Cost/Unit</p>
                                                <p className="font-bold text-sm text-foreground">K{parseFloat(formData.cost_per_unit).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Min Level</p>
                                                <p className="font-bold text-sm text-foreground">{formData.min_stock_level}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-muted/30 p-3 rounded-lg border border-border flex items-center justify-around text-center">
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Labor</p>
                                                <p className="font-bold text-sm text-foreground">K{parseFloat(formData.labor_cost).toFixed(2)}</p>
                                            </div>
                                            <div className="w-px h-6 bg-border" />
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Est. Time</p>
                                                <p className="font-bold text-sm text-foreground">{formData.estimated_days} Days</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <Label className="text-muted-foreground uppercase text-[10px] tracking-widest">Description</Label>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
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

                            <DialogFooter className="px-6 py-4 bg-muted/30 border-t mt-auto">
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                                <Button onClick={() => setIsViewMode(false)} className="gap-2">
                                    <Edit2 size={16} />
                                    Edit Product
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <div className="flex flex-col max-h-[85vh] overflow-hidden">
                            <form onSubmit={handleSave} className="overflow-y-auto px-6 space-y-4 pb-6">
                                <div className="space-y-2">
                                    <Label>Product Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Summer Chitenge Dress"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Product Type</Label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="product_type"
                                                value="custom_design"
                                                checked={formData.product_type === "custom_design"}
                                                onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm">Custom Design</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="product_type"
                                                value="finished_good"
                                                checked={formData.product_type === "finished_good"}
                                                onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm">Finished Good</span>
                                        </label>
                                    </div>
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

                                {formData.product_type === "finished_good" && (
                                    <div className="space-y-4 border-t pt-4">
                                        <Label className="text-base font-semibold">Inventory Management</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Stock Quantity</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.stock_quantity}
                                                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                                                    min="0"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Min Stock Level</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.min_stock_level}
                                                    onChange={(e) => setFormData({ ...formData, min_stock_level: parseInt(e.target.value) || 10 })}
                                                    min="0"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Cost Per Unit (K)</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.cost_per_unit}
                                                    onChange={(e) => setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) || 0 })}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.active}
                                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                                        className="rounded border-gray-300"
                                                    />
                                                    <span>Active</span>
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Details about materials, sizing, etc."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Main Image (Optional)</Label>
                                    <div className="flex flex-col gap-2">
                                        <div className="relative border-2 border-dashed border-border rounded-lg p-4 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleMainImageUpload}
                                                disabled={uploading}
                                                className="absolute inset-0 cursor-pointer opacity-0"
                                            />
                                            <div className="flex flex-col items-center gap-2">
                                                <Upload size={20} className="text-muted-foreground" />
                                                <div className="text-center">
                                                    <p className="text-xs font-medium text-foreground">Click to upload or drag and drop</p>
                                                    <p className="text-[10px] text-muted-foreground">JPG, PNG, WebP or GIF (max 5MB)</p>
                                                </div>
                                            </div>
                                        </div>
                                        {formData.image_url && (
                                            <div className="relative bg-muted rounded-lg overflow-hidden h-32">
                                                <img
                                                    src={formData.image_url}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4 border-t pt-4">
                                    <Label>Photo Gallery (Optional)</Label>
                                    <div className="relative border-2 border-dashed border-border rounded-lg p-4 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleGalleryImageUpload}
                                            disabled={uploading}
                                            className="absolute inset-0 cursor-pointer opacity-0"
                                        />
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload size={20} className="text-muted-foreground" />
                                            <div className="text-center">
                                                <p className="text-xs font-medium text-foreground">Click to upload image</p>
                                                <p className="text-[10px] text-muted-foreground">JPG, PNG, WebP or GIF (max 5MB)</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gallery Preview Grid */}
                                    {formData.gallery_images && formData.gallery_images.length > 0 && (
                                        <div className="grid grid-cols-4 gap-2">
                                            {formData.gallery_images.map((url, index) => (
                                                <div key={index} className="relative group aspect-square bg-muted rounded-lg overflow-hidden border">
                                                    <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveGalleryImage(index)}
                                                        className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </form>

                            <DialogFooter className="px-6 py-4 bg-muted/30 border-t mt-auto">
                                {editingProduct && (
                                    <Button type="button" variant="outline" onClick={() => setIsViewMode(true)} disabled={uploading}>Back to View</Button>
                                )}
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={uploading}>Cancel</Button>
                                <Button type="submit" form={`product-form-${editingProduct?.id || 'new'}`} disabled={uploading} onClick={(e) => {
                                    const form = document.querySelector('form');
                                    if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
                                }}>{uploading ? "Uploading..." : "Save Product"}</Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product?</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground text-sm">
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
