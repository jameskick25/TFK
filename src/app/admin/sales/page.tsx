import { createAdminClient } from '@/utils/supabase/server';
import SalesClient from './SalesClient';

export const revalidate = 0;

export default async function SalesPage() {
  const supabase = await createAdminClient();
  
  const { data: sales } = await supabase
    .from('manual_sales')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: '#111827' }}>📈 Ventes Externes</h1>
      </div>
      <SalesClient initialSales={sales || []} />
    </div>
  );
}
