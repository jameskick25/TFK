import { createClient } from '@/utils/supabase/server';
import CatalogClient from './catalog/CatalogClient';
import { getSectionForCategory } from '@/utils/sections';

export const revalidate = 60;

export const metadata = {
  title: 'TFK Store — Boutique de Vêtements & Accessoires Téléphone',
  description: 'Découvrez notre collection de vêtements modernes et nos accessoires téléphoniques premium. Style et élégance pour tous.',
};

export default async function Home() {
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
      <div className="hero-banner" style={{ background: 'linear-gradient(rgba(10,10,11,0.85), rgba(10,10,11,0.95)), url("/images/clothes_universe.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <h1 className="hero-banner-title">Collection Vêtements</h1>
        <p className="hero-banner-desc">
          Trouvez votre style idéal avec des tissus de qualité et des coupes ultra-confortables.
        </p>
      </div>
      <CatalogClient categories={categories} products={products} />
    </>
  );
}
