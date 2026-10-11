import { createClient } from '@/utils/supabase/server';
import { getSectionForCategory } from '@/utils/sections';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'TFK Store — Boutique de Vêtements en Ligne',
  description: 'Découvrez notre collection de vêtements modernes et élégants. Des coupes confortables et des matières sélectionnées avec soin.',
};

const getCategoryMenImage = (name: string = '', slug: string = '', index: number = 0) => {
  const text = `${name} ${slug}`.toLowerCase();

  // T-shirts / Polos / Hauts
  if (text.includes('t-shirt') || text.includes('tshirt') || text.includes('polo') || text.includes('haut')) {
    return '/images/category_tshirt.jpg';
  }
  // Accessoires / Téléphone / Coques / High-Tech
  if (
    text.includes('accessoire') || 
    text.includes('accecoire') || 
    text.includes('accessory') || 
    text.includes('accessories') || 
    text.includes('phone') || 
    text.includes('tel') || 
    text.includes('coque') || 
    text.includes('chargeur') || 
    text.includes('ecouteur') || 
    text.includes('airpod') || 
    text.includes('montre') || 
    text.includes('casquette') || 
    text.includes('sac') || 
    text.includes('lunette')
  ) {
    return '/images/category_accessories.jpg';
  }
  // Baskets / Chaussures / Sneakers
  if (text.includes('basket') || text.includes('chaussure') || text.includes('sneaker') || text.includes('shoe')) {
    return 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop';
  }
  // Sweats / Hoodies / Pulls
  if (text.includes('sweat') || text.includes('hoodie') || text.includes('pull')) {
    return 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop';
  }
  // Pantalons / Jeans / Jogging / Bas
  if (text.includes('pantalon') || text.includes('jean') || text.includes('jogging') || text.includes('bas')) {
    return 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop';
  }
  // Vestes / Manteaux / Ensembles
  if (text.includes('veste') || text.includes('manteau') || text.includes('blouson') || text.includes('ensemble') || text.includes('jacket')) {
    return 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800&auto=format&fit=crop';
  }
  // Costumes / Chemises
  if (text.includes('costume') || text.includes('chemise')) {
    return 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop';
  }

  // Fallbacks de collections
  const fashionFallbacks = [
    '/images/category_tshirt.jpg',
    '/images/category_accessories.jpg',
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800&auto=format&fit=crop',
  ];
  return fashionFallbacks[index % fashionFallbacks.length];
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
  const accessoryCategoryIds = new Set(
    (allCategories || [])
      .filter((cat) => getSectionForCategory(cat.slug) === 'accessories' || cat.slug?.toLowerCase().includes('acc'))
      .map((c) => c.id)
  );

  const categories = (allCategories || []).filter(
    (cat) => getSectionForCategory(cat.slug) === 'clothes' && !cat.slug?.toLowerCase().includes('acc')
  );

  // Featured categories for Home display (prioritizes active categories across the boutique)
  const homeCategories = (allCategories && allCategories.length > 0)
    ? allCategories.slice(0, 3)
    : categories.slice(0, 3);
  
  // Filter for clothes products (all active clothing products) and limit to top 4 featured
  const featuredProducts = (allProducts || [])
    .filter((p) => !p.category_id || !accessoryCategoryIds.has(p.category_id))
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
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/clothes" className="btn btn-secondary btn-lg" style={{ color: '#fff', borderColor: '#fff', padding: '14px 32px', fontWeight: 700 }}>
              Mode Vêtements
            </Link>
            <Link href="/accessories" className="btn btn-primary btn-lg" style={{ padding: '14px 32px', fontWeight: 700 }}>
              Accessoires
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
            {homeCategories.map((cat, i) => {
              const bgImg = cat.image_url || getCategoryMenImage(cat.name, cat.slug, i);
              const isAccessory = getSectionForCategory(cat.slug) === 'accessories' || cat.slug?.toLowerCase().includes('acc');
              const categoryHref = isAccessory ? '/accessories' : `/clothes?filter=${cat.slug}`;
              
              return (
                <Link 
                  key={cat.id} 
                  href={categoryHref}
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
              const section = getSectionForCategory(product.categories?.slug || '');
              const productHref = `/${section === 'accessories' ? 'accessories' : 'clothes'}/product/${product.slug}`;
              return (
                <div key={product.id} className="product-card" style={{ backgroundColor: '#fff' }}>
                  <div className="product-card-img" style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden' }}>
                    <Link href={productHref} style={{ display: 'block', width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                      <img src={mainImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                    </Link>
                  </div>
                  <div className="product-card-body" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <div>
                      <h3 className="product-card-title" style={{ minHeight: '2.5rem', lineHeight: '1.25', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        <Link href={productHref} style={{ color: 'inherit', textDecoration: 'none' }}>
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
                    <Link href={productHref} className="btn btn-primary btn-sm" style={{ width: '100%', textAlign: 'center', display: 'block', marginTop: '12px' }}>
                      Découvrir l'article
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link href="/clothes" className="btn btn-secondary btn-lg" style={{ fontWeight: 700 }}>
              Voir toute la collection vêtements
            </Link>
          </div>
        </div>
      </section>

      {/* Univers Accessoires Showcase Banner */}
      <section 
        style={{ 
          position: 'relative', 
          padding: '70px 24px', 
          backgroundImage: 'linear-gradient(rgba(9, 9, 11, 0.75), rgba(9, 9, 11, 0.85)), url("/images/category_accessories.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#ffffff',
          textAlign: 'center',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div className="container" style={{ maxWidth: '750px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: '12px' }}>
            Nouveau Rayon
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-display)' }}>
            L'Univers Accessoires
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: '28px' }}>
            Montres, casquettes, sacs, maroquinerie, bijoux ou high-tech : découvrez tous nos accessoires pour sublimer votre style au quotidien.
          </p>
          <Link href="/accessories" className="btn btn-secondary btn-lg" style={{ color: '#fff', borderColor: '#fff', padding: '14px 36px', fontWeight: 700 }}>
            Explorer les accessoires
          </Link>
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
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.95)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              Livraison 58 Wilayas
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.95)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Paiement à la Livraison
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.95)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Échange Facile
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
