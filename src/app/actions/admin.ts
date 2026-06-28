'use server';

import { createAdminClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

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
      const fileExt = image.name.split('.').pop();
      const fileName = `${product.id}-${colorName}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, image);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);
          
        if (publicUrlData.publicUrl) {
          await supabase.from('product_images').insert({
            product_id: product.id,
            url: publicUrlData.publicUrl,
            color: colorName || null,
            is_main: isFirstImage // First uploaded image is main
          });
          isFirstImage = false;
        }
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
  const imageFile = formData.get('image') as File;
  
  if (!name) return;
  
  const slug = generateSlug(name);
  let image_url = null;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `category-${slug}-${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, imageFile);
    
    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);
      image_url = publicUrlData.publicUrl;
    } else {
      console.error('Erreur upload category image', uploadError);
    }
  }
  
  await supabase.from('categories').insert({ name, slug, image_url });
  redirect('/admin/categories');
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createAdminClient();
  const id = formData.get('id') as string;
  
  if (!id) return;

  // Get image URL to delete from storage
  const { data: cat } = await supabase
    .from('categories')
    .select('image_url')
    .eq('id', id)
    .single();

  if (cat?.image_url) {
    const parts = cat.image_url.split('/');
    const fileName = parts[parts.length - 1];
    await supabase.storage.from('products').remove([fileName]);
  }
  
  await supabase.from('categories').delete().eq('id', id);
  redirect('/admin/categories');
}

export async function updateCategoryImage(formData: FormData) {
  const supabase = await createAdminClient();
  const id = formData.get('id') as string;
  const imageFile = formData.get('image') as File;

  if (!id || !imageFile || imageFile.size === 0) return;

  // Fetch category to get slug/name for file name
  const { data: cat } = await supabase
    .from('categories')
    .select('slug, image_url')
    .eq('id', id)
    .single();
  
  if (!cat) return;

  // Delete old image if exists
  if (cat.image_url) {
    const parts = cat.image_url.split('/');
    const oldFileName = parts[parts.length - 1];
    await supabase.storage.from('products').remove([oldFileName]);
  }

  const fileExt = imageFile.name.split('.').pop();
  const fileName = `category-${cat.slug}-${Math.random()}.${fileExt}`;
  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(fileName, imageFile);
  
  if (!uploadError) {
    const { data: publicUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);
    
    await supabase
      .from('categories')
      .update({ image_url: publicUrlData.publicUrl })
      .eq('id', id);
  } else {
    console.error('Erreur upload category image', uploadError);
  }

  redirect('/admin/categories');
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
