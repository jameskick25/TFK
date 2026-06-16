import { createClient } from '@/utils/supabase/server';
import CatalogClient from './catalog/CatalogClient';

export const revalidate = 60; // Cache for 60s

export const metadata = {
  title: 'Accueil — AM MODE',
};

export default async function Home() {
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
