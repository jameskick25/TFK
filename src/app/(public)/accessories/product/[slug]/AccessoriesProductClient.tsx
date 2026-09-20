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

export default function AccessoriesProductClient({ product, variants }: { product: any, variants: any[] }) {
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
    const hasColor = colorParam && variants.some(v => (v.color || '').trim().toLowerCase() === colorParam.trim().toLowerCase());
    const initialColor = hasColor ? colorParam : (variants[0]?.color || '');
    const matchingVariant = variants.find(v => (v.color || '').trim().toLowerCase() === (initialColor || '').trim().toLowerCase()) || variants[0];
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

  // Extract unique colors and sizes (sizes represent phone models here)
  const uniqueColors = Array.from(new Set(variants.map(v => v.color).filter(Boolean))) as string[];
  const uniqueModels = Array.from(new Set(variants.map(v => v.size).filter(Boolean))) as string[];

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
    const cNorm = (color || '').trim().toLowerCase();
    const sNorm = (size || '').trim().toLowerCase();
    return variants.find(v => (v.color || '').trim().toLowerCase() === cNorm && (v.size || '').trim().toLowerCase() === sNorm) 
      || variants.find(v => (v.size || '').trim().toLowerCase() === sNorm) 
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
      router.push(`/merci?total=${res.orderTotal || ''}`);
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
    <div className="container" style={{ paddingTop: '8px', paddingBottom: '48px' }}>
      
      {/* Breadcrumbs */}
      <div style={{ marginBottom: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>TFK Store</span> &gt;{' '}
        <span style={{ cursor: 'pointer' }} onClick={() => router.push('/accessories')}>Accessoires Téléphone</span> &gt;{' '}
        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{product.name}</span>
      </div>

      <div className="product-grid">
        
        {/* Left: Product Images */}
        <div>
          <div className="gallery-main" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <img src={mainImage} alt={product.name} />
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((img: any, idx: number) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`${product.name} thumb ${idx}`}
                  className={idx === activeImageIdx ? 'active' : ''}
                  onClick={() => setActiveImageIdx(idx)}
                />
              ))}
            </div>
          )}
          
          {/* Tech Specs (Fiche Technique) */}
          <div style={{ marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>Fiche Technique & Spécifications</h3>
            <div className="specs-list" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
              <div className="specs-item">
                <span className="specs-label">Matériau</span>
                <span className="specs-value">{product.material || "Silicone liquide renforcé (Soft Touch)"}</span>
              </div>
              <div className="specs-item">
                <span className="specs-label">Compatibilité</span>
                <span className="specs-value">Smartphones (selon modèle choisi)</span>
              </div>
              <div className="specs-item">
                <span className="specs-label">Protection</span>
                <span className="specs-value">{product.style || "Anti-choc & Anti-rayures 360°"}</span>
              </div>
              <div className="specs-item">
                <span className="specs-label">Garantie</span>
                <span className="specs-value">6 Mois (Certifié TFK Tech)</span>
              </div>
              <div className="specs-item" style={{ borderBottom: 'none' }}>
                <span className="specs-label">Normes</span>
                <span className="specs-value">Certifié conforme CE / RoHS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info & Checkout Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div>
            <span className="hero-kicker">Accessoire Mobile Premium</span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px', fontFamily: 'var(--font-display)' }}>{product.name}</h1>
            
            {/* Price section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1.6rem' }}>{product.price} {currency}</span>
              {product.old_price && (
                <>
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 500 }}>{product.old_price} {currency}</span>
                  {product.old_price > product.price && (
                    <span style={{ backgroundColor: '#ef4444', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      -{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {product.description}
            </p>
          )}

          {/* Quantity Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{t('quantity')}</span>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
              <button type="button" onClick={() => handleQuantityChange(-1)} style={{ padding: '6px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>-</button>
              <span style={{ padding: '6px 14px', fontWeight: 700, fontSize: '0.9rem', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
              <button type="button" onClick={() => handleQuantityChange(1)} style={{ padding: '6px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>+</button>
            </div>
          </div>

          {/* Selectors list */}
          <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
            <div style={{ fontWeight: 700, marginBottom: '14px', fontSize: '0.9rem', color: 'var(--text)' }}>Sélectionnez vos options :</div>
            
            {selections.map((sel, idx) => {
              const getClaimedStock = (color: string, size: string, excludeIdx: number) => {
                const cNorm = (color || '').trim().toLowerCase();
                const sNorm = (size || '').trim().toLowerCase();
                return selections.reduce((total, currentSel, i) => {
                  if (i !== excludeIdx) {
                    const selCNorm = (currentSel.color || '').trim().toLowerCase();
                    const selSNorm = (currentSel.size || '').trim().toLowerCase();
                    const matchColor = !cNorm || !selCNorm || cNorm === selCNorm;
                    const matchSize = sNorm === selSNorm;
                    if (matchColor && matchSize) {
                      return total + 1;
                    }
                  }
                  return total;
                }, 0);
              };

              const currentVariant = getVariantForSelection(sel.color, sel.size);
              const totalClaimed = getClaimedStock(sel.color, sel.size, -1);
              const isOut = currentVariant ? totalClaimed > currentVariant.stock : true;

              return (
                <div key={idx} style={{ marginBottom: idx < selections.length - 1 ? '16px' : '0' }}>
                  {quantity > 1 && <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>{t('article')} {idx + 1}</div>}
                  
                  {uniqueColors.length > 0 && (
                    <div style={{ marginBottom: uniqueModels.length > 0 ? '12px' : '0' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 500 }}>{t('color')}</div>
                      <div className="option-selectors">
                        {uniqueColors.map(c => {
                          const cNorm = (c || '').trim().toLowerCase();
                          const isOutOfStock = !variants.some(v => {
                            if ((v.color || '').trim().toLowerCase() !== cNorm) return false;
                            const claimed = getClaimedStock(c, v.size, idx);
                            return (v.stock - claimed) > 0;
                          });
                          
                          return (
                            <button 
                              key={c}
                              type="button" 
                              className={`color-btn ${(sel.color || '').trim().toLowerCase() === cNorm ? 'active' : ''}`}
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
                  
                  {uniqueModels.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 500 }}>
                        {uniqueModels.length === 1 && uniqueModels[0] === 'Unique' ? 'Taille / Compatibilité :' : 'Modèle de téléphone :'}
                      </div>
                      <div className="option-selectors">
                        {uniqueModels.map(s => {
                          const sNorm = (s || '').trim().toLowerCase();
                          const cNorm = (sel.color || '').trim().toLowerCase();
                          const variantMatch = variants.find(v => 
                            (v.color || '').trim().toLowerCase() === cNorm && (v.size || '').trim().toLowerCase() === sNorm
                          ) || variants.find(v => (v.size || '').trim().toLowerCase() === sNorm);

                          const claimed = getClaimedStock(sel.color, s, idx);
                          const remainingForThisDropdown = variantMatch ? (variantMatch.stock - claimed) : 0;
                          const isOutOfStock = remainingForThisDropdown <= 0;
                          
                          return (
                            <button 
                              key={s} 
                              type="button"
                              className={`size-btn ${(sel.size || '').trim().toLowerCase() === sNorm ? 'active' : ''}`}
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

                  {sel.color && sel.size && currentVariant && (
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: !isOut ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                      {language === 'ar' ? `المتبقي: ${currentVariant.stock}` : `Stock restant : ${currentVariant.stock}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Checkout Form */}
          <div className="order-form-panel">
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
              {language === 'ar' ? t('form_title') : t('form_title_fr')}
            </div>
            
            {errorMsg && <div style={{ color: 'red', marginBottom: '16px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '6px', fontSize: '0.85rem' }}>{errorMsg}</div>}
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              await handleCheckout(formData);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
                <div style={{ padding: '10px 12px', background: 'var(--surface-muted)', borderRight: '1px solid var(--border)', color: '#666', display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input type="text" name="name" required placeholder={t('fullname')} style={{ border: 'none', padding: '10px', width: '100%' }} />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
                <div style={{ padding: '10px 12px', background: 'var(--surface-muted)', borderRight: '1px solid var(--border)', color: '#666', display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <input type="tel" name="phone" required placeholder={t('phone')} style={{ border: 'none', padding: '10px', width: '100%' }} />
              </div>

              <div>
                <select 
                  name="wilaya_code" 
                  required 
                  value={selectedWilayaCode}
                  onChange={(e) => setSelectedWilayaCode(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
                >
                  <option value="">{t('select_wilaya')}</option>
                  {wilayas.map(w => (
                    <option key={w.code} value={w.code}>{w.code} - {w.nameFr}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 10px', border: `2px solid ${deliveryType === 'home' ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', background: deliveryType === 'home' ? 'rgba(184, 144, 71, 0.05)' : 'transparent', color: deliveryType === 'home' ? 'var(--accent)' : 'inherit', fontSize: '0.95rem', transition: 'all 0.2s', textAlign: 'center' }}>
                  <input type="radio" name="delivery_type" value="home" checked={deliveryType === 'home'} onChange={() => setDeliveryType('home')} style={{ display: 'none' }} />
                  <span style={{ fontWeight: deliveryType === 'home' ? 700 : 500 }}>{t('home_delivery')}</span>
                </label>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 10px', border: `2px solid ${deliveryType === 'office' ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', background: deliveryType === 'office' ? 'rgba(184, 144, 71, 0.05)' : 'transparent', color: deliveryType === 'office' ? 'var(--accent)' : 'inherit', fontSize: '0.95rem', transition: 'all 0.2s', textAlign: 'center' }}>
                  <input type="radio" name="delivery_type" value="office" checked={deliveryType === 'office'} onChange={() => setDeliveryType('office')} style={{ display: 'none' }} />
                  <span style={{ fontWeight: deliveryType === 'office' ? 700 : 500 }}>{t('desk_delivery')}</span>
                </label>
              </div>

              <div>
                {deliveryType === 'home' ? (
                  <select name="commune" required disabled={!selectedWilayaCode} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                    <option value="">{t('select_commune')}</option>
                    {currentCommunes.map((c: any, i: number) => (
                      <option key={i} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <select name="commune" required disabled={!selectedWilayaCode} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                    <option value="">{t('select_desk')}</option>
                    {currentBureaux.map((b: any, i: number) => (
                      <option key={i} value={b.address || b.name}>{b.name} - {b.address}</option>
                    ))}
                  </select>
                )}
              </div>

              {deliveryType === 'home' && (
                <input type="text" name="address" required placeholder={t('address')} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%', backgroundColor: 'var(--surface)' }} />
              )}

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', borderTop: '1px dashed var(--border)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>{t('articles')} ({quantity})</span>
                  <span>{itemsTotal} {currency}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>{t('delivery')}</span>
                  <span>{deliveryCost > 0 ? `${deliveryCost} ${currency}` : '--'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--text)', fontSize: '1.05rem', marginTop: '10px' }}>
                  <span>{t('total_to_pay')}</span>
                  <span style={{ color: 'var(--accent)' }}>{finalTotal} {currency}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                <button type="submit" className="btn btn-primary" disabled={!allInStock || isSubmitting} style={{ padding: '12px', width: '100%', textTransform: 'uppercase' }}>
                  {isSubmitting ? t('loading') : allInStock ? t('order') : t('out_of_stock')}
                </button>
                
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddToCart}
                  disabled={!allInStock}
                  style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  {addedToCart ? t('added') : allInStock ? t('add_to_cart') : t('out_of_stock')}
                </button>
              </div>
            </form>
          </div>
          
        </div>
      </div>

    </div>
  );
}
