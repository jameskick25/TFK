import { createAdminClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { getSectionForCategory } from '@/utils/sections';

export const revalidate = 0; // Force dynamic to always show latest products

export default async function AdminProducts() {
  const supabase = await createAdminClient();
  
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name, slug), product_images(url, is_main)')
    .order('created_at', { ascending: false });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              display: 'block',
              marginBottom: '4px'
            }}
          >
            Catalogue E-Commerce
          </span>
          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#09090b',
              margin: 0,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em'
            }}
          >
            Tous les Produits
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              fontSize: '0.85rem',
              color: '#71717a',
              fontWeight: 500,
              backgroundColor: '#ffffff',
              padding: '8px 14px',
              borderRadius: '20px',
              border: '1px solid #e4e4e7'
            }}
          >
            Total : <strong>{products?.length || 0}</strong> produit(s)
          </div>

          <Link
            href="/admin/products/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#09090b',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.88rem',
              letterSpacing: '0.02em',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'background-color 0.2s ease'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouveau Produit
          </Link>
        </div>
      </div>

      {/* ── MOBILE CARDS VIEW (< 768px) ── */}
      <div className="admin-mobile-view" style={{ display: 'none', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {products && products.length > 0 ? (
          products.map((product) => {
            const mainImg = product.product_images?.find((img: any) => img.is_main) || product.product_images?.[0];
            const section = getSectionForCategory(product.categories?.slug);
            const publicUrl = `/${section === 'accessories' ? 'accessories' : 'clothes'}/product/${product.slug}`;

            return (
              <div
                key={product.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e4e4e7',
                  padding: '14px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '8px',
                      backgroundColor: '#f4f4f5',
                      overflow: 'hidden',
                      flexShrink: 0,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {mainImg?.url ? (
                      <img
                        src={mainImg.url}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#09090b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {product.name}
                      </h3>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          flexShrink: 0,
                          backgroundColor: product.is_active ? '#dcfce7' : '#f4f4f5',
                          color: product.is_active ? '#15803d' : '#71717a'
                        }}
                      >
                        {product.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: section === 'accessories' ? '#ecfdf5' : '#eff6ff',
                          color: section === 'accessories' ? '#065f46' : '#1e40af',
                          fontWeight: 600
                        }}
                      >
                        {product.categories?.name || 'Non classé'}
                      </span>

                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09090b' }}>
                        {product.price?.toLocaleString()} DA
                        {product.old_price && (
                          <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#a1a1aa', marginLeft: '6px', fontWeight: 400 }}>
                            {product.old_price?.toLocaleString()} DA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f4f4f5' }}>
                  <Link
                    href={`/admin/products/${product.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      backgroundColor: '#09090b',
                      color: '#ffffff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      minHeight: '38px'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Modifier
                  </Link>

                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      backgroundColor: '#ffffff',
                      color: '#3f3f46',
                      border: '1px solid #e4e4e7',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      minHeight: '38px'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Voir site
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e4e4e7', padding: '32px', textAlign: 'center', color: '#71717a' }}>
            Aucun produit trouvé.
          </div>
        )}
      </div>

      {/* ── DESKTOP TABLE VIEW (>= 768px) ── */}
      <div
        className="admin-desktop-view"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e4e4e7',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e4e4e7' }}>
              <th style={{ padding: '14px 20px', color: '#71717a', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '70px' }}>Visuel</th>
              <th style={{ padding: '14px 20px', color: '#71717a', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nom du Produit</th>
              <th style={{ padding: '14px 20px', color: '#71717a', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catégorie</th>
              <th style={{ padding: '14px 20px', color: '#71717a', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prix</th>
              <th style={{ padding: '14px 20px', color: '#71717a', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</th>
              <th style={{ padding: '14px 20px', color: '#71717a', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products && products.length > 0 ? (
              products.map((product) => {
                const mainImg = product.product_images?.find((img: any) => img.is_main) || product.product_images?.[0];
                const section = getSectionForCategory(product.categories?.slug);
                const publicUrl = `/${section === 'accessories' ? 'accessories' : 'clothes'}/product/${product.slug}`;

                return (
                  <tr key={product.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                    <td style={{ padding: '12px 20px' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '6px',
                          backgroundColor: '#f4f4f5',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {mainImg?.url ? (
                          <img
                            src={mainImg.url}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#09090b', fontSize: '0.92rem' }}>{product.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#a1a1aa', marginTop: '2px' }}>ID: {product.id.slice(0, 8)}...</div>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          backgroundColor: section === 'accessories' ? '#ecfdf5' : '#eff6ff',
                          color: section === 'accessories' ? '#065f46' : '#1e40af',
                          fontWeight: 600
                        }}
                      >
                        {product.categories?.name || 'Non classé'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontWeight: 700, color: '#09090b', fontSize: '0.92rem' }}>
                        {product.price?.toLocaleString()} DA
                      </span>
                      {product.old_price && (
                        <div style={{ fontSize: '0.78rem', color: '#a1a1aa', textDecoration: 'line-through' }}>
                          {product.old_price?.toLocaleString()} DA
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: product.is_active ? '#dcfce7' : '#f4f4f5',
                          color: product.is_active ? '#15803d' : '#71717a'
                        }}
                      >
                        {product.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                        <Link
                          href={`/admin/products/${product.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#09090b',
                            color: '#ffffff',
                            textDecoration: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                        >
                          Modifier
                        </Link>
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Voir sur la boutique"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            border: '1px solid #e4e4e7',
                            color: '#71717a',
                            textDecoration: 'none'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#71717a' }}>
                  Aucun produit trouvé. Cliquez sur &quot;Nouveau Produit&quot; pour commencer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
