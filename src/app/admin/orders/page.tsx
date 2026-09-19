import { createAdminClient } from '@/utils/supabase/server';
import OrdersListClient from './OrdersListClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrders() {
  const supabase = await createAdminClient();
  
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  return <OrdersListClient initialOrders={orders || []} />;
}
