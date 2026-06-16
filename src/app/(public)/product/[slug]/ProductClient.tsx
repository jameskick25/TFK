'use client';

import { useState, useMemo } from 'react';
import { useCart } from '@/components/CartProvider';
import { processCartCheckout } from '@/app/actions/checkout';
import communesData from '@/data/communes.json';
import bureauxData from '@/data/bureaux.json';
import { wilayas, getDeliveryCost } from '@/data/delivery-data';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/utils/translations';

export default function ProductClient({ product, variants }: { product: any, variants: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const { language } = useLanguage();
  const t = useTranslation(language);

  const { addItem } = useCart();

  const searchParams = useSearchParams();
  const colorParam = searchParams.get('color');

  // Multi-item selections
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState(() => {
    const hasColor = colorParam && variants.some(v => v.color === colorParam);
    const initialColor = hasColor ? colorParam : (variants[0]?.color || '');
    
    // Find a size that matches the color
    const matchingVariant = variants.find(v => v.color === initialColor);
    return [{ color: initialColor, size: matchingVariant?.size || variants[0]?.size || '' }];
  });

  const [activeImageIdx, setActiveImageIdx] = useState(() => {
    if (colorParam) {
      const images = product.product_images || [];
      const imageIdx = images.findIndex((img: any) => 
        img.color && img.color.toLowerCase().trim() === colorParam.toLowerCase().trim()
      );
      if (imageIdx !== -1) return imageIdx;
    }
    return 0;
  });

  // Delivery state
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('');
  const [deliveryType, setDeliveryType] = useState<'home' | 'office'>('home');

  // Extract unique colors and sizes
  const uniqueColors = Array.from(new Set(variants.map(v => v.color).filter(Boolean))) as string[];
  const uniqueSizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean))) as string[];

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
    if (delta > 0) {
      setSelections([...selections, { color: selections[0].color, size: selections[0].size }]);
    } else {
      setSelections(selections.slice(0, -1));
    }
  };

  const updateSelection = (index: number, field: 'color' | 'size', value: string) => {
    const newSelections = [...selections];
    newSelections[index] = { ...newSelections[index], [field]: value };
    setSelections(newSelections);

    // Si on change de couleur, on cherche si une image correspond à cette couleur
    if (field === 'color') {
      const images = product.product_images || [];
      const imageIdx = images.findIndex((img: any) => 
        img.color && img.color.toLowerCase().trim() === value.toLowerCase().trim()
      );
      if (imageIdx !== -1) {
        setActiveImageIdx(imageIdx);
      }
    }
  };

  const getVariantForSelection = (color: string, size: string) => {
    return variants.find(v => v.color === color && v.size === size) 
      || variants.find(v => v.size === size) 
      || variants[0];
  };

  const allInStock = useMemo(() => {
    const requirements: Record<string, number> = {};
    for (const sel of selections) {
      const v = getVariantForSelection(sel.color, sel.size);
      if (!v) return false;
      requirements[v.id] = (requirements[v.id] || 0) + 1;
    }
    for (const [vId, reqQty] of Object.entries(requirements)) {
      const variant = variants.find(v => v.id === vId);
      if (!variant || variant.stock < reqQty) return false;
    }
    return true;
  }, [selections, variants]);

  function handleAddToCart() {
    if (!allInStock) return;
    const mainImage = product.product_images?.find((img: any) => img.is_main)?.url || product.product_images?.[0]?.url || '/placeholder.jpg';
    selections.forEach(sel => {
      const variant = getVariantForSelection(sel.color, sel.size);
      if (variant) {
        addItem({
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          image: mainImage,
          color: variant.color || '',
          size: variant.size || '',
          price: product.price,
          slug: product.slug,
        });
      }
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  async function handleCheckout(formData: FormData) {
    if (!allInStock) return;
    setIsSubmitting(true);
    setErrorMsg('');

    const cartItems = selections.map(sel => {
      const variant = getVariantForSelection(sel.color, sel.size);
      return {
        variantId: variant.id,
        quantity: 1,
        productName: product.name,
        variantInfo: `${variant.color || ''} - ${variant.size || ''}`.trim(),
        priceAtTime: product.price
      };
    });

    formData.append('cart_items', JSON.stringify(cartItems));

    const wilayaObj = wilayas.find(w => w.code === selectedWilayaCode);
    if (wilayaObj) {
      formData.append('wilaya_name', wilayaObj.nameFr);
    }
    
    const res = await processCartCheckout(formData);
    
    if (res?.error) {
      setErrorMsg(res.error);
      setIsSubmitting(false);
    } else if (res?.success) {
      router.push('/merci');
    }
  }

  const images = product.product_images || [];
  const mainImage = images[activeImageIdx]?.url || images.find((img: any) => img.is_main)?.url || images[0]?.url || '/placeholder.jpg';

  const currentCommunes = selectedWilayaCode ? ((communesData as any)[selectedWilayaCode] || []) : [];
  const currentBureaux = selectedWilayaCode ? ((bureauxData as any)[selectedWilayaCode] || []) : [];
  
  const itemsTotal = product.price * quantity;
  const deliveryCost = getDeliveryCost(selectedWilayaCode, deliveryType);
  const finalTotal = itemsTotal + deliveryCost;
  const currency = language === 'ar' ? t('currency_ar') : t('currency');

  return (
    <div className="product-page" style={{ padding: '20px 16px' }}>
      <div className="product-grid" style={{ gap: '20px' }}>
        
        {/* Gallery */}
        <div className="product-gallery">
          <div className="gallery-main">
            <img src={mainImage} alt={product.name} style={{ borderRadius: '4px' }} />
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbs" style={{ gap: '8px', marginTop: '8px' }}>
              {images.map((img: any, idx: number) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`${product.name} ${idx}`}
                  className={idx === activeImageIdx ? 'active' : ''}
                  onClick={() => setActiveImageIdx(idx)}
                  style={{ cursor: 'pointer', width: '60px', height: '60px', borderRadius: '4px' }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info & Checkout */}
        <div className="product-info-panel" style={{ fontSize: '0.95rem', position: 'relative' }}>
          <h1 className="product-title" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{product.name}</h1>
          
          <div className="product-price-large" style={{ fontSize: '1.3rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#6366f1', fontWeight: 800 }}>{product.price} {currency}</span>
            {product.old_price && (
              <>
                <span className="old" style={{ fontSize: '1rem', color: '#9ca3af', textDecoration: 'line-through', fontWeight: 500 }}>{product.old_price} {currency}</span>
                {product.old_price > product.price && (
                  <span style={{ 
                    backgroundColor: '#ef4444', 
                    color: '#fff', 
                    padding: '4px 8px', 
                    borderRadius: '6px', 
                    fontSize: '0.85rem', 
                    fontWeight: 'bold',
                    marginLeft: '4px'
                  }}>
                    -{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                  </span>
                )}
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>{t('quantity')}</span>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <button type="button" onClick={() => handleQuantityChange(-1)} style={{ padding: '4px 12px', background: '#f9fafb', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#374151' }}>-</button>
              <span style={{ padding: '4px 12px', fontWeight: 600, fontSize: '0.9rem', borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', width: '40px', textAlign: 'center' }}>{quantity}</span>
              <button type="button" onClick={() => handleQuantityChange(1)} style={{ padding: '4px 12px', background: '#f9fafb', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#374151' }}>+</button>
            </div>
          </div>

          <div style={{ padding: '0 0 16px 0', borderBottom: '1px dashed #eee', marginBottom: '16px' }}>
            <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '0.9rem', color: '#555' }}>{t('sizes_colors')}</div>
            
            {selections.map((sel, idx) => {
              const getClaimedStock = (color: string, size: string, excludeIdx: number) => {
                return selections.reduce((total, currentSel, i) => {
                  if (i !== excludeIdx && currentSel.color === color && currentSel.size === size) {
                    return total + 1;
                  }
                  return total;
                }, 0);
              };

              const currentVariant = getVariantForSelection(sel.color, sel.size);
              const totalClaimed = getClaimedStock(sel.color, sel.size, -1); // -1 means count all
              const globalRemaining = currentVariant ? currentVariant.stock - totalClaimed : 0;

              return (
                <div key={idx} style={{ marginBottom: idx < selections.length - 1 ? '16px' : '0' }}>
                  {quantity > 1 && <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>{t('article')} {idx + 1}</div>}
                  
                  {uniqueColors.length > 0 && (
                    <div style={{ marginBottom: uniqueSizes.length > 0 ? '12px' : '0' }}>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '6px' }}>{t('color')}</div>
                      <div className="option-selectors">
                        {uniqueColors.map(c => {
                          const isOutOfStock = !variants.some(v => {
                            if (v.color !== c) return false;
                            const claimed = getClaimedStock(c, v.size, idx);
                            return (v.stock - claimed) > 0;
                          });
                          
                          return (
                            <button 
                              key={c}
                              type="button" 
                              className={`color-btn ${sel.color === c ? 'active' : ''}`}
                              onClick={() => updateSelection(idx, 'color', c)}
                              disabled={isOutOfStock}
                            >
                              {c}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                  {uniqueSizes.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>{t('size')}</div>
                      <div className="option-selectors">
                        {uniqueSizes.map(s => {
                          const variantMatch = variants.find(v => v.color === sel.color && v.size === s);
                          const claimed = getClaimedStock(sel.color, s, idx);
                          const remainingForThisDropdown = variantMatch ? variantMatch.stock - claimed : 0;
                          const isOutOfStock = remainingForThisDropdown <= 0;
                          
                          return (
                            <button 
                              key={s} 
                              type="button"
                              className={`size-btn ${sel.size === s ? 'active' : ''}`}
                              onClick={() => updateSelection(idx, 'size', s)}
                              disabled={isOutOfStock}
                            >
                              {s}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Show remaining stock indicator */}
                  {sel.color && sel.size && currentVariant && (
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: totalClaimed <= currentVariant.stock ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                      {language === 'ar' ? `المتبقي: ${currentVariant.stock}` : `Reste : ${currentVariant.stock}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Compact Checkout Form */}
          <div className="order-form-panel" style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>
              {language === 'ar' ? t('form_title') : t('form_title_fr')}
            </div>
            
            {errorMsg && <div style={{ color: 'red', marginBottom: '12px', padding: '8px', backgroundColor: '#fee2e2', borderRadius: '4px', fontSize: '0.85rem' }}>{errorMsg}</div>}
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              await handleCheckout(formData);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ padding: '10px 12px', background: 'var(--surface-muted)', borderRight: '1px solid var(--border)', color: '#666' }}>👤</div>
                <input type="text" name="name" required placeholder={t('fullname')} style={{ border: 'none', padding: '10px', width: '100%' }} />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ padding: '10px 12px', background: 'var(--surface-muted)', borderRight: '1px solid var(--border)', color: '#666' }}>📞</div>
                <input type="tel" name="phone" required placeholder={t('phone')} style={{ border: 'none', padding: '10px', width: '100%' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <select 
                  name="wilaya_code" 
                  required 
                  value={selectedWilayaCode}
                  onChange={(e) => setSelectedWilayaCode(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                >
                  <option value="">{t('select_wilaya')}</option>
                  {wilayas.map(w => (
                    <option key={w.code} value={w.code}>{w.code} - {w.nameFr}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 10px', border: `2px solid ${deliveryType === 'home' ? '#10b981' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', background: deliveryType === 'home' ? '#ecfdf5' : 'transparent', color: deliveryType === 'home' ? '#065f46' : 'inherit', fontSize: '0.95rem', transition: 'all 0.2s', textAlign: 'center' }}>
                  <input type="radio" name="delivery_type" value="home" checked={deliveryType === 'home'} onChange={() => setDeliveryType('home')} style={{ display: 'none' }} />
                  <span style={{ fontWeight: deliveryType === 'home' ? 700 : 500 }}>{t('home_delivery')}</span>
                </label>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 10px', border: `2px solid ${deliveryType === 'office' ? '#10b981' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', background: deliveryType === 'office' ? '#ecfdf5' : 'transparent', color: deliveryType === 'office' ? '#065f46' : 'inherit', fontSize: '0.95rem', transition: 'all 0.2s', textAlign: 'center' }}>
                  <input type="radio" name="delivery_type" value="office" checked={deliveryType === 'office'} onChange={() => setDeliveryType('office')} style={{ display: 'none' }} />
                  <span style={{ fontWeight: deliveryType === 'office' ? 700 : 500 }}>{t('desk_delivery')}</span>
                </label>
              </div>

              <div style={{ marginBottom: '12px' }}>
                {deliveryType === 'home' ? (
                  <select name="commune" required disabled={!selectedWilayaCode} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <option value="">{t('select_commune')}</option>
                    {currentCommunes.map((c: any, i: number) => (
                      <option key={i} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <select name="commune" required disabled={!selectedWilayaCode} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <option value="">{t('select_desk')}</option>
                    {currentBureaux.map((b: any, i: number) => (
                      <option key={i} value={b.address || b.name}>{b.name} - {b.address}</option>
                    ))}
                  </select>
                )}
              </div>

              {deliveryType === 'home' && (
                <input type="text" name="address" required placeholder={t('address')} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', width: '100%' }} />
              )}

              <div className="price-summary" style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>{t('articles')} ({quantity})</span>
                  <span>{itemsTotal} {currency}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>{t('delivery')}</span>
                  <span>{deliveryCost > 0 ? `${deliveryCost} ${currency}` : '--'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#000', fontSize: '1rem', marginTop: '8px' }}>
                  <span>{t('total_to_pay')}</span>
                  <span>{finalTotal} {currency}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary" disabled={!allInStock || isSubmitting} style={{ flex: 1, padding: '12px', background: '#2c2c3e', color: '#fff', border: 'none', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                  {isSubmitting ? t('loading') : allInStock ? t('order') : t('out_of_stock')}
                </button>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddToCart}
                disabled={!allInStock}
                style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '4px', background: '#fff', color: '#333', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                {addedToCart ? t('added') : allInStock ? t('add_to_cart') : t('out_of_stock')}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
