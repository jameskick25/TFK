import { createAdminClient } from '@/utils/supabase/server';
import CategoriesClient from './CategoriesClient';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const supabase = await createAdminClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, display_order')
    .order('display_order', { ascending: true });

  const { data: products } = await supabase
    .from('products')
    .select('category_id');

  const productCounts: Record<string, number> = {};
  if (products) {
    for (const p of products) {
      if (p.category_id) {
        productCounts[p.category_id] = (productCounts[p.category_id] || 0) + 1;
      }
    }
  }

  return (
    <CategoriesClient
      initialCategories={categories || []}
      productCounts={productCounts}
    />
  );
}
