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
    
    const sortedVariants = [...variants].sort((a, b) => {
      if (a.categoryName !== b.categoryName) return a.categoryName.localeCompare(b.categoryName);
      if (a.productName !== b.productName) return a.productName.localeCompare(b.productName);
      if (a.color !== b.color) return a.color.localeCompare(b.color);
      
      const indexA = SIZE_ORDER.indexOf(a.size);
      const indexB = SIZE_ORDER.indexOf(b.size);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      return a.size.localeCompare(b.size);
    });

    sortedVariants.forEach(v => {
      const cat = `"${v.categoryName.replace(/"/g, '""')}"`;
      const prod = `"${v.productName.replace(/"/g, '""')}"`;
      const col = `"${v.color.replace(/"/g, '""')}"`;
      const size = `"${v.size.replace(/"/g, '""')}"`;
      const stock = getStock(v.id);
      csvContent += `${cat},${prod},${col},${size},${stock}\n`;
    });

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `stock_tfk_store_${new Date().toISOString().split('T')[0]}.csv`);
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
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid #d1d5db',
              background: activeCategory === cat ? '#111827' : '#fff',
              color: activeCategory === cat ? '#fff' : '#374151',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sticky Top Bar for Saving */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#fff', padding: '12px 16px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={handleSaveAll}
            disabled={!hasUnsavedChanges || isSaving}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: hasUnsavedChanges ? '#2563eb' : '#d1d5db', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: hasUnsavedChanges && !isSaving ? 'pointer' : 'not-allowed',
            }}
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          {saveMessage && <span style={{ fontWeight: 500, fontSize: '0.85rem', color: saveMessage.startsWith('Erreur') ? '#ef4444' : '#10b981' }}>{saveMessage}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={handleExportCSV}
            style={{ 
              padding: '6px 12px', 
              backgroundColor: '#10b981', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              fontWeight: 'bold',
              fontSize: '0.85rem',
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
            Exporter (CSV)
          </button>
          <div style={{ backgroundColor: '#fef3c7', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', color: '#92400e', border: '1px solid #fde68a', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            {activeCategory} RESTANTS : {totalCategoryStock}
          </div>
        </div>
      </div>

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
            <div key={productName} style={{ backgroundColor: '#fff', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
              <div style={{ backgroundColor: '#4f46e5', color: '#fff', padding: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                {productName}
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1e293b', color: '#fff' }}>
                      <th style={{ padding: '6px', width: '120px', borderRight: '1px solid #334155', textTransform: 'uppercase' }}>Couleur</th>
                      {uniqueSizes.map(size => (
                        <th key={size} style={{ padding: '6px', minWidth: '45px', borderRight: '1px solid #334155' }}>{size}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueColors.map((color, idx) => (
                      <tr key={color} style={{ backgroundColor: idx % 2 === 0 ? '#f8fafc' : '#f1f5f9' }}>
                        <td style={{ padding: '8px', fontWeight: 'bold', color: '#0f172a', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase' }}>
                          {color}
                        </td>
                        
                        {uniqueSizes.map(size => {
                          const variant = productVariants.find(v => v.color === color && v.size === size);
                          
                          if (!variant) {
                            return <td key={size} style={{ padding: '6px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#94a3b8' }}>—</td>;
                          }

                          const stockValue = getStock(variant.id);
                          const isDrafted = draftStocks[variant.id] !== undefined;
                          const isZero = stockValue === 0;

                          return (
                            <td key={size} style={{ padding: '2px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', backgroundColor: isZero ? '#fee2e2' : '#dcfce3' }}>
                              <input
                                type="number"
                                value={stockValue}
                                onChange={(e) => handleStockChange(variant.id, e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '6px 2px',
                                  textAlign: 'center',
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                  fontWeight: 'bold',
                                  color: isZero ? '#b91c1c' : '#166534',
                                  outline: isDrafted ? '2px solid #2563eb' : 'none',
                                  borderRadius: '2px',
                                  fontSize: '0.85rem'
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
          <div style={{ padding: '30px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
            Aucun produit dans cette catégorie.
          </div>
        )}
      </div>
    </div>
  );
}
