'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteOrder } from '@/app/actions/admin';

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  wilaya: string;
  commune: string;
  delivery_type: string;
  status: string;
  order_total: number;
  created_at: string;
}

const STATUS_FILTERS = [
  { key: 'all', label: 'Toutes' },
  { key: 'nouvelle', label: 'Nouvelles' },
  { key: 'confirmee', label: 'Confirmées' },
  { key: 'expédiée', label: 'Expédiées' },
  { key: 'livrée', label: 'Livrées' },
  { key: 'annulée', label: 'Annulées' },
];

export default function OrdersListClient({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        order.customer_name?.toLowerCase().includes(query) ||
        order.phone?.includes(query) ||
        order.id?.toLowerCase().includes(query) ||
        order.wilaya?.toLowerCase().includes(query) ||
        order.commune?.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleDelete = async (orderId: string, customerName: string) => {
    const ok = window.confirm(`Voulez-vous vraiment supprimer définitivement la commande de "${customerName}" ?`);
    if (!ok) return;

    setDeletingId(orderId);
    try {
      const res = await deleteOrder(orderId);
      if (res.success) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        router.refresh();
      } else {
        alert('Erreur lors de la suppression : ' + (res.error || 'Erreur inconnue'));
      }
    } catch (err: any) {
      alert('Erreur lors de la suppression : ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: '4px' }}>
            Gestion Commerciale
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#09090b', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Commandes Clients
          </h1>
        </div>
        <div style={{ fontSize: '0.9rem', color: '#71717a', fontWeight: 500, backgroundColor: '#ffffff', padding: '6px 14px', borderRadius: '20px', border: '1px solid #e4e4e7' }}>
          Total : <strong>{orders.length}</strong> commande(s)
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e4e4e7',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par client, tél, wilaya, ID..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #d4d4d8',
                fontSize: '0.92rem',
                outline: 'none',
                backgroundColor: '#fafafa'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map(f => {
              const active = statusFilter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: active ? '#09090b' : '#e4e4e7',
                    backgroundColor: active ? '#09090b' : '#ffffff',
                    color: active ? '#ffffff' : '#3f3f46',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MOBILE VIEW (< 768px) ── */}
      <div className="orders-mobile-list" style={{ display: 'none', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const statusStyle = getStatusColor(order.status || 'nouvelle');
            const isDeleting = deletingId === order.id;

            return (
              <div
                key={order.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e4e4e7',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  opacity: isDeleting ? 0.5 : 1,
                  transition: 'opacity 0.2s'
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
                      {order.order_total?.toLocaleString()} DA
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      style={{
                        backgroundColor: '#09090b',
                        color: '#ffffff',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Détails
                    </Link>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => handleDelete(order.id, order.customer_name)}
                      style={{
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #fecaca',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: isDeleting ? 'wait' : 'pointer'
                      }}
                    >
                      {isDeleting ? '...' : 'Supprimer'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '36px 20px', textAlign: 'center', color: '#71717a' }}>
            Aucune commande trouvée.
          </div>
        )}
      </div>

      {/* ── DESKTOP TABLE VIEW (>= 768px) ── */}
      <div className="orders-desktop-table" style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e4e4e7', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
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
              {filteredOrders.map(order => {
                const statusStyle = getStatusColor(order.status || 'nouvelle');
                const isDeleting = deletingId === order.id;

                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f4f4f5', opacity: isDeleting ? 0.5 : 1 }}>
                    <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: '#71717a' }}>
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#09090b', fontSize: '0.92rem' }}>{order.customer_name}</div>
                      <a href={`tel:${order.phone}`} style={{ fontSize: '0.82rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                        {order.phone}
                      </a>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 500, color: '#27272a', fontSize: '0.9rem' }}>{order.wilaya} - {order.commune}</div>
                      <div style={{ fontSize: '0.78rem', color: '#71717a' }}>{order.delivery_type === 'home' ? 'À domicile' : 'Stopdesk'}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, fontSize: '0.95rem', color: '#09090b' }}>
                      {order.order_total?.toLocaleString()} DA
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
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
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

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDelete(order.id, order.customer_name)}
                          style={{
                            backgroundColor: '#fff',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: isDeleting ? 'wait' : 'pointer'
                          }}
                        >
                          {isDeleting ? '...' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '36px 20px', textAlign: 'center', color: '#71717a' }}>
                    Aucune commande ne correspond à vos critères.
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
