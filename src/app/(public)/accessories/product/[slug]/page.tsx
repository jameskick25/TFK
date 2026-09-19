import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import AccessoriesProductClient from './AccessoriesProductClient';

export const revalidate = 60;

const getProduct = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('*, product_images(url, is_main, color), categories(name, slug)')
    .eq('slug', slug)
    .single();
  return product;
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return {
    title: `${product?.name || 'Accessoire'} — TFK Store`,
    description: product?.description || '',
  };
}

export default async function AccessoriesProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return notFound();

  const supabase = await createClient();
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', product.id);

  return <AccessoriesProductClient product={product} variants={variants || []} />;
}
