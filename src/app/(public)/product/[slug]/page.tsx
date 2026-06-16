import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ProductClient from './ProductClient';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('products').select('name, description').eq('slug', slug).single();
  return {
    title: `${data?.name || 'Produit'} — AM MODE`,
    description: data?.description || '',
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  
  // 1. Fetch Product
  const { data: product, error } = await supabase
    .from('products')
    .select('*, product_images(url, is_main, color), categories(name)')
    .eq('slug', slug)
    .single();

  if (!product) return notFound();

  // 2. Fetch Variants (Sizes and Colors with Stock)
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', product.id);

  return <ProductClient product={product} variants={variants || []} />;
}
