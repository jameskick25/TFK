'use server';

import { createAdminClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { compressAndUploadImage } from './compress-and-upload';

function generateSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function createProduct(formData: FormData) {
  const supabase = await createAdminClient();
  
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseInt(formData.get('price') as string);
  const old_price = formData.get('old_price') ? parseInt(formData.get('old_price') as string) : null;
  const categoryId = formData.get('category_id') as string;
  
  // Nouveaux champs structurés
  const variantsDataString = formData.get('variantsData') as string;
  
  if (!name || !price || !categoryId || !variantsDataString) {
    return { success: false, error: 'Champs obligatoires manquants' };
  }

  const variantsData = JSON.parse(variantsDataString);
  const slug = generateSlug(name) + '-' + Math.floor(Math.random() * 1000);

  // 1. Create Product
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      name,
      slug,
      description,
      price,
      old_price,
      category_id: categoryId,
      is_active: true
    })
    .select()
    .single();

  if (productError || !product) {
    console.error('Erreur lors de la création du produit', productError);
    return { success: false, error: productError?.message || 'Erreur DB lors de la création' };
  }

  // 2. Handle Variants and Images
  let isFirstImage = true;
  const variantsToInsert = [];

  for (const variantGroup of variantsData) {
    const colorName = variantGroup.color;
    const sizes = variantGroup.sizes;
    
    // Check if there is an image for this color
    const image = formData.get(`image_${colorName}`) as File;
    
    if (image && image.size > 0) {
      const storageName = `${product.id}-${colorName || 'main'}-${Math.floor(Math.random() * 10000)}`;
      const { url: optimizedUrl, error: uploadError } = await compressAndUploadImage(image, storageName);

      if (!uploadError && optimizedUrl) {
        await supabase.from('product_images').insert({
          product_id: product.id,
          url: optimizedUrl,
          color: colorName || null,
          is_main: isFirstImage // First uploaded image is main
        });
        isFirstImage = false;
      } else {
        console.error('Erreur upload image pour couleur', colorName, uploadError);
      }
    }

    // Prepare variants for this color
    for (const sizeObj of sizes) {
      variantsToInsert.push({
        product_id: product.id,
        color: colorName || null,
        size: sizeObj.size || null,
        stock: sizeObj.stock
      });
    }
  }

  // 3. Insert all variants
  if (variantsToInsert.length > 0) {
    await supabase.from('product_variants').insert(variantsToInsert);
  }

  return { success: true };
}

// ── Gestion des Catégories ─────────────────────────────
export async function createCategory(formData: FormData) {
  const supabase = await createAdminClient();
  const name = formData.get('name') as string;
  const customSlug = formData.get('slug') as string;
  
  if (!name || !name.trim()) {
    return { success: false, error: 'Le nom de la catégorie est obligatoire' };
  }

  let slug = customSlug?.trim() ? generateSlug(customSlug) : generateSlug(name);
  if (!slug) slug = 'cat-' + Math.floor(Math.random() * 10000);

  // Vérifier si le slug existe déjà
  const { data: existing } = await supabase.from('categories').select('id').eq('slug', slug).maybeSingle();
  if (existing) {
    slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: name.trim(),
      slug,
      display_order: 100
    })
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la création de la catégorie', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/(public)', 'layout');
  return { success: true, category: data };
}

export async function updateCategory(formData: FormData) {
  const supabase = await createAdminClient();
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const customSlug = formData.get('slug') as string;

  if (!id || !name?.trim()) {
    return { success: false, error: 'ID et nom de catégorie requis' };
  }

  const updatePayload: { name: string; slug?: string } = {
    name: name.trim()
  };

  if (customSlug?.trim()) {
    updatePayload.slug = generateSlug(customSlug.trim());
  }

  const { data, error } = await supabase
    .from('categories')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la mise à jour de la catégorie', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/(public)', 'layout');
  return { success: true, category: data };
}

export async function deleteCategory(idOrFormData: FormData | string) {
  const supabase = await createAdminClient();
  let id: string;
  if (typeof idOrFormData === 'string') {
    id = idOrFormData;
  } else {
    id = idOrFormData.get('id') as string;
  }

  if (!id) {
    return { success: false, error: 'ID requis pour supprimer' };
  }

  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    console.error('Erreur lors de la suppression de la catégorie', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/(public)', 'layout');
  return { success: true };
}

// ── Gestion Rapide des Stocks ──────────────────────────
export async function updateVariantStock(variantId: string, newStock: number) {
  const supabase = await createAdminClient();
  
  const { error } = await supabase
    .from('product_variants')
    .update({ stock: newStock })
    .eq('id', variantId);
    
  if (error) {
    console.error("Erreur de mise à jour du stock :", error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

export async function updateBulkStock(updates: Record<string, number>) {
  const supabase = await createAdminClient();
  const errors = [];
  
  for (const [variantId, newStock] of Object.entries(updates)) {
    const { error } = await supabase
      .from('product_variants')
      .update({ stock: newStock })
      .eq('id', variantId);
      
    if (error) {
      errors.push(`Erreur pour ${variantId}: ${error.message}`);
    }
  }
  
  if (errors.length > 0) {
    return { success: false, error: errors.join(', ') };
  }
  
  return { success: true };
}

export async function updateProductInfo(formData: FormData) {
  const supabase = await createAdminClient();
  const id = formData.get('productId') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseInt(formData.get('price') as string);
  const old_price = formData.get('old_price') ? parseInt(formData.get('old_price') as string) : null;
  const category_id = formData.get('category_id') as string;
  const is_active = formData.get('is_active') === 'true';
  const show_colors_separately = formData.get('show_colors_separately') === 'true';

  const { error } = await supabase
    .from('products')
    .update({ name, description, price, old_price, category_id, is_active, show_colors_separately })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deleteProduct(productId: string) {
  const supabase = await createAdminClient();
  
  // 1. Get images to delete from storage
  const { data: images } = await supabase
    .from('product_images')
    .select('url')
    .eq('product_id', productId);
    
  // 2. Delete product (cascade should delete variants and images from DB)
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);
    
  if (error) {
    return { success: false, error: error.message };
  }
  
  // 3. Delete files from storage
  if (images && images.length > 0) {
    const fileNames = images.map(img => {
      const parts = img.url.split('/');
      return parts[parts.length - 1];
    });
    
    if (fileNames.length > 0) {
      await supabase.storage.from('products').remove(fileNames);
    }
  }
  
  return { success: true };
}

export async function addManualSale(formData: FormData) {
  const supabase = await createAdminClient();
  const product_name = formData.get('product_name') as string;
  const price = parseInt(formData.get('price') as string);
  const benefice = formData.get('benefice') ? parseInt(formData.get('benefice') as string) : 0;
  const client_info = formData.get('client_info') as string;
  const wilaya = formData.get('wilaya') as string;

  if (!product_name || isNaN(price)) {
    return { success: false, error: 'Produit et Prix sont obligatoires.' };
  }

  const { error } = await supabase
    .from('manual_sales')
    .insert({ product_name, price, benefice, client_info, wilaya });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deleteManualSale(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from('manual_sales')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function editManualSale(id: string, price: number, benefice: number) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from('manual_sales')
    .update({ price, benefice })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function addExpense(formData: FormData) {
  const supabase = await createAdminClient();
  const description = formData.get('description') as string;
  const amount = parseInt(formData.get('amount') as string);

  if (!description || isNaN(amount)) {
    return { success: false, error: 'Description et Montant sont obligatoires.' };
  }

  const { error } = await supabase
    .from('expenses')
    .insert({ description, amount });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deleteExpense(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function editExpense(id: string, amount: number) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from('expenses')
    .update({ amount })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
