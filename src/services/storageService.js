import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

/**
 * Upload a product image to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} productId - Product ID (for organizing files)
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export const uploadProductImage = async (file, productId) => {
  if (!file) throw new Error('No file provided');

  const bucket = 'product-images';
  const timestamp = Date.now();
  const fileName = `${productId}/${timestamp}-${file.name}`;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Delete a product image from storage
 * @param {string} imageUrl - The public URL of the image
 */
export const deleteProductImage = async (imageUrl) => {
  try {
    const bucket = 'product-images';
    const urlParts = imageUrl.split('/storage/v1/object/public/product-images/');

    if (urlParts.length !== 2) {
      console.warn('Could not parse image URL for deletion:', imageUrl);
      return;
    }

    const filePath = urlParts[1];
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw - deletion failure shouldn't block other operations
  }
};

/**
 * Handle file upload from input
 * @param {File} file - The file to validate and prepare
 * @returns {boolean} - Whether file is valid
 */
export const validateImageFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!validTypes.includes(file.type)) {
    toast.error('Invalid image format. Use JPG, PNG, WebP, or GIF');
    return false;
  }

  if (file.size > maxSize) {
    toast.error('Image too large. Maximum size is 5MB');
    return false;
  }

  return true;
};

/**
 * Get signed URL for an image (useful for private images if needed in future)
 * @param {string} filePath - Path to the file in storage
 * @param {number} expiresIn - Expiration time in seconds
 */
export const getSignedUrl = async (filePath, expiresIn = 3600) => {
  try {
    const { data, error } = await supabase.storage
      .from('product-images')
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error('Error creating signed URL:', error);
    throw error;
  }
};
