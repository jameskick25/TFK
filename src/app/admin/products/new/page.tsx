import { createAdminClient } from '@/utils/supabase/server';
import Link from 'next/link';
import NewProductForm from './NewProductForm';

export default async function NewProductPage() {
  const supabase = await createAdminClient();
  const { data: categories } = await supabase.from('categories').select('*');

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <Link href="/admin/products" style={{ color: '#6b7280', textDecoration: 'none' }}>
          &larr; Retour
        </Link>
        <h1 style={{ fontSize: '2rem', color: '#1a1f36', margin: 0 }}>Ajouter un Produit</h1>
      </div>

      <NewProductForm categories={categories || []} />
    </div>
  );
}
