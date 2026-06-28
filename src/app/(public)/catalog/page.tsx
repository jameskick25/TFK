import { createClient } from '@/utils/supabase/server';
import CatalogClient from './CatalogClient';

export const revalidate = 60; // Cache for 60s

export const metadata = {
  title: 'Produits — TFK Store',
};

export default async function CatalogPage() {
  const supabase = await createClient();
  
  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  // Fetch products
  const { data: products } = await supabase
    .from('products')
    .select('*, product_images(url, is_main, color), categories(slug), product_variants(size, color, stock)')
    .eq('is_active', true);

  return <CatalogClient categories={categories || []} products={products || []} />;
}
