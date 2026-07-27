import { createClient } from '@/utils/supabase/server';
import { getSectionForCategory } from '@/utils/sections';
import Link from 'next/link';

export const revalidate = 60;

export const metadata = {
  title: 'TFK Store — Boutique de Vêtements en Ligne',
  description: 'Découvrez notre collection de vêtements modernes et élégants. Des coupes confortables et des matières sélectionnées avec soin.',
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

  // Filter for clothes universe categories
  const categories = (allCategories || []).filter(
    (cat) => getSectionForCategory(cat.slug) === 'clothes'
  );
  
  const categoryIds = new Set(categories.map(c => c.id));
  // Filter for clothes products and limit to top 4 featured
  const featuredProducts = (allProducts || [])
    .filter((p) => categoryIds.has(p.category_id))
    .slice(0, 4);

  return (
    <>
      {/* Editorial High-Fashion Hero */}
      <section 
        style={{ 
          position: 'relative', 
          height: '75vh', 
          minHeight: '500px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundImage: 'linear-gradient(rgba(9, 9, 11, 0.4), rgba(9, 9, 11, 0.55)), url("/images/clothes_universe.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          color: '#ffffff',
          textAlign: 'center',
          padding: '0 24px'
        }}
      >
        <div style={{ maxWidth: '800px', zIndex: 2 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#f4f4f5', display: 'block', marginBottom: '16px' }}>
            Collection exclusive
          </span>
          <h1 
            style={{ 
              fontSize: '3.5rem', 
              fontWeight: 800, 
              color: '#ffffff', 
              letterSpacing: '0.04em', 
              textTransform: 'uppercase',
              lineHeight: 1.15,
              marginBottom: '24px',
              fontFamily: 'var(--font-display)'
            }}
          >
            Le style à l'état pur
          </h1>
          <p 
            style={{ 
              fontSize: '1.15rem', 
              color: 'rgba(250,250,250,0.9)', 
              maxWidth: '580px', 
              margin: '0 auto 36px',
              lineHeight: 1.6
            }}
          >
            Découvrez notre sélection de vêtements modernes conçus avec des tissus nobles et des finitions soignées pour vous garantir élégance et confort.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link href="/clothes" className="btn btn-secondary btn-lg" style={{ color: '#fff', borderColor: '#fff', padding: '14px 40px', fontWeight: 700 }}>
              Explorer le catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Category Grid */}
      <section className="section" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <span className="hero-kicker" style={{ textAlign: 'center', display: 'block' }}>Collections</span>
          <h2 className="section-title" style={{ marginBottom: '40px', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1.8rem' }}>Catégories à la une</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {categories.slice(0, 3).map((cat, i) => {
              const fallbackImages = [
                'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
              ];
              const bgImg = cat.image_url || fallbackImages[i % fallbackImages.length];
              
              return (
                <Link 
                  key={cat.id} 
                  href={`/clothes?filter=${cat.slug}`}
                  style={{ 
                    position: 'relative', 
                    height: '420px', 
                    borderRadius: 'var(--radius-sm)', 
                    overflow: 'hidden', 
                    display: 'flex', 
                    alignItems: 'flex-end', 
                    padding: '24px',
                    backgroundImage: `linear-gradient(to top, rgba(9, 9, 11, 0.8) 0%, rgba(9, 9, 11, 0.2) 60%), url("${bgImg}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: 'var(--shadow)',
                    textDecoration: 'none'
                  }}
                >
                  <div style={{ zIndex: 2, color: '#ffffff' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '4px' }}>Explorer</span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff' }}>{cat.name}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Best Sellers Section */}
      <section className="section" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="container">
          <span className="hero-kicker" style={{ textAlign: 'center', display: 'block' }}>Sélection Spéciale</span>
          <h2 className="section-title" style={{ marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1.8rem' }}>Les essentiels de saison</h2>
          <p className="section-subtitle" style={{ marginBottom: '48px' }}>Une sélection de nos pièces phares pour parfaire votre dressing.</p>

          <div className="products-grid">
            {featuredProducts.map((product) => {
              const mainImage = product.product_images?.[0]?.url || '/placeholder.jpg';
              return (
                <div key={product.id} className="product-card" style={{ backgroundColor: '#fff' }}>
                  <div className="product-card-img">
                    <Link href={`/product/${product.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                      <img src={mainImage} alt={product.name} />
                    </Link>
                  </div>
                  <div className="product-card-body" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <div>
                      <h3 className="product-card-title" style={{ minHeight: '2.5rem', lineHeight: '1.25', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        <Link href={`/product/${product.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {product.name}
                        </Link>
                      </h3>
                      <div className="price-container">
                        <span className="product-price">{product.price} DA</span>
                        {product.old_price && (
                          <span className="product-price-old">{product.old_price} DA</span>
                        )}
                      </div>
                    </div>
                    <Link href={`/product/${product.slug}`} className="btn btn-primary btn-sm" style={{ width: '100%', textAlign: 'center', display: 'block', marginTop: '12px' }}>
                      Découvrir l'article
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link href="/clothes" className="btn btn-secondary btn-lg" style={{ fontWeight: 700 }}>
              Voir toute la collection
            </Link>
          </div>
        </div>
      </section>

      {/* Luxury Quality Showcase Banner */}
      <section style={{ backgroundColor: 'var(--bg-dark)', color: '#ffffff', padding: '80px 20px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: '16px' }}>
            À propos de nous
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Matières nobles & service de qualité
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '36px' }}>
            Chez TFK Store, nous accordons une importance primordiale au choix des tissus et à la précision des coupes. Nos vêtements sont sélectionnés pour vous garantir un confort exceptionnel et une durabilité sans compromis.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.95)' }}>
              🚚 Livraison 58 Wilayas
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.95)' }}>
              💳 Paiement à la Livraison
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.95)' }}>
              🔄 Échange Facile
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
