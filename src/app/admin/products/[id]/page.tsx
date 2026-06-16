import { createAdminClient } from '@/utils/supabase/server';
import EditProductClient from './EditProductClient';
import { notFound } from 'next/navigation';

export const revalidate = 0;

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createAdminClient();
  const { id } = await params;

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <EditProductClient product={product} categories={categories || []} />
    </div>
  );
}
