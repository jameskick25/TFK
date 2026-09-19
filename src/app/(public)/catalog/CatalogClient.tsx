'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/utils/translations';
import { getSectionForCategory } from '@/utils/sections';

interface Category {
  id: string;
  name: string;
  slug: string;
  display_order?: number;
}

interface ParsedCategory extends Category {
  parentId: string | null;
  cleanSlug: string;
  isSub: boolean;
}

function parseCategory(cat: Category): ParsedCategory {
  if (cat.slug?.startsWith('sub--')) {
    const withoutPrefix = cat.slug.slice(5);
    const splitIndex = withoutPrefix.indexOf('--');
    if (splitIndex !== -1) {
      const parentId = withoutPrefix.slice(0, splitIndex);
      const cleanSlug = withoutPrefix.slice(splitIndex + 2);
      return {
        ...cat,
        parentId,
        cleanSlug,
        isSub: true
      };
    }
  }
  return {
    ...cat,
    parentId: null,
    cleanSlug: cat.slug,
    isSub: false
  };
}

export default function CatalogClient({ 
  categories: rawCategories, 
  products,
  initialFilter = 'all'
}: { 
  categories: Category[]; 
  products: any[];
  initialFilter?: string;
}) {
  const { language } = useLanguage();
  const t = useTranslation(language);

  // Parse categories hierarchy
  const parsedCategories = useMemo(() => {
    return (rawCategories || []).map(parseCategory);
  }, [rawCategories]);

  const parentCategories = useMemo(() => {
    return parsedCategories.filter(c => !c.isSub);
  }, [parsedCategories]);

  // Filter & Sort state
  const [selectedParent, setSelectedParent] = useState<string>('all');
  const [selectedSub, setSelectedSub] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc'>('default');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Initialize filter from prop if passed
  useEffect(() => {
    if (initialFilter && initialFilter !== 'all') {
      const matched = parsedCategories.find(c => c.slug === initialFilter || c.cleanSlug === initialFilter);
      if (matched) {
        if (matched.isSub && matched.parentId) {
          setSelectedParent(matched.parentId);
          setSelectedSub(matched.id);
        } else {
          setSelectedParent(matched.id);
          setSelectedSub('all');
        }
      }
    }
  }, [initialFilter, parsedCategories]);

  // Available subcategories for the selected parent
  const availableSubcategories = useMemo(() => {
    if (selectedParent === 'all') return [];
    return parsedCategories.filter(c => c.isSub && (c.parentId === selectedParent || c.parentId === parentCategories.find(p => p.id === selectedParent)?.slug));
  }, [selectedParent, parsedCategories, parentCategories]);

  // Reset subcategory if parent changes and sub is not in new parent
  const handleParentChange = (newParentId: string) => {
    setSelectedParent(newParentId);
    setSelectedSub('all');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearchQuery(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearchQuery('');
  };

  const handleResetFilters = () => {
    setSelectedParent('all');
    setSelectedSub('all');
    setSortBy('default');
    setSearchInput('');
    setActiveSearchQuery('');
    setMobileFilterOpen(false);
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedParent !== 'all') count++;
    if (selectedSub !== 'all') count++;
    if (sortBy !== 'default') count++;
    if (activeSearchQuery.trim()) count++;
    return count;
  }, [selectedParent, selectedSub, sortBy, activeSearchQuery]);

  // Expand product variations if needed
  const expandedProducts = useMemo(() => {
    const result: any[] = [];
    for (const p of products) {
      if (p.show_colors_separately && p.product_images?.length > 1) {
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

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = expandedProducts;

    // 1. Filter by category / subcategory
    if (selectedSub !== 'all') {
      list = list.filter(p => p.category_id === selectedSub);
    } else if (selectedParent !== 'all') {
      // Products directly in parent OR in any of parent's subcategories
      const allowedCatIds = new Set([
        selectedParent,
        ...availableSubcategories.map(s => s.id)
      ]);
      list = list.filter(p => allowedCatIds.has(p.category_id));
    }

    // 2. Filter by search query
    if (activeSearchQuery.trim() !== '') {
      const query = activeSearchQuery.toLowerCase().trim();
      list = list.filter(p => {
        const nameMatch = p.name?.toLowerCase().includes(query);
        const descMatch = p.description?.toLowerCase().includes(query);
        const sizeMatch = p.product_variants?.some((v: any) => v.size?.toLowerCase().trim() === query);
        const colorMatch = p.product_variants?.some((v: any) => v.color?.toLowerCase().trim() === query);
        return nameMatch || descMatch || sizeMatch || colorMatch;
      });
    }

    // 3. Sort
    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'name-asc') {
      list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return list;
  }, [expandedProducts, selectedParent, selectedSub, availableSubcategories, activeSearchQuery, sortBy]);

  const selectedParentObj = parentCategories.find(p => p.id === selectedParent);
  const selectedSubObj = availableSubcategories.find(s => s.id === selectedSub);

  return (
    <section className="section" style={{ minHeight: '80vh', padding: '32px 0 64px 0' }}>
      <div className="container">

        {/* ── Modern Filter Bar ── */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e4e4e7',
            padding: '16px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            marginBottom: '24px'
          }}
        >
          {/* Row 1: Search + Mobile Filter Trigger + Desktop Selects */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Box */}
            <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, minWidth: '220px', position: 'relative' }}>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={language === 'ar' ? 'ابحث عن منتج، مقاس، لون...' : 'Rechercher un vêtement, taille, couleur...'}
                style={{
                  width: '100%',
                  padding: '11px 42px 11px 16px',
                  borderRadius: '10px',
                  border: '1px solid #d4d4d8',
                  fontSize: '0.95rem',
                  outline: 'none',
                  backgroundColor: '#fafafa'
                }}
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#71717a',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#71717a',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              )}
            </form>

            {/* Desktop Filters (>= 768px) */}
            <div className="admin-desktop-view" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* Category Select */}
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedParent}
                  onChange={(e) => handleParentChange(e.target.value)}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #d4d4d8',
                    backgroundColor: selectedParent !== 'all' ? '#09090b' : '#ffffff',
                    color: selectedParent !== 'all' ? '#ffffff' : '#09090b',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                    minWidth: '160px'
                  }}
                >
                  <option value="all">Toutes les catégories</option>
                  {parentCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Subcategory Select (appears if parent chosen and has subs) */}
              {availableSubcategories.length > 0 && (
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedSub}
                    onChange={(e) => setSelectedSub(e.target.value)}
                    style={{
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1px solid #d4d4d8',
                      backgroundColor: selectedSub !== 'all' ? 'var(--accent)' : '#ffffff',
                      color: selectedSub !== 'all' ? '#ffffff' : '#09090b',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none',
                      minWidth: '150px'
                    }}
                  >
                    <option value="all">Toutes sous-catégories</option>
                    {availableSubcategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort Select */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1px solid #d4d4d8',
                  backgroundColor: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#3f3f46',
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: '150px'
                }}
              >
                <option value="default">Nouveautés</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="name-asc">Nom A-Z</option>
              </select>
            </div>

            {/* Mobile Filter Button (< 768px) */}
            <div className="admin-mobile-view" style={{ display: 'none' }}>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 16px',
                  borderRadius: '10px',
                  backgroundColor: activeFiltersCount > 0 ? '#09090b' : '#ffffff',
                  color: activeFiltersCount > 0 ? '#ffffff' : '#09090b',
                  border: '1px solid #d4d4d8',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Filtres
                {activeFiltersCount > 0 && (
                  <span
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: '#ffffff',
                      borderRadius: '9999px',
                      padding: '1px 6px',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}
                  >
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f4f4f5' }}>
              <span style={{ fontSize: '0.78rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Filtres actifs :
              </span>

              {selectedParent !== 'all' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    backgroundColor: '#f4f4f5',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#09090b'
                  }}
                >
                  {selectedParentObj?.name || 'Catégorie'}
                  <button onClick={() => handleParentChange('all')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 0 }}>✕</button>
                </span>
              )}

              {selectedSub !== 'all' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    backgroundColor: '#fef3c7',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#92400e'
                  }}
                >
                  {selectedSubObj?.name || 'Sous-catégorie'}
                  <button onClick={() => setSelectedSub('all')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', padding: 0 }}>✕</button>
                </span>
              )}

              {sortBy !== 'default' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    backgroundColor: '#f4f4f5',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#09090b'
                  }}
                >
                  Tri : {sortBy === 'price-asc' ? 'Prix croissant' : sortBy === 'price-desc' ? 'Prix décroissant' : 'Nom A-Z'}
                  <button onClick={() => setSortBy('default')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 0 }}>✕</button>
                </span>
              )}

              {activeSearchQuery && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    backgroundColor: '#f4f4f5',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#09090b'
                  }}
                >
                  &quot;{activeSearchQuery}&quot;
                  <button onClick={handleClearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 0 }}>✕</button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Effacer tout
              </button>
            </div>
          )}
        </div>

        {/* ── Mobile Filter Slide-out Drawer ── */}
        {mobileFilterOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                width: '85%',
                maxWidth: '360px',
                height: '100%',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
                overflowY: 'auto'
              }}
            >
              {/* Drawer Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f4f4f5' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#09090b' }}>
                  Filtrer & Trier
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#71717a', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {/* Catégories principales */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#71717a', display: 'block', marginBottom: '8px' }}>
                  Catégorie
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleParentChange('all')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #e4e4e7',
                      backgroundColor: selectedParent === 'all' ? '#09090b' : '#ffffff',
                      color: selectedParent === 'all' ? '#ffffff' : '#09090b',
                      fontWeight: 600,
                      textAlign: 'left',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    Toutes les catégories
                  </button>
                  {parentCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleParentChange(cat.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #e4e4e7',
                        backgroundColor: selectedParent === cat.id ? '#09090b' : '#ffffff',
                        color: selectedParent === cat.id ? '#ffffff' : '#09090b',
                        fontWeight: 600,
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sous-catégories */}
              {availableSubcategories.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#71717a', display: 'block', marginBottom: '8px' }}>
                    Sous-catégorie
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedSub('all')}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #e4e4e7',
                        backgroundColor: selectedSub === 'all' ? 'var(--accent)' : '#ffffff',
                        color: selectedSub === 'all' ? '#ffffff' : '#09090b',
                        fontWeight: 600,
                        textAlign: 'left',
                        fontSize: '0.88rem',
                        cursor: 'pointer'
                      }}
                    >
                      Toutes les sous-catégories
                    </button>
                    {availableSubcategories.map(sub => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSelectedSub(sub.id)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #e4e4e7',
                          backgroundColor: selectedSub === sub.id ? 'var(--accent)' : '#ffffff',
                          color: selectedSub === sub.id ? '#ffffff' : '#09090b',
                          fontWeight: 600,
                          textAlign: 'left',
                          fontSize: '0.88rem',
                          cursor: 'pointer'
                        }}
                      >
                        ↳ {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tri */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#71717a', display: 'block', marginBottom: '8px' }}>
                  Trier par
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { id: 'default', label: 'Nouveautés' },
                    { id: 'price-asc', label: 'Prix croissant' },
                    { id: 'price-desc', label: 'Prix décroissant' },
                    { id: 'name-asc', label: 'Nom A-Z' }
                  ].map(sortOpt => (
                    <button
                      key={sortOpt.id}
                      type="button"
                      onClick={() => setSortBy(sortOpt.id as any)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #e4e4e7',
                        backgroundColor: sortBy === sortOpt.id ? '#f4f4f5' : '#ffffff',
                        color: '#09090b',
                        fontWeight: sortBy === sortOpt.id ? 700 : 500,
                        textAlign: 'left',
                        fontSize: '0.88rem',
                        cursor: 'pointer'
                      }}
                    >
                      {sortOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '16px', borderTop: '1px solid #f4f4f5' }}>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  style={{
                    backgroundColor: '#09090b',
                    color: '#ffffff',
                    padding: '14px',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Voir les {filteredProducts.length} articles
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    backgroundColor: '#f4f4f5',
                    color: '#3f3f46',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #e4e4e7',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Réinitialiser tous les filtres
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Counter Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', color: '#71717a', fontSize: '0.88rem' }}>
          <div>
            <strong>{filteredProducts.length}</strong> {t('products_count')}
          </div>
        </div>

        {/* ── Product Grid ── */}
        <div className="products-grid" style={{ gap: '16px' }}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const mainImage = product.product_images?.[0]?.url || '/placeholder.jpg';
              
              const discount = product.old_price && product.old_price > product.price 
                ? Math.round(((product.old_price - product.price) / product.old_price) * 100) 
                : 0;

              const section = getSectionForCategory(product.categories?.slug || '');
              const productHref = `/${section === 'accessories' ? 'accessories' : 'clothes'}/product/${product.slug}`;

              return (
                <div className="product-card" key={product.id} style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff', border: '1px solid #f3f4f6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="product-card-img" style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden' }}>
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
                    <Link href={productHref} style={{ display: 'block', width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                      <img src={mainImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                    </Link>
                  </div>
                  <div className="product-card-body" style={{ padding: '12px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Link href={productHref} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 className="product-card-title" style={{ 
                        fontSize: '0.9rem', 
                        marginBottom: '6px', 
                        fontWeight: '600', 
                        color: '#1f2937',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '2.4rem',
                        lineHeight: '1.2',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word'
                      }}>
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="price-container" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="product-price" style={{ color: '#09090b', fontWeight: '800', fontSize: '1rem' }}>
                        {product.price?.toLocaleString()} DA
                      </span>
                      {product.old_price && (
                        <span className="product-price-old" style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '0.78rem' }}>
                          {product.old_price?.toLocaleString()} DA
                        </span>
                      )}
                    </div>
                    
                    <div className="product-card-actions" style={{ marginTop: 'auto' }}>
                      <Link 
                        href={productHref} 
                        className="btn btn-primary" 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          gap: '6px', 
                          width: '100%', 
                          padding: '10px', 
                          backgroundColor: 'var(--accent)',
                          border: 'none', 
                          borderRadius: '8px', 
                          color: '#fff', 
                          fontWeight: '600', 
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                          letterSpacing: '0.02em'
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
            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '60px 20px', color: '#71717a' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>{t('no_products')}</p>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    padding: '8px 18px',
                    backgroundColor: '#09090b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
