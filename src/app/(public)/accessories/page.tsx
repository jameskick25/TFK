import { createClient } from '@/utils/supabase/server';
import CatalogClient from '../catalog/CatalogClient';
import { getSectionForCategory } from '@/utils/sections';

export const revalidate = 60;

export const metadata = {
  title: 'Accessoires Téléphone — TFK Store',
  description: 'Optimisez votre smartphone avec les accessoires TFK Store : coques de protection premium, chargeurs rapides, câbles renforcés et plus.',
};

export default async function AccessoriesPage() {
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
      <div className="hero-banner" style={{ background: 'linear-gradient(rgba(10,10,11,0.85), rgba(10,10,11,0.95)), url("/images/accessories_universe.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <h1 className="hero-banner-title">Accessoires Téléphone</h1>
        <p className="hero-banner-desc">
          Protégez et optimisez vos smartphones avec nos coques de protection élégantes et accessoires de charge rapide.
        </p>
      </div>
      <CatalogClient categories={categories} products={products} />
    </>
  );
}
