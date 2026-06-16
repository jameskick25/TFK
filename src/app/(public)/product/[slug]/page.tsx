import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { getSectionForCategory } from '@/utils/sections';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  
  // Fetch Product with category to determine universe
  const { data: product } = await supabase
    .from('products')
    .select('*, categories(slug)')
    .eq('slug', slug)
    .single();

  if (!product) return notFound();

  const section = getSectionForCategory(product.categories?.slug || '');
  
  if (section === 'accessories') {
    redirect(`/accessories/product/${slug}`);
  } else {
    redirect(`/clothes/product/${slug}`);
  }
}
