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
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1f36', margin: 0 }}>Gestion des Stocks</h1>
      </div>
      
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        Modifiez directement les quantités dans le tableau. Les changements sont enregistrés automatiquement.
      </p>

      <StockTable initialVariants={formattedVariants} />
    </div>
  );
}
