'use server';

import { createAdminClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { compressAndUploadImage } from './compress-and-upload';

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
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

  try {
    // 1. Create Product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: name.trim(),
        slug,
        description: description ? description.trim() : null,
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

    revalidatePath('/admin/products');
    revalidatePath('/admin/stock');
    revalidatePath('/catalog');
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (err: any) {
    console.error('Erreur inattendue création produit:', err);
    return { success: false, error: err.message || 'Erreur serveur inattendue' };
  }
}

// ── Gestion des Catégories & Sous-Catégories ────────────
export async function createCategory(formData: FormData) {
  try {
    const supabase = await createAdminClient();
    const name = (formData.get('name') as string || '').trim();
    const customSlug = (formData.get('slug') as string || '').trim();
    const parentId = (formData.get('parent_id') as string || '').trim();
    
    if (!name) {
      return { success: false, error: 'Le nom de la catégorie est obligatoire' };
    }

    let baseSlug = customSlug ? generateSlug(customSlug) : generateSlug(name);
    if (!baseSlug) baseSlug = 'cat-' + Math.floor(Math.random() * 10000);

    // If parent_id is specified, store hierarchy in slug as: sub--[parentId]--[baseSlug]
    let slug = parentId && parentId !== 'none' ? `sub--${parentId}--${baseSlug}` : baseSlug;

    // Check if slug already exists
    const { data: existing } = await supabase.from('categories').select('id').eq('slug', slug).maybeSingle();
    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    // Calculate next display_order
    const { data: maxCat } = await supabase
      .from('categories')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    const display_order = (maxCat?.display_order || 0) + 1;

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        display_order
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la catégorie', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/categories');
    revalidatePath('/admin/products/new');
    revalidatePath('/catalog');
    revalidatePath('/', 'layout');

    return { success: true, category: data };
  } catch (err: any) {
    console.error('Erreur inattendue createCategory:', err);
    return { success: false, error: err.message || 'Erreur serveur inattendue' };
  }
}

export async function updateCategory(formData: FormData) {
  try {
    const supabase = await createAdminClient();
    const id = (formData.get('id') as string || '').trim();
    const name = (formData.get('name') as string || '').trim();
    const customSlug = (formData.get('slug') as string || '').trim();
    const parentId = (formData.get('parent_id') as string || '').trim();

    if (!id || !name) {
      return { success: false, error: 'ID et nom de catégorie requis' };
    }

    let baseSlug = customSlug ? generateSlug(customSlug) : generateSlug(name);
    if (!baseSlug) baseSlug = 'cat-' + id.slice(0, 6);

    let slug = parentId && parentId !== 'none' ? `sub--${parentId}--${baseSlug}` : baseSlug;

    const { data, error } = await supabase
      .from('categories')
      .update({
        name,
        slug
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de la catégorie', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/categories');
    revalidatePath('/admin/products/new');
    revalidatePath('/catalog');
    revalidatePath('/', 'layout');

    return { success: true, category: data };
  } catch (err: any) {
    console.error('Erreur inattendue updateCategory:', err);
    return { success: false, error: err.message || 'Erreur serveur inattendue' };
  }
}

export async function deleteCategory(idOrFormData: FormData | string) {
  try {
    const supabase = await createAdminClient();
    let id: string;
    if (typeof idOrFormData === 'string') {
      id = idOrFormData.trim();
    } else {
      id = (idOrFormData.get('id') as string || '').trim();
    }

    if (!id) {
      return { success: false, error: 'ID requis pour supprimer' };
    }

    // 1. Delete this category
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression de la catégorie', error);
      return { success: false, error: error.message };
    }

    // 2. Also clean up any subcategory pointing to this parent
    const { data: subcats } = await supabase
      .from('categories')
      .select('id, slug')
      .like('slug', `sub--${id}--%`);

    if (subcats && subcats.length > 0) {
      for (const sub of subcats) {
        // Convert to main category or delete
        const newSlug = sub.slug.replace(`sub--${id}--`, '');
        await supabase.from('categories').update({ slug: newSlug }).eq('id', sub.id);
      }
    }

    revalidatePath('/admin/categories');
    revalidatePath('/admin/products/new');
    revalidatePath('/catalog');
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (err: any) {
    console.error('Erreur inattendue deleteCategory:', err);
    return { success: false, error: err.message || 'Erreur serveur inattendue' };
  }
}

// ── Gestion Rapide des Stocks ──────────────────────────
export async function updateVariantStock(variantId: string, newStock: number) {
  try {
    const supabase = await createAdminClient();
    
    const { error } = await supabase
      .from('product_variants')
      .update({ stock: newStock })
      .eq('id', variantId);
      
    if (error) {
      console.error("Erreur de mise à jour du stock :", error);
      return { success: false, error: error.message };
    }
    
    revalidatePath('/admin/stock');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateBulkStock(updates: Record<string, number>) {
  try {
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
    
    revalidatePath('/admin/stock');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── Modification Produit (Corrigé : sans show_colors_separately inexistant) ──
export async function updateProductInfo(formData: FormData) {
  try {
    const supabase = await createAdminClient();
    const id = formData.get('productId') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseInt(formData.get('price') as string);
    const old_price = formData.get('old_price') ? parseInt(formData.get('old_price') as string) : null;
    const category_id = formData.get('category_id') as string;
    const is_active = formData.get('is_active') === 'true';

    if (!id || !name?.trim() || isNaN(price)) {
      return { success: false, error: 'Champs obligatoires manquants ou invalides' };
    }

    const { error } = await supabase
      .from('products')
      .update({
        name: name.trim(),
        description: description ? description.trim() : null,
        price,
        old_price: isNaN(old_price as number) ? null : old_price,
        category_id: category_id || null,
        is_active
      })
      .eq('id', id);

    if (error) {
      console.error('Erreur updateProductInfo:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${id}`);
    revalidatePath('/catalog');
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (err: any) {
    console.error('Erreur inattendue updateProductInfo:', err);
    return { success: false, error: err.message || 'Erreur serveur inattendue' };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const supabase = await createAdminClient();
    
    // 1. Get images to delete from storage
    const { data: images } = await supabase
      .from('product_images')
      .select('url')
      .eq('product_id', productId);
      
    // 2. Delete product (cascade deletes variants and images from DB)
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
    
    revalidatePath('/admin/products');
    revalidatePath('/catalog');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── Statuts de Commandes ───────────────────────────────
export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    const supabase = await createAdminClient();
    if (!orderId || !newStatus) {
      return { success: false, error: 'Paramètres manquants' };
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Erreur updateOrderStatus:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Erreur inattendue updateOrderStatus:', err);
    return { success: false, error: err.message || 'Erreur serveur inattendue' };
  }
}

// ── Ventes Manuelles & Dépenses ─────────────────────────
export async function addManualSale(formData: FormData) {
  try {
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

    revalidatePath('/admin/sales');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteManualSale(id: string) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from('manual_sales')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/sales');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function editManualSale(id: string, price: number, benefice: number) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from('manual_sales')
      .update({ price, benefice })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/sales');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function addExpense(formData: FormData) {
  try {
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

    revalidatePath('/admin/expenses');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteExpense(id: string) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/expenses');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function editExpense(id: string, amount: number) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from('expenses')
      .update({ amount })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/expenses');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteOrder(orderId: string) {
  try {
    const supabase = await createAdminClient();
    const id = orderId?.trim();
    if (!id) {
      return { success: false, error: 'ID de commande manquant' };
    }

    // 1. Delete items first
    const { error: itemsError } = await supabase.from('order_items').delete().eq('order_id', id);
    if (itemsError) {
      console.error('Erreur suppression order_items:', itemsError);
    }

    // 2. Delete order
    const { error: orderError } = await supabase.from('orders').delete().eq('id', id);
    if (orderError) {
      console.error('Erreur suppression commande:', orderError);
      return { success: false, error: orderError.message };
    }

    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    console.error('Erreur inattendue deleteOrder:', err);
    return { success: false, error: err.message || 'Erreur serveur inattendue' };
  }
}
