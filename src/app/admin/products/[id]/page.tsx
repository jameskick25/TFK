import { createAdminClient } from '@/utils/supabase/server';
import EditProductClient from './EditProductClient';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 0;

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createAdminClient();
  const { id } = await params;

  const { data: product, error } = await supabase
    .from('products')
    .select('*, product_images(*), product_variants(*)')
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Breadcrumb / Back */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          href="/admin/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#71717a',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 500
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour aux produits
        </Link>
      </div>

      <EditProductClient product={product} categories={categories || []} />
    </div>
  );
}
