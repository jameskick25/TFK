import { createAdminClient } from '@/utils/supabase/server';
import Link from 'next/link';

export const revalidate = 0; // Force dynamic

export default async function AdminOrders() {
  const supabase = await createAdminClient();
  
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nouvelle':
        return { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' };
      case 'expédiée':
      case 'confirmee':
        return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
      case 'livrée':
        return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
      case 'annulée':
        return { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' };
      default:
        return { bg: '#f4f4f5', text: '#3f3f46', border: '#e4e4e7' };
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: '4px' }}>
            Gestion Commerciale
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#09090b', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Commandes Clients
          </h1>
        </div>
        <div style={{ fontSize: '0.9rem', color: '#71717a', fontWeight: 500, backgroundColor: '#ffffff', padding: '6px 14px', borderRadius: '20px', border: '1px solid #e4e4e7' }}>
          Total : <strong>{orders?.length || 0}</strong> commande(s)
        </div>
      </div>

      {/* ── MOBILE CARD VIEW (< 768px) ── */}
      <div className="orders-mobile-list" style={{ display: 'none', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {orders && orders.length > 0 ? (
          orders.map((order) => {
            const statusStyle = getStatusColor(order.status || 'nouvelle');
            return (
              <div
                key={order.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e4e4e7',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#09090b' }}>
                      {order.customer_name}
                    </div>
                    <a href={`tel:${order.phone}`} style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: '2px' }}>
                      {order.phone}
                    </a>
                  </div>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.text,
                      border: `1px solid ${statusStyle.border}`
                    }}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Info row */}
                <div style={{ fontSize: '0.85rem', color: '#52525b', backgroundColor: '#fafafa', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px', lineHeight: 1.5 }}>
                  <div>
                    <strong>Destination :</strong> {order.wilaya} - {order.commune}
                  </div>
                  <div style={{ color: '#71717a', fontSize: '0.8rem', marginTop: '2px' }}>
                    Type : {order.delivery_type === 'home' ? 'À domicile' : 'Bureau Stopdesk'} • {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                {/* Footer row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#71717a', display: 'block' }}>Montant Total</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09090b' }}>
                      {order.order_total} DA
                    </span>
                  </div>

                  <Link
                    href={`/admin/orders/${order.id}`}
                    style={{
                      backgroundColor: '#09090b',
                      color: '#ffffff',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    Détails →
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '36px 20px', textAlign: 'center', color: '#71717a' }}>
            Aucune commande enregistrée.
          </div>
        )}
      </div>

      {/* ── DESKTOP TABLE VIEW (>= 768px) ── */}
      <div className="orders-desktop-table" style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e4e4e7', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e4e4e7' }}>
                <th style={{ padding: '14px 20px', color: '#52525b', fontWeight: 600, fontSize: '0.85rem' }}>Date</th>
                <th style={{ padding: '14px 20px', color: '#52525b', fontWeight: 600, fontSize: '0.85rem' }}>Client</th>
                <th style={{ padding: '14px 20px', color: '#52525b', fontWeight: 600, fontSize: '0.85rem' }}>Livraison</th>
                <th style={{ padding: '14px 20px', color: '#52525b', fontWeight: 600, fontSize: '0.85rem' }}>Total</th>
                <th style={{ padding: '14px 20px', color: '#52525b', fontWeight: 600, fontSize: '0.85rem' }}>Statut</th>
                <th style={{ padding: '14px 20px', color: '#52525b', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map(order => {
                const statusStyle = getStatusColor(order.status || 'nouvelle');
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                    <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: '#71717a' }}>
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#09090b', fontSize: '0.92rem' }}>{order.customer_name}</div>
                      <div style={{ fontSize: '0.82rem', color: '#71717a' }}>{order.phone}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 500, color: '#27272a', fontSize: '0.9rem' }}>{order.wilaya} - {order.commune}</div>
                      <div style={{ fontSize: '0.78rem', color: '#71717a' }}>{order.delivery_type === 'home' ? 'À domicile' : 'Stopdesk'}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, fontSize: '0.95rem', color: '#09090b' }}>
                      {order.order_total} DA
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '9999px', 
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                        border: `1px solid ${statusStyle.border}`
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        style={{
                          backgroundColor: '#f4f4f5',
                          border: '1px solid #e4e4e7',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          display: 'inline-block',
                          textDecoration: 'none',
                          color: '#09090b',
                          fontSize: '0.82rem',
                          fontWeight: 600
                        }}
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={6} style={{ padding: '36px 20px', textAlign: 'center', color: '#71717a' }}>
                    Aucune commande pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .orders-desktop-table {
            display: none !important;
          }
          .orders-mobile-list {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
