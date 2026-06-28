import { createClient } from '@/utils/supabase/server';
import CatalogClient from './catalog/CatalogClient';
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
      {/* Premium Light-Blue Landing Hero Section */}
      <section 
        style={{ 
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)', 
          padding: '100px 20px', 
          textAlign: 'center', 
          position: 'relative', 
          overflow: 'hidden',
          borderBottom: '1px solid var(--border)'
        }}
      >
        {/* Subtle decorative shapes */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '30%', height: '50%', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '60%', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: '800px' }}>
          <span className="hero-kicker" style={{ color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.2em' }}>TFK STORE</span>
          <h1 
            style={{ 
              fontSize: '3.5rem', 
              fontWeight: 800, 
              color: 'var(--text)', 
              letterSpacing: '-0.03em', 
              lineHeight: 1.15,
              marginBottom: '20px',
              fontFamily: 'var(--font-display)'
            }}
          >
            Le Style qui vous <span style={{ color: 'var(--accent)' }}>Ressemble</span>
          </h1>
          <p 
            style={{ 
              fontSize: '1.2rem', 
              color: 'var(--text-muted)', 
              maxWidth: '650px', 
              margin: '0 auto 36px',
              lineHeight: 1.7
            }}
          >
            Découvrez notre sélection de vêtements modernes conçus avec des finitions soignées pour vous garantir style, élégance et confort.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#catalog" className="btn btn-primary btn-lg" style={{ color: '#fff', textDecoration: 'none' }}>
              Découvrir la Collection
            </a>
            <Link href="/contact" className="btn btn-secondary btn-lg" style={{ background: '#fff', textDecoration: 'none' }}>
              Nous Contacter
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section style={{ padding: '60px 20px', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Pillar 1 */}
            <div style={{ padding: '32px 24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border)', textAlign: 'center', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🧵</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Matières & Finitions</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>Des tissus sélectionnés avec le plus grand soin pour vous offrir un confort durable et des finitions impeccables.</p>
            </div>
            {/* Pillar 2 */}
            <div style={{ padding: '32px 24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border)', textAlign: 'center', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🚚</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Livraison 58 Wilayas</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>Nous livrons rapidement dans toutes les wilayas d'Algérie avec possibilité de paiement sécurisé à la livraison.</p>
            </div>
            {/* Pillar 3 */}
            <div style={{ padding: '32px 24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border)', textAlign: 'center', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>✨</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>Style Unique</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>Des collections régulièrement renouvelées pour s'adapter à toutes vos envies et toutes les occasions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Title Anchor */}
      <div id="catalog" style={{ paddingTop: '80px', marginTop: '-80px' }}></div>
      <section style={{ padding: '60px 0 20px', backgroundColor: '#f8fafc', textAlign: 'center' }}>
        <div className="container">
          <span className="hero-kicker" style={{ color: 'var(--accent)' }}>Nos articles</span>
          <h2 className="section-title" style={{ marginBottom: '8px' }}>Explorez notre Collection Vêtements</h2>
          <p className="section-subtitle" style={{ marginBottom: 0 }}>
            Utilisez les filtres par catégorie ou la recherche par taille pour trouver votre bonheur.
          </p>
        </div>
      </section>

      <CatalogClient categories={categories} products={products} />
    </>
  );
}
