import { createAdminClient } from '@/utils/supabase/server';
import Link from 'next/link';

export const revalidate = 0; // Force dynamic to always show latest products

export default async function AdminProducts() {
  const supabase = await createAdminClient();
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1f36' }}>Produits</h1>
        <Link href="/admin/products/new" style={{ backgroundColor: '#1e3a5f', color: '#fff', padding: '10px 20px', borderRadius: '4px', textDecoration: 'none', fontWeight: '500' }}>
          + Ajouter un produit
        </Link>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '16px', color: '#4b5563', fontWeight: '500' }}>Nom</th>
                <th style={{ padding: '16px', color: '#4b5563', fontWeight: '500' }}>Catégorie</th>
                <th style={{ padding: '16px', color: '#4b5563', fontWeight: '500' }}>Prix (DZD)</th>
                <th style={{ padding: '16px', color: '#4b5563', fontWeight: '500' }}>Statut</th>
                <th style={{ padding: '16px', color: '#4b5563', fontWeight: '500' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px', fontWeight: '500', color: '#111827' }}>{product.name}</td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>{product.categories?.name || '-'}</td>
                    <td style={{ padding: '16px', color: '#111827' }}>{product.price}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '9999px', 
                        fontSize: '0.75rem', 
                        fontWeight: '500',
                        backgroundColor: product.is_active ? '#dcfce7' : '#f3f4f6',
                        color: product.is_active ? '#166534' : '#4b5563'
                      }}>
                        {product.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Link href={`/admin/products/${product.id}`} style={{ color: '#1e3a5f', textDecoration: 'none', fontWeight: '500' }}>
                        Éditer
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                    Aucun produit trouvé. Cliquez sur "Ajouter un produit" pour commencer.
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
