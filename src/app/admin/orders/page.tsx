import { createAdminClient } from '@/utils/supabase/server';
import Link from 'next/link';

export const revalidate = 0; // Force dynamic

export default async function AdminOrders() {
  const supabase = await createAdminClient();
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '24px', color: '#1a1f36' }}>Commandes</h1>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', color: '#6b7280', fontWeight: '500' }}>Date</th>
                <th style={{ padding: '12px', color: '#6b7280', fontWeight: '500' }}>Client</th>
                <th style={{ padding: '12px', color: '#6b7280', fontWeight: '500' }}>Livraison</th>
                <th style={{ padding: '12px', color: '#6b7280', fontWeight: '500' }}>Total</th>
                <th style={{ padding: '12px', color: '#6b7280', fontWeight: '500' }}>Statut</th>
                <th style={{ padding: '12px', color: '#6b7280', fontWeight: '500' }}>Détails</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '500' }}>{order.customer_name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{order.phone}</div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div>{order.wilaya} - {order.commune}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{order.delivery_type === 'home' ? 'À domicile' : 'Stopdesk'}</div>
                  </td>
                  <td style={{ padding: '12px', fontWeight: '600' }}>{order.order_total} دج</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      backgroundColor: order.status === 'nouvelle' ? '#dbeafe' : '#f3f4f6',
                      color: order.status === 'nouvelle' ? '#1e40af' : '#374151'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Link href={`/admin/orders/${order.id}`} style={{ backgroundColor: 'transparent', border: '1px solid #d1d5db', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'inline-block', textDecoration: 'none', color: '#374151' }}>
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                    Aucune commande pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
