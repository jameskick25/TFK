import { createAdminClient } from '@/utils/supabase/server';
import Link from 'next/link';
import NewProductForm from './NewProductForm';

export default async function NewProductPage() {
  const supabase = await createAdminClient();
  const { data: categories } = await supabase.from('categories').select('*').order('name');

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/admin/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#71717a',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 500,
            marginBottom: '10px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour aux produits
        </Link>
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
          Catalogue Boutique
        </span>
        <h1
          style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            color: '#09090b',
            margin: 0,
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em'
          }}
        >
          Ajouter un Nouveau Produit
        </h1>
      </div>

      <NewProductForm categories={categories || []} />
    </div>
  );
}
