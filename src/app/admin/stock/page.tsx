import { createAdminClient } from '@/utils/supabase/server';
import StockTable from './StockTable';

export const revalidate = 0; // Disable caching so stock is always fresh

export default async function StockPage() {
  const supabase = await createAdminClient();
  
  // Fetch variants joined with products to get product names
  const { data: variants } = await supabase
    .from('product_variants')
    .select(`
      id,
      color,
      size,
      stock,
      product_id,
      products (
        name,
        categories (
          name
        )
      )
    `)
    .order('product_id', { ascending: true });

  // Format data for the client component
  const formattedVariants = variants?.map(v => {
    const product = Array.isArray(v.products) ? v.products[0] : v.products;
    const category = product?.categories as any;
    const categoryName = Array.isArray(category) ? category[0]?.name : (category?.name || 'Sans Catégorie');
    
    return {
      id: v.id,
      productName: product?.name || 'Produit Inconnu',
      categoryName,
      color: v.color || '-',
      size: v.size || '-',
      stock: v.stock
    };
  }) || [];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
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
          Inventaire & Logistique
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
          Gestion des Stocks
        </h1>
        <p style={{ color: '#71717a', fontSize: '0.92rem', marginTop: '6px' }}>
          Ajustez directement les quantités par couleur et taille dans la matrice. Cliquez ensuite sur &quot;Enregistrer&quot;.
        </p>
      </div>

      <StockTable initialVariants={formattedVariants} />
    </div>
  );
}
