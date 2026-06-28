'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/utils/translations';

export default function CatalogClient({ 
  categories, 
  products,
  initialFilter = 'all'
}: { 
  categories: any[], 
  products: any[],
  initialFilter?: string
}) {
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const { language } = useLanguage();
  const t = useTranslation(language);

  const handleSearch = () => {
    setActiveSearchQuery(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearchQuery('');
  };

  const expandedProducts = React.useMemo(() => {
    const result: any[] = [];
    for (const p of products) {
      if (p.show_colors_separately && p.product_images?.length > 1) {
        // Find unique colors
        const colors = Array.from(new Set(p.product_images.map((img: any) => img.color).filter(Boolean)));
        if (colors.length > 0) {
          colors.forEach((color) => {
            const colorImage = p.product_images.find((img: any) => img.color === color);
            result.push({
              ...p,
              id: `${p.id}-${color}`,
              name: `${p.name} - ${color}`,
              slug: `${p.slug}?color=${encodeURIComponent(color as string)}`,
              product_images: colorImage ? [colorImage] : p.product_images
            });
          });
        } else {
          result.push(p);
        }
      } else {
        result.push(p);
      }
    }
    return result;
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    let list = expandedProducts;
    
    if (activeFilter !== 'all') {
      list = list.filter(p => p.categories?.slug === activeFilter);
    }
    
    if (activeSearchQuery.trim() !== '') {
      const query = activeSearchQuery.toLowerCase().trim();
      
      list = list.reduce((acc: any[], p) => {
        const colorParam = p.slug.includes('?color=') ? decodeURIComponent(p.slug.split('?color=')[1]) : null;

        // 1. Check for exact size match in stock
        const matchingSizeVariants = p.product_variants?.filter((v: any) => 
          v.stock > 0 && v.size && v.size.toLowerCase().trim() === query
        ) || [];

        const hasMatchingSize = matchingSizeVariants.length > 0;

        if (hasMatchingSize) {
          if (colorParam) {
            // If expanded by color, ensure THIS color has the size
            const thisColorHasSize = matchingSizeVariants.some((v: any) => v.color === colorParam);
            if (thisColorHasSize) {
              acc.push(p);
            }
            return acc;
          } else {
            // Not expanded by color. Filter the images so only available colors are shown!
            const validColors = new Set(matchingSizeVariants.map((v: any) => v.color).filter(Boolean));
            if (validColors.size > 0 && p.product_images) {
              const validImages = p.product_images.filter((img: any) => validColors.has(img.color));
              acc.push({
                ...p,
                product_images: validImages.length > 0 ? validImages : p.product_images
              });
            } else {
              acc.push(p);
            }
            return acc;
          }
        }

        // 2. Check for color match
        if (colorParam && colorParam.toLowerCase().includes(query)) {
          acc.push(p);
          return acc;
        }

        // 3. Check for name match (Avoid returning everything when searching a single letter like "s")
        if (query.length > 2) {
          if (p.name.toLowerCase().includes(query)) {
            acc.push(p);
          }
        } else {
          // For short queries (1-2 chars), require exact word match in the name
          const words = p.name.toLowerCase().split(/[\s-]+/);
          if (words.includes(query)) {
            acc.push(p);
          }
        }

        return acc;
      }, []);
    }
    
    return list;
  }, [expandedProducts, activeFilter, activeSearchQuery]);

  return (
    <section className="section" style={{ paddingTop: '24px', backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Filters Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          
          {/* Search Bar */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}
          >
            <input 
              type="text"
              placeholder={language === 'ar' ? '🔍 ابحث عن مقاس (مثل: M, 42)، لون أو اسم...' : '🔍 Rechercher une taille (ex: M, 42), une couleur ou un nom...'}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
            {activeSearchQuery ? (
              <button 
                type="button" 
                onClick={handleClearSearch}
                style={{
                  padding: '0 20px',
                  backgroundColor: '#fee2e2',
                  color: '#ef4444',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✖
              </button>
            ) : (
              <button 
                type="submit"
                style={{
                  padding: '0 20px',
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {language === 'ar' ? 'بحث' : 'Rechercher'}
              </button>
            )}
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#4b5563', fontWeight: 500, fontSize: '0.95rem' }}>
            <span>⚡ {t('filter_category')}</span>
          </div>
          <div className="filter-buttons" style={{ marginBottom: 0, paddingBottom: 0, justifyContent: 'flex-start' }}>
            <button 
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {t('all')} 
              <span style={{ 
                backgroundColor: activeFilter === 'all' ? 'rgba(255,255,255,0.25)' : '#e5e7eb', 
                color: activeFilter === 'all' ? '#fff' : '#6b7280',
                padding: '2px 8px', 
                borderRadius: '12px', 
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {products.length}
              </span>
            </button>
            {categories.map((cat) => {
              return (
                <button 
                  key={cat.id}
                  className={`filter-btn ${activeFilter === cat.slug ? 'active' : ''}`}
                  onClick={() => setActiveFilter(cat.slug)}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Display info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', color: '#6b7280', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📦</span> {t('showing_products')} {filteredProducts.length} {t('products_count')}
          </div>
        </div>

        {/* Product Grid */}
        <div className="products-grid" style={{ gap: '16px' }}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const mainImage = product.product_images?.[0]?.url || '/placeholder.jpg';
              
              // Calculate discount percentage
              const discount = product.old_price && product.old_price > product.price 
                ? Math.round(((product.old_price - product.price) / product.old_price) * 100) 
                : 0;

              return (
                <div className="product-card" key={product.id} style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff', border: '1px solid #f3f4f6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="product-card-img" style={{ position: 'relative', aspectRatio: '4/5' }}>
                    {discount > 0 && (
                      <span style={{ 
                        position: 'absolute', 
                        top: '8px', 
                        right: '8px', 
                        backgroundColor: '#ef4444', 
                        color: '#fff', 
                        padding: '2px 6px', 
                        borderRadius: '9999px', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold',
                        zIndex: 2
                      }}>
                        -{discount}%
                      </span>
                    )}
                    <Link href={`/product/${product.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                      <img src={mainImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Link>
                  </div>
                  <div className="product-card-body" style={{ padding: '10px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 className="product-card-title" style={{ 
                        fontSize: '0.9rem', 
                        marginBottom: '4px', 
                        fontWeight: '600', 
                        color: '#1f2937',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '2.4rem', // Reduced height
                        lineHeight: '1.2'
                      }}>
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="price-container" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="product-price" style={{ color: '#1a1f36', fontWeight: '800', fontSize: '1rem' }}>
                        {product.price} DA
                      </span>
                      {product.old_price && (
                        <span className="product-price-old" style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '0.75rem' }}>
                          {product.old_price} DA
                        </span>
                      )}
                    </div>
                    
                    <div className="product-card-actions" style={{ marginTop: 'auto' }}>
                      <Link 
                        href={`/product/${product.slug}`} 
                        className="btn btn-primary" 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          gap: '6px', 
                          width: '100%', 
                          padding: '8px', 
                          backgroundColor: 'var(--accent)', // Theme accent color
                          border: 'none', 
                          borderRadius: '6px', 
                          color: '#fff', 
                          fontWeight: '600', 
                          fontSize: '0.85rem',
                          transition: 'background-color 0.2s',
                          textDecoration: 'none'
                        }}
                      >
                        {t('order')}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: 'center', gridColumn: '1 / -1', marginTop: '40px', color: '#6b7280' }}>
              {t('no_products')}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
