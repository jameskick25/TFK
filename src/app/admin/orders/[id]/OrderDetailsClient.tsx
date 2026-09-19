'use client';

import { useState } from 'react';
import Link from 'next/link';
import { updateOrderStatus } from '@/app/actions/admin';

interface OrderItem {
  id: string;
  product_name: string;
  variant_info: string | null;
  quantity: number;
  price_at_time: number;
}

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  delivery_type: string;
  bureau_stopdesk: string | null;
  status: string;
  items_total: number;
  delivery_cost: number;
  order_total: number;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'nouvelle', label: 'Nouvelle', bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
  { value: 'confirmee', label: 'Confirmée', bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  { value: 'expédiée', label: 'Expédiée', bg: '#e0e7ff', color: '#4338ca', border: '#c7d2fe' },
  { value: 'livrée', label: 'Livrée', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  { value: 'annulée', label: 'Annulée', bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
];

export default function OrderDetailsClient({
  order,
  items
}: {
  order: Order;
  items: OrderItem[];
}) {
  const [currentStatus, setCurrentStatus] = useState(order.status || 'nouvelle');
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const statusConfig = STATUS_OPTIONS.find(s => s.value === currentStatus) || STATUS_OPTIONS[0];

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    setFeedback(null);
    try {
      const res = await updateOrderStatus(order.id, newStatus);
      if (res.success) {
        setCurrentStatus(newStatus);
        setFeedback('Statut mis à jour avec succès !');
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert('Erreur: ' + (res.error || 'Impossible de modifier le statut'));
      }
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <Link
          href="/admin/orders"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#71717a',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour aux commandes
        </Link>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handlePrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid #d4d4d8',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#09090b',
              cursor: 'pointer'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Imprimer bon
          </button>

          <a
            href={`tel:${order.phone}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Appeler le client
          </a>
        </div>
      </div>

      {/* Header Info */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e4e4e7',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
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
              Fiche Commande Client
            </span>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#09090b',
                margin: 0,
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em'
              }}
            >
              Commande #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p style={{ margin: '6px 0 0 0', color: '#71717a', fontSize: '0.88rem' }}>
              Passée le {new Date(order.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Status Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '180px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Statut de la commande
            </label>
            <select
              value={currentStatus}
              disabled={isUpdating}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${statusConfig.border}`,
                backgroundColor: statusConfig.bg,
                color: statusConfig.color,
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: isUpdating ? 'wait' : 'pointer',
                outline: 'none'
              }}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} style={{ backgroundColor: '#ffffff', color: '#09090b' }}>
                  {opt.label}
                </option>
              ))}
            </select>
            {feedback && (
              <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>{feedback}</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid Client & Delivery Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {/* Customer Info */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e4e4e7',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#09090b', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 14px 0' }}>
            Client
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem' }}>
            <div>
              <span style={{ color: '#71717a', fontSize: '0.82rem', display: 'block' }}>Nom complet</span>
              <strong style={{ color: '#09090b', fontSize: '1rem' }}>{order.customer_name}</strong>
            </div>
            <div>
              <span style={{ color: '#71717a', fontSize: '0.82rem', display: 'block' }}>Numéro de Téléphone</span>
              <a href={`tel:${order.phone}`} style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none', fontSize: '1.05rem' }}>
                {order.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e4e4e7',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#09090b', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 14px 0' }}>
            Livraison
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem' }}>
            <div>
              <span style={{ color: '#71717a', fontSize: '0.82rem', display: 'block' }}>Destination</span>
              <strong style={{ color: '#09090b' }}>{order.wilaya} — {order.commune}</strong>
            </div>
            <div>
              <span style={{ color: '#71717a', fontSize: '0.82rem', display: 'block' }}>Mode de livraison</span>
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: order.delivery_type === 'home' ? '#dcfce7' : '#e0e7ff',
                  color: order.delivery_type === 'home' ? '#15803d' : '#3730a3',
                  marginTop: '2px'
                }}
              >
                {order.delivery_type === 'home' ? 'À Domicile' : 'Stopdesk / Bureau'}
              </span>
            </div>
            {order.address && (
              <div>
                <span style={{ color: '#71717a', fontSize: '0.82rem', display: 'block' }}>Adresse exacte</span>
                <span style={{ color: '#27272a' }}>{order.address}</span>
              </div>
            )}
            {order.bureau_stopdesk && (
              <div>
                <span style={{ color: '#71717a', fontSize: '0.82rem', display: 'block' }}>Bureau Yalidine</span>
                <span style={{ color: '#27272a' }}>{order.bureau_stopdesk}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ordered Items */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e4e4e7',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#09090b', margin: '0 0 16px 0' }}>
          Articles commandés ({items.length})
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                backgroundColor: '#fafafa',
                borderRadius: '8px',
                border: '1px solid #f4f4f5',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#09090b', fontSize: '0.95rem' }}>
                  {item.product_name}
                </div>
                {item.variant_info && (
                  <div style={{ fontSize: '0.82rem', color: '#71717a', marginTop: '2px' }}>
                    Variante : <strong>{item.variant_info}</strong>
                  </div>
                )}
                <div style={{ fontSize: '0.82rem', color: '#52525b', marginTop: '2px' }}>
                  Quantité : <strong>{item.quantity}</strong> × {item.price_at_time?.toLocaleString()} DA
                </div>
              </div>

              <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.05rem', color: '#09090b' }}>
                {(item.quantity * item.price_at_time)?.toLocaleString()} DA
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div style={{ textAlign: 'center', color: '#71717a', padding: '24px' }}>
              Aucun article trouvé pour cette commande.
            </div>
          )}
        </div>

        {/* Financial Summary */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e4e4e7', display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '350px', marginLeft: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#52525b' }}>
            <span>Sous-total articles :</span>
            <span style={{ fontWeight: 600 }}>{order.items_total?.toLocaleString()} DA</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#52525b' }}>
            <span>Frais de livraison :</span>
            <span style={{ fontWeight: 600 }}>{order.delivery_cost?.toLocaleString()} DA</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', color: '#09090b', fontWeight: 800, paddingTop: '8px', borderTop: '2px solid #09090b' }}>
            <span>Total à encaisser :</span>
            <span style={{ color: 'var(--accent)' }}>{order.order_total?.toLocaleString()} DA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
