import { createClient } from '@/utils/supabase/server';
import CatalogClient from '../catalog/CatalogClient';
import { getSectionForCategory } from '@/utils/sections';

export const revalidate = 60;

export const metadata = {
  title: 'Collection Vêtements - TFK Store',
  description: 'Découvrez toute notre collection de vêtements chez TFK Store.',
};

export default async function ClothesPage(props: { searchParams: Promise<{ filter?: string }> }) {
  const resolvedSearchParams = await props.searchParams;
  const initialFilter = resolvedSearchParams.filter || 'all';
  const supabase = await createClient();

  // Fetch categories
  const { data: allCategories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  // Fetch products
  const { data: allProducts } = await supabase
    .from('products')
    .select('*, product_images(url, is_main, color), categories(slug), product_variants(size, color, stock)')
    .eq('is_active', true);

  // Filter for clothes universe
  const categories = (allCategories || []).filter(
    (cat) => getSectionForCategory(cat.slug) === 'clothes'
  );
  
  const categoryIds = new Set(categories.map(c => c.id));
  const products = (allProducts || []).filter(
    (p) => categoryIds.has(p.category_id)
  );

  return (
    <>
      <div className="hero-banner" style={{ background: 'linear-gradient(rgba(9,9,11,0.65), rgba(9,9,11,0.85)), url("/logo.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <h1 className="hero-banner-title">Collection Vêtements</h1>
          <p className="hero-banner-desc">Découvrez tous nos articles et trouvez votre style idéal.</p>
        </div>
      </div>
      <CatalogClient categories={categories} products={products} initialFilter={initialFilter} />
    </>
  );
}
