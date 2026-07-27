/**
 * ══════════════════════════════════════════════════════════════
 *  EXAMPLE: How to integrate compressAndUploadImage into your
 *  createProduct / updateProduct server actions
 * ══════════════════════════════════════════════════════════════
 * 
 *  This file shows the PATTERN to follow. Copy the relevant parts
 *  into your own admin.ts / product actions file.
 * 
 *  The key change is: instead of using supabase.storage.upload(),
 *  use compressAndUploadImage() which compresses via sharp first.
 * ══════════════════════════════════════════════════════════════
 */

'use server';

import { createAdminClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Import the compression function from your actions folder
// (copy compress-and-upload.ts to src/app/actions/ or src/utils/)
import { compressAndUploadImage } from './compress-and-upload';


// ══════════════════════════════════════════════════════════════
//  EXAMPLE 1: Creating a new product with auto-optimized images
// ══════════════════════════════════════════════════════════════

export async function createProductExample(formData: FormData) {
  const supabase = await createAdminClient();
  
  const name = formData.get('name') as string;
  // ... other fields ...

  // 1. Create the product in DB
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({ name /* ... other fields ... */ })
    .select()
    .single();

  if (productError || !product) {
    return { success: false, error: productError?.message };
  }

  // 2. Handle image uploads with automatic optimization
  //    Assuming you have a color-based variant system like:
  //    variantsData = [{ color: "Noir", sizes: [...] }, { color: "Bleu", sizes: [...] }]
  
  const variantsDataString = formData.get('variantsData') as string;
  const variantsData = JSON.parse(variantsDataString);
  let isFirstImage = true;

  for (const variantGroup of variantsData) {
    const colorName = variantGroup.color;
    
    // Get the uploaded image file from the form
    const image = formData.get(`image_${colorName}`) as File;
    
    if (image && image.size > 0) {
      // ┌──────────────────────────────────────────────────┐
      // │  THIS IS THE KEY CHANGE:                         │
      // │  Instead of supabase.storage.upload(file),       │
      // │  use compressAndUploadImage(file, name)          │
      // │  which compresses to WebP via sharp first        │
      // └──────────────────────────────────────────────────┘
      
      const storageName = `${product.id}-${colorName}-${Math.random()}`;
      const { url: optimizedUrl, error: uploadError } = await compressAndUploadImage(image, storageName);

      if (!uploadError && optimizedUrl) {
        await supabase.from('product_images').insert({
          product_id: product.id,
          url: optimizedUrl,           // Already optimized WebP URL
          color: colorName || null,
          is_main: isFirstImage,
        });
        isFirstImage = false;
      } else {
        console.error('Upload error for color', colorName, uploadError);
      }
    }
  }

  return { success: true };
}


// ══════════════════════════════════════════════════════════════
//  EXAMPLE 2: Updating a product — replacing an image
// ══════════════════════════════════════════════════════════════

export async function updateProductExample(formData: FormData) {
  const supabase = await createAdminClient();
  const productId = formData.get('productId') as string;
  
  // ... update product fields ...

  const variantsDataString = formData.get('variantsData') as string;
  const variantsData = JSON.parse(variantsDataString);

  // Fetch existing images to know what to delete
  const { data: existingImages } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId);
  const oldImages = existingImages || [];

  for (const variantGroup of variantsData) {
    const colorName = variantGroup.color;
    
    const imageFile = formData.get(`image_${colorName}`) as File;
    if (imageFile && imageFile.size > 0) {
      
      // 1. Delete old image for this color (if it existed)
      const oldImage = oldImages.find(img => img.color === colorName);
      if (oldImage) {
        await supabase.from('product_images').delete().eq('id', oldImage.id);
        // Also delete from storage
        const urlParts = oldImage.url.split('/');
        const fileName = decodeURIComponent(urlParts[urlParts.length - 1]);
        await supabase.storage.from('products').remove([fileName]);
      }

      // 2. Upload new image with automatic sharp compression
      // ┌──────────────────────────────────────────────────┐
      // │  SAME PATTERN: compressAndUploadImage()          │
      // └──────────────────────────────────────────────────┘
      const storageName = `${productId}-${colorName}-${Math.random()}`;
      const { url: optimizedUrl, error: uploadError } = await compressAndUploadImage(imageFile, storageName);

      if (!uploadError && optimizedUrl) {
        await supabase.from('product_images').insert({
          product_id: productId,
          url: optimizedUrl,
          color: colorName || null,
          is_main: false,
        });
      } else {
        console.error('Upload error for color', colorName, uploadError);
      }
    }
  }

  revalidatePath('/admin/products');
  return { success: true };
}


// ══════════════════════════════════════════════════════════════
//  EXAMPLE 3: Simplest possible usage — single image upload
// ══════════════════════════════════════════════════════════════

export async function uploadSingleImageExample(formData: FormData) {
  const supabase = await createAdminClient();
  
  const productId = formData.get('productId') as string;
  const image = formData.get('image') as File;

  if (!image || image.size === 0) {
    return { success: false, error: 'No image provided' };
  }

  // Compress and upload in one call
  const { url, error } = await compressAndUploadImage(image, `${productId}-${Date.now()}`);

  if (error || !url) {
    return { success: false, error: error || 'Upload failed' };
  }

  // Save to database
  await supabase.from('product_images').insert({
    product_id: productId,
    url: url,
    is_main: true,
  });

  return { success: true, url };
}
