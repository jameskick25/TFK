import { createAdminClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import OrderDetailsClient from './OrderDetailsClient';

export const revalidate = 0;

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createAdminClient();
  const { id } = await params;

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !order) {
    notFound();
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  return <OrderDetailsClient order={order} items={items || []} />;
}
