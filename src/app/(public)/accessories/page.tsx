import { createClient } from '@/utils/supabase/server';
import CatalogClient from '../catalog/CatalogClient';
import { getSectionForCategory } from '@/utils/sections';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Collection Accessoires — TFK Store',
  description: 'Découvrez toute notre collection d\'accessoires chez TFK Store : maroquinerie, bijoux, montres, casquettes, high-tech et indispensables du quotidien.',
};

export default async function AccessoriesPage(props: { searchParams: Promise<{ filter?: string }> }) {
  const resolvedSearchParams = await props.searchParams;
  const initialFilter = resolvedSearchParams?.filter || 'all';
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

  // Filter for accessories universe
  const categories = (allCategories || []).filter(
    (cat) => getSectionForCategory(cat.slug) === 'accessories'
  );
  
  const categoryIds = new Set(categories.map(c => c.id));
  const products = (allProducts || []).filter(
    (p) => categoryIds.has(p.category_id)
  );

  return (
    <>
      <div 
        className="hero-banner" 
        style={{ 
          background: 'linear-gradient(rgba(10,10,11,0.7), rgba(10,10,11,0.9)), url("/images/accessories_universe.png")', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          minHeight: '220px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: '750px', padding: '0 20px' }}>
          <h1 className="hero-banner-title">Collection Accessoires</h1>
          <p className="hero-banner-desc">
            Sublimez votre style avec nos accessoires soigneusement sélectionnés : maroquinerie, bijoux, montres, casquettes, high-tech et indispensables du quotidien.
          </p>
        </div>
      </div>
      <CatalogClient categories={categories} products={products} initialFilter={initialFilter} />
    </>
  );
}
