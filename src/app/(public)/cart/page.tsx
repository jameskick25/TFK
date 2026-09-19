'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import communesData from '@/data/communes.json';
import bureauxData from '@/data/bureaux.json';
import { wilayas, getDeliveryCost } from '@/data/delivery-data';
import { processCartCheckout } from '@/app/actions/checkout';

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, itemCount, clearCart } = useCart();

  const [wilayaCode, setWilayaCode] = useState('');
  const [deliveryType, setDeliveryType] = useState<'home' | 'office'>('home');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const deliveryCost = wilayaCode ? getDeliveryCost(wilayaCode, deliveryType) : 0;
  const orderTotal = subtotal + deliveryCost;

  const selectedWilaya = wilayas.find(w => w.code === wilayaCode);

  const currentCommunes = wilayaCode ? ((communesData as any)[wilayaCode] || []) : [];
  const currentBureaux = wilayaCode ? ((bureauxData as any)[wilayaCode] || []) : [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);

    // Add cart items as JSON
    const cartItems = items.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity,
      productName: item.name,
      variantInfo: [item.color, item.size].filter(Boolean).join(' - '),
      priceAtTime: item.price,
    }));

    formData.set('cart_items', JSON.stringify(cartItems));
    formData.set('wilaya_code', wilayaCode);
    formData.set('wilaya_name', selectedWilaya?.nameFr || '');
    formData.set('delivery_type', deliveryType);
    formData.set('items_total', String(subtotal));
    formData.set('delivery_cost', String(deliveryCost));
    formData.set('order_total', String(orderTotal));

    const result = await processCartCheckout(formData);

    if (result?.error) {
      setErrorMsg(result.error);
      setIsSubmitting(false);
    } else {
      // Success — clear cart and redirect
      clearCart();
      window.location.href = '/merci';
    }
  }

  if (items.length === 0) {
    return (
      <section className="section" style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h1 className="section-title">Votre Panier est Vide</h1>
          <p className="section-subtitle" style={{ margin: '0 auto 40px' }}>
            Explorez notre catalogue pour trouver des pièces qui vous correspondent.
          </p>
          <Link href="/catalog" className="btn btn-primary btn-lg">
            Explorer le catalogue
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ paddingTop: '32px' }}>
      <div className="container">
        <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '32px', fontSize: '1.8rem' }}>
          Panier ({itemCount})
        </h1>

        <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', alignItems: 'start' }}>

          {/* LEFT: Cart Items */}
          <div style={{ background: 'var(--surface, #fff)', borderRadius: '8px', padding: '0 0 24px 0' }}>
            {items.map((item) => (
              <div
                key={item.variantId}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px 0',
                  borderBottom: '1px solid var(--border, #e5e7eb)',
                  alignItems: 'center',
                }}
              >
                {/* Image */}
                <Link href={`/product/${item.slug}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      backgroundColor: 'var(--surface-muted)'
                    }}
                  />
                </Link>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <Link href={`/product/${item.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '0.95rem' }}>{item.name}</div>
                  </Link>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {[item.color, item.size].filter(Boolean).join(' - ')}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Qty controls */}
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '4px' }}>
                      <button
                        onClick={() => updateQty(item.variantId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        style={{
                          width: '28px', height: '28px',
                          background: 'none', border: 'none',
                          cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                          fontSize: '1rem',
                          opacity: item.quantity <= 1 ? 0.4 : 1,
                        }}
                      >−</button>
                      <span style={{
                        width: '30px', height: '28px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 600, fontSize: '0.9rem'
                      }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.variantId, item.quantity + 1)}
                        style={{
                          width: '28px', height: '28px',
                          background: 'none', border: 'none',
                          cursor: 'pointer',
                          fontSize: '1rem',
                        }}
                      >+</button>
                    </div>

                    {/* Unit price */}
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {item.price} دج
                    </span>
                  </div>
                </div>

                {/* Line total + remove */}
                <div style={{ textAlign: 'right', minWidth: '80px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                    {item.price * item.quantity} دج
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    style={{
                      background: 'none', border: 'none',
                      color: 'var(--text-muted)', cursor: 'pointer',
                      fontSize: '1.2rem', padding: '4px'
                    }}
                    title="Supprimer"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            <div style={{ marginTop: '24px' }}>
              <Link href="/catalog" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                Continuer les achats
              </Link>
            </div>
          </div>

          {/* RIGHT: Checkout Form */}
          <div>
            <div className="order-form-panel" style={{ padding: 0, background: 'transparent', border: 'none' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>أدخل معلوماتك أسفله للطلب</div>
              
              {errorMsg && <div style={{ color: 'red', marginBottom: '12px', padding: '8px', backgroundColor: '#fee2e2', borderRadius: '4px', fontSize: '0.85rem' }}>{errorMsg}</div>}
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 12px', background: 'var(--surface-muted)', borderRight: '1px solid var(--border)', color: '#666', display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <input type="text" name="name" required placeholder="Nom et prénom" style={{ border: 'none', padding: '10px', width: '100%', outline: 'none' }} />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 12px', background: 'var(--surface-muted)', borderRight: '1px solid var(--border)', color: '#666', display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <input type="tel" name="phone" required placeholder="Téléphone" style={{ border: 'none', padding: '10px', width: '100%', outline: 'none' }} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <select 
                    name="wilaya_code" 
                    required 
                    value={wilayaCode}
                    onChange={(e) => setWilayaCode(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }}
                  >
                    <option value="">Sélectionner une Wilaya</option>
                    {wilayas.map(w => (
                      <option key={w.code} value={w.code}>{w.code} - {w.nameFr}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 10px', border: `2px solid ${deliveryType === 'home' ? '#10b981' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', background: deliveryType === 'home' ? '#ecfdf5' : 'transparent', color: deliveryType === 'home' ? '#065f46' : 'inherit', fontSize: '0.95rem', transition: 'all 0.2s', textAlign: 'center' }}>
                    <input type="radio" name="delivery_type" value="home" checked={deliveryType === 'home'} onChange={() => setDeliveryType('home')} style={{ display: 'none' }} />
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span style={{ fontWeight: deliveryType === 'home' ? 700 : 500 }}>À domicile</span>
                  </label>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 10px', border: `2px solid ${deliveryType === 'office' ? '#10b981' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', background: deliveryType === 'office' ? '#ecfdf5' : 'transparent', color: deliveryType === 'office' ? '#065f46' : 'inherit', fontSize: '0.95rem', transition: 'all 0.2s', textAlign: 'center' }}>
                    <input type="radio" name="delivery_type" value="office" checked={deliveryType === 'office'} onChange={() => setDeliveryType('office')} style={{ display: 'none' }} />
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                      <line x1="9" y1="22" x2="9" y2="22.01" />
                      <line x1="15" y1="22" x2="15" y2="22.01" />
                      <line x1="8" y1="6" x2="10" y2="6" />
                      <line x1="14" y1="6" x2="16" y2="6" />
                      <line x1="8" y1="10" x2="10" y2="10" />
                      <line x1="14" y1="10" x2="16" y2="10" />
                    </svg>
                    <span style={{ fontWeight: deliveryType === 'office' ? 700 : 500 }}>Bureau NOEST</span>
                  </label>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  {deliveryType === 'home' ? (
                    <select name="commune" required disabled={!wilayaCode} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }}>
                      <option value="">Sélectionner une Commune</option>
                      {currentCommunes.map((c: any, i: number) => (
                        <option key={i} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <select name="commune" required disabled={!wilayaCode} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }}>
                      <option value="">Sélectionner un Bureau NOEST</option>
                      {currentBureaux.map((b: any, i: number) => (
                        <option key={i} value={b.address || b.name}>{b.name} - {b.address}</option>
                      ))}
                    </select>
                  )}
                </div>

                {deliveryType === 'home' && (
                  <input type="text" name="address" required placeholder="Adresse complète" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', width: '100%', outline: 'none' }} />
                )}

                <div className="price-summary" style={{ fontSize: '0.9rem', color: '#666', marginTop: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Articles ({itemCount})</span>
                    <span>{subtotal} دج</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Livraison {wilayaCode ? `(${deliveryType === 'home' ? 'Domicile' : 'Bureau NOEST'})` : ''}</span>
                    <span>{wilayaCode ? `${deliveryCost} دج` : '--'}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#000', fontSize: '1.2rem', marginTop: '8px', marginBottom: '16px' }}>
                  <span>Total à payer</span>
                  <span>{orderTotal} دج</span>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSubmitting || items.length === 0} style={{ width: '100%', padding: '14px', background: '#2c2c3e', color: '#fff', border: 'none', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600, fontSize: '1rem' }}>
                  {isSubmitting ? 'Traitement en cours...' : 'COMMANDER'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .cart-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
