'use client';

import { useState, useMemo } from 'react';
import { updateBulkStock } from '@/app/actions/admin';

type VariantData = {
  id: string;
  productName: string;
  categoryName: string;
  color: string;
  size: string;
  stock: number;
};

const SIZE_ORDER = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

export default function StockTable({ initialVariants }: { initialVariants: VariantData[] }) {
  const [variants, setVariants] = useState<VariantData[]>(initialVariants);
  const [draftStocks, setDraftStocks] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const categories = useMemo(() => {
    const cats = Array.from(new Set(variants.map(v => v.categoryName)));
    return cats.sort();
  }, [variants]);

  const [activeCategory, setActiveCategory] = useState(categories[0] || '');

  // Combine initial stock with any drafted changes
  const getStock = (id: string) => draftStocks[id] !== undefined ? draftStocks[id] : (variants.find(v => v.id === id)?.stock || 0);

  const handleStockChange = (id: string, newStockStr: string) => {
    const newStock = parseInt(newStockStr);
    if (isNaN(newStock) || newStock < 0) return;
    setDraftStocks(prev => ({ ...prev, [id]: newStock }));
    setSaveMessage(''); // clear message on new edit
  };

  const handleSaveAll = async () => {
    if (Object.keys(draftStocks).length === 0) return;
    setIsSaving(true);
    setSaveMessage('');

    const result = await updateBulkStock(draftStocks);
    
    if (result.success) {
      // Update local variants with draft changes
      setVariants(prev => prev.map(v => draftStocks[v.id] !== undefined ? { ...v, stock: draftStocks[v.id] } : v));
      setDraftStocks({});
      setSaveMessage('Modifications enregistrées avec succès !');
    } else {
      setSaveMessage('Erreur : ' + result.error);
    }
    
    setIsSaving(false);
  };

  const handleExportCSV = () => {
    let csvContent = "Catégorie,Produit,Couleur,Taille,Stock\n";
    variants.forEach(v => {
      csvContent += `"${v.categoryName}","${v.productName}","${v.color}","${v.size}",${getStock(v.id)}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `stock_tfk_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and group
  const categoryVariants = variants.filter(v => v.categoryName === activeCategory);
  
  const groupedVariants = useMemo(() => {
    return categoryVariants.reduce((acc, variant) => {
      if (!acc[variant.productName]) acc[variant.productName] = [];
      acc[variant.productName].push(variant);
      return acc;
    }, {} as Record<string, VariantData[]>);
  }, [categoryVariants]);

  // Total stock calculated from variants + drafts FOR THIS CATEGORY
  const totalCategoryStock = categoryVariants.reduce((sum, v) => sum + getStock(v.id), 0);
  const hasUnsavedChanges = Object.keys(draftStocks).length > 0;

  return (
    <div>
      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '6px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #d4d4d8',
              background: activeCategory === cat ? '#09090b' : '#ffffff',
              color: activeCategory === cat ? '#ffffff' : '#3f3f46',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sticky Top Bar for Saving */}
      <div
        style={{
          position: 'sticky',
          top: '64px',
          zIndex: 10,
          backgroundColor: '#ffffff',
          padding: '14px 18px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #e4e4e7',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleSaveAll}
            disabled={!hasUnsavedChanges || isSaving}
            style={{ 
              padding: '8px 18px', 
              backgroundColor: hasUnsavedChanges ? '#09090b' : '#e4e4e7', 
              color: hasUnsavedChanges ? '#ffffff' : '#a1a1aa', 
              border: 'none', 
              borderRadius: '6px', 
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: hasUnsavedChanges && !isSaving ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {isSaving ? 'Enregistrement...' : 'Enregistrer le stock'}
          </button>

          {saveMessage && (
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: saveMessage.startsWith('Erreur') ? '#dc2626' : '#16a34a' }}>
              {saveMessage}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleExportCSV}
            style={{ 
              padding: '7px 14px', 
              backgroundColor: '#ffffff', 
              color: '#3f3f46', 
              border: '1px solid #d4d4d8', 
              borderRadius: '6px', 
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exporter CSV
          </button>

          <div
            style={{
              backgroundColor: '#fef3c7',
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: 700,
              color: '#92400e',
              border: '1px solid #fde68a',
              fontSize: '0.82rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            {activeCategory} : {totalCategoryStock} pièces
          </div>
        </div>
      </div>

      {/* Matrix Cards for Products */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {Object.entries(groupedVariants).map(([productName, productVariants]) => {
          const uniqueSizes = Array.from(new Set(productVariants.map(v => v.size))).sort((a, b) => {
            const indexA = SIZE_ORDER.indexOf(a);
            const indexB = SIZE_ORDER.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
          });
          
          const uniqueColors = Array.from(new Set(productVariants.map(v => v.color)));

          return (
            <div
              key={productName}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                border: '1px solid #e4e4e7'
              }}
            >
              {/* Product Header */}
              <div
                style={{
                  backgroundColor: '#09090b',
                  color: '#ffffff',
                  padding: '12px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: 700,
                  fontSize: '0.92rem'
                }}
              >
                <span>{productName}</span>
                <span style={{ fontSize: '0.78rem', color: '#a1a1aa', fontWeight: 500 }}>
                  {uniqueColors.length} couleur(s)
                </span>
              </div>
              
              {/* Responsive Matrix */}
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '400px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e4e4e7' }}>
                      <th style={{ padding: '10px 14px', width: '130px', textAlign: 'left', borderRight: '1px solid #e4e4e7', fontSize: '0.8rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Couleur
                      </th>
                      {uniqueSizes.map(size => (
                        <th key={size} style={{ padding: '10px 14px', minWidth: '60px', borderRight: '1px solid #e4e4e7', fontSize: '0.82rem', color: '#3f3f46', fontWeight: 700 }}>
                          {size}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueColors.map((color, idx) => (
                      <tr key={color} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                        <td
                          style={{
                            padding: '10px 14px',
                            fontWeight: 600,
                            color: '#09090b',
                            borderRight: '1px solid #e4e4e7',
                            borderBottom: '1px solid #e4e4e7',
                            fontSize: '0.88rem',
                            textAlign: 'left'
                          }}
                        >
                          {color}
                        </td>
                        
                        {uniqueSizes.map(size => {
                          const variant = productVariants.find(v => v.color === color && v.size === size);
                          
                          if (!variant) {
                            return (
                              <td key={size} style={{ padding: '8px', borderRight: '1px solid #e4e4e7', borderBottom: '1px solid #e4e4e7', color: '#d4d4d8' }}>
                                —
                              </td>
                            );
                          }

                          const stockValue = getStock(variant.id);
                          const isDrafted = draftStocks[variant.id] !== undefined;
                          const isZero = stockValue === 0;

                          return (
                            <td
                              key={size}
                              style={{
                                padding: '4px',
                                borderRight: '1px solid #e4e4e7',
                                borderBottom: '1px solid #e4e4e7',
                                backgroundColor: isZero ? '#fef2f2' : '#f0fdf4'
                              }}
                            >
                              <input
                                type="number"
                                value={stockValue}
                                onChange={(e) => handleStockChange(variant.id, e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px 2px',
                                  textAlign: 'center',
                                  border: isDrafted ? '2px solid #09090b' : '1px solid transparent',
                                  backgroundColor: 'transparent',
                                  fontWeight: 800,
                                  color: isZero ? '#b91c1c' : '#15803d',
                                  borderRadius: '4px',
                                  fontSize: '1rem',
                                  outline: 'none',
                                  minHeight: '36px'
                                }}
                                min="0"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {categoryVariants.length === 0 && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e4e4e7', padding: '36px', textAlign: 'center', color: '#71717a' }}>
            Aucun produit dans cette catégorie.
          </div>
        )}
      </div>
    </div>
  );
}
