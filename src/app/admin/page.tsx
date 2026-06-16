import { createAdminClient } from '@/utils/supabase/server';

export default async function AdminDashboard() {
  const supabase = await createAdminClient();
  
  // Fetch some quick stats
  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });
    
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '24px', color: '#1a1f36' }}>Tableau de Bord</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        
        {/* Stat Card 1 */}
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '8px' }}>
            Commandes Totales
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1f36' }}>{ordersCount || 0}</p>
        </div>

        {/* Stat Card 2 */}
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '8px' }}>
            Produits Actifs
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1f36' }}>{productsCount || 0}</p>
        </div>

      </div>
    </div>
  );
}
