import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Upload, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { productService } from "../../services/productService";
import { storageService } from "../../services/storageService";
import toast from "react-hot-toast";

export default function ProductFormDialog({ open, onOpenChange, productToEdit, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: "",
      description: "",
      category: "",
      base_price: "",
      estimated_days: "",
      stock_status: "in_stock",
      active: true,
      featured: false,
      customizable: false,
      fabric_details: "",
      care_instructions: "",
      image_url: "",
      gallery_images: []
    }
  });

  // Reset form when opening/closing or changing product
  useEffect(() => {
    if (open) {
      if (productToEdit) {
        // Edit mode
        reset({
          ...productToEdit,
          base_price: productToEdit.base_price, // Ensure number
          gallery_images: productToEdit.gallery_images || []
        });
        setMainImagePreview(productToEdit.image_url);
        setGalleryPreviews(productToEdit.gallery_images || []);
      } else {
        // Create mode
        reset({
          name: "",
          description: "",
          category: "",
          base_price: "",
          estimated_days: "7",
          stock_status: "in_stock",
          active: true,
          featured: false,
          customizable: false,
          fabric_details: "",
          care_instructions: "",
          image_url: "",
          gallery_images: []
        });
        setMainImagePreview(null);
        setGalleryPreviews([]);
      }
    }
  }, [open, productToEdit, reset]);

  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await storageService.uploadProductImage(file);
      setValue("image_url", url);
      setMainImagePreview(url);
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploadingImage(true);
      const newUrls = [];
      const currentGallery = watch("gallery_images") || [];

      // Upload all files
      for (const file of files) {
        const url = await storageService.uploadProductImage(file);
        newUrls.push(url);
      }

      const updatedGallery = [...currentGallery, ...newUrls];
      setValue("gallery_images", updatedGallery);
      setGalleryPreviews(updatedGallery);
      toast.success(`${newUrls.length} images added to gallery`);
    } catch (error) {
      toast.error("Failed to upload gallery images");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeGalleryImage = (indexToRemove) => {
    const currentGallery = watch("gallery_images") || [];
    const updatedGallery = currentGallery.filter((_, index) => index !== indexToRemove);
    setValue("gallery_images", updatedGallery);
    setGalleryPreviews(updatedGallery);
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      // Ensure numeric types
      const formattedData = {
        ...data,
        base_price: parseFloat(data.base_price),
        estimated_days: parseInt(data.estimated_days) || 0
      };

      if (productToEdit) {
        await productService.updateProduct(productToEdit.id, formattedData);
        toast.success("Product updated successfully");
      } else {
        await productService.createProduct(formattedData);
        toast.success("Product created successfully");
      }
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{productToEdit ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" {...register("name", { required: "Name is required" })} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  onValueChange={(val) => setValue("category", val)} 
                  defaultValue={watch("category")} 
                  value={watch("category")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dresses">Dresses</SelectItem>
                    <SelectItem value="Suits">Suits</SelectItem>
                    <SelectItem value="Traditional">Traditional Wear</SelectItem>
                    <SelectItem value="Casual">Casual</SelectItem>
                    <SelectItem value="Bridal">Bridal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base_price">Price (K) *</Label>
                  <Input 
                    id="base_price" 
                    type="number" 
                    {...register("base_price", { required: true, min: 0 })} 
                  />
                </div>
                <div>
                  <Label htmlFor="estimated_days">Est. Days</Label>
                  <Input 
                    id="estimated_days" 
                    type="number" 
                    {...register("estimated_days", { min: 1 })} 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="stock_status">Stock Status</Label>
                <Select 
                  onValueChange={(val) => setValue("stock_status", val)}
                  value={watch("stock_status")}
                  defaultValue="in_stock"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="made_to_order">Made to Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  rows={4}
                  {...register("description")} 
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center space-x-2 border p-3 rounded-md">
                  <Checkbox 
                    id="active" 
                    checked={watch("active")}
                    onCheckedChange={(c) => setValue("active", c)}
                  />
                  <Label htmlFor="active">Active (Visible)</Label>
                </div>

                <div className="flex items-center space-x-2 border p-3 rounded-md">
                  <Checkbox 
                    id="featured" 
                    checked={watch("featured")}
                    onCheckedChange={(c) => setValue("featured", c)}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>

                <div className="flex items-center space-x-2 border p-3 rounded-md">
                  <Checkbox 
                    id="customizable" 
                    checked={watch("customizable")}
                    onCheckedChange={(c) => setValue("customizable", c)}
                  />
                  <Label htmlFor="customizable">Customizable</Label>
                </div>
              </div>
            </div>

            {/* Right Column: Images & Details */}
            <div className="space-y-6">
              {/* Main Image */}
              <div>
                <Label>Main Image</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                  {mainImagePreview ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-gray-100">
                      <img src={mainImagePreview} alt="Preview" className="h-full w-full object-contain" />
                      <button
                        type="button"
                        onClick={() => {
                          setValue("image_url", "");
                          setMainImagePreview(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <label className="cursor-pointer">
                        <span className="text-primary hover:underline">Upload main image</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleMainImageUpload}
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Images */}
              <div>
                <Label>Gallery Images</Label>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {galleryPreviews.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-md overflow-hidden bg-gray-100 group">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <div className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50">
                    <label className="cursor-pointer w-full h-full flex items-center justify-center">
                      <Plus className="h-6 w-6 text-gray-400" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        className="hidden" 
                        onChange={handleGalleryUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Extra Details */}
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label htmlFor="fabric_details">Fabric Details</Label>
                  <Input id="fabric_details" {...register("fabric_details")} placeholder="e.g. 100% Cotton Chitenge" />
                </div>
                <div>
                  <Label htmlFor="care_instructions">Care Instructions</Label>
                  <Input id="care_instructions" {...register("care_instructions")} placeholder="e.g. Dry Clean Only" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || uploadingImage} className="bg-[#8B4513] hover:bg-[#A0522D]">
              {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              {productToEdit ? "Update Product" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
