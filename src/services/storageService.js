import { supabase } from "../lib/supabase";

const BUCKET_NAME = "product-images";

export const storageService = {
  // Upload a file to product-images bucket
  async uploadProductImage(file) {
    // Generate unique filename: timestamp-random-filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (error) {
      console.error("Error uploading image:", error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrl;
  },

  // Delete a file from bucket given its full URL
  async deleteProductImage(imageUrl) {
    if (!imageUrl) return;

    // Extract file path from URL
    // URL format: .../storage/v1/object/public/product-images/filename.jpg
    const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) return;
    
    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }
};
