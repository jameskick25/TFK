import { createAdminClient } from '@/utils/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = await createAdminClient();
  
  // Fetch quick stats
  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });
    
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: categoriesCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });

  // Recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, customer_name, phone, wilaya, order_total, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header / Greeting */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: '4px' }}>
            Tableau de Bord
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#09090b', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Vue d'ensemble
          </h1>
          <p style={{ color: '#71717a', fontSize: '0.95rem', marginTop: '4px' }}>
            Suivi des ventes, stocks et commandes de votre boutique TFK Store.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href="/admin/products/new"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(154, 52, 18, 0.25)',
              transition: 'all 0.2s'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouveau Produit
          </Link>
          <Link
            href="/"
            target="_blank"
            style={{
              backgroundColor: '#ffffff',
              color: '#09090b',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #e4e4e7',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Voir la Boutique
          </Link>
        </div>
      </div>
      
      {/* Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '32px' }}>
        
        {/* Orders Card */}
        <Link
          href="/admin/orders"
          style={{
            backgroundColor: '#fff',
            padding: '22px 20px',
            borderRadius: '12px',
            border: '1px solid #e4e4e7',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            textDecoration: 'none',
            display: 'block',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#71717a', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Commandes
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#09090b', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
            {ordersCount || 0}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 500, marginTop: '8px', display: 'inline-block' }}>
            Gérer les commandes →
          </span>
        </Link>

        {/* Products Card */}
        <Link
          href="/admin/products"
          style={{
            backgroundColor: '#fff',
            padding: '22px 20px',
            borderRadius: '12px',
            border: '1px solid #e4e4e7',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            textDecoration: 'none',
            display: 'block',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#71717a', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Produits Actifs
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#09090b', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
            {productsCount || 0}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 500, marginTop: '8px', display: 'inline-block' }}>
            Voir le catalogue →
          </span>
        </Link>

        {/* Categories Card */}
        <Link
          href="/admin/categories"
          style={{
            backgroundColor: '#fff',
            padding: '22px 20px',
            borderRadius: '12px',
            border: '1px solid #e4e4e7',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            textDecoration: 'none',
            display: 'block',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#71717a', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Catégories
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#09090b', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
            {categoriesCount || 0}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 500, marginTop: '8px', display: 'inline-block' }}>
            Organiser les rayons →
          </span>
        </Link>

      </div>

      {/* Recent Orders Section */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e4e4e7', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #f4f4f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#09090b' }}>
            Dernières Commandes
          </h2>
          <Link href="/admin/orders" style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Tout afficher →
          </Link>
        </div>

        {recentOrders && recentOrders.length > 0 ? (
          <div>
            {recentOrders.map(order => (
              <div
                key={order.id}
                style={{
                  padding: '16px 22px',
                  borderBottom: '1px solid #f4f4f5',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#09090b', fontSize: '0.95rem' }}>
                    {order.customer_name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '2px' }}>
                    {order.phone} • {order.wilaya} • {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#09090b', fontSize: '0.95rem' }}>
                      {order.order_total} DA
                    </div>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        backgroundColor: order.status === 'nouvelle' ? '#dbeafe' : '#f3f4f6',
                        color: order.status === 'nouvelle' ? '#1e40af' : '#374151',
                        display: 'inline-block',
                        marginTop: '2px'
                      }}
                    >
                      {order.status}
                    </span>
                  </div>

                  <Link
                    href={`/admin/orders/${order.id}`}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e4e4e7',
                      color: '#09090b',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    Voir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: '#71717a', fontSize: '0.9rem' }}>
            Aucune commande récente.
          </div>
        )}
      </div>
    </div>
  );
}
