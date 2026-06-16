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
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛍</div>
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
                    🗑️
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
                  <div style={{ padding: '10px 12px', background: 'var(--surface-muted)', borderRight: '1px solid var(--border)', color: '#666' }}>👤</div>
                  <input type="text" name="name" required placeholder="Nom et prénom" style={{ border: 'none', padding: '10px', width: '100%', outline: 'none' }} />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 12px', background: 'var(--surface-muted)', borderRight: '1px solid var(--border)', color: '#666' }}>📞</div>
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
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 10px', border: `2px solid ${deliveryType === 'home' ? '#10b981' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', background: deliveryType === 'home' ? '#ecfdf5' : 'transparent', color: deliveryType === 'home' ? '#065f46' : 'inherit', fontSize: '0.95rem', transition: 'all 0.2s', textAlign: 'center' }}>
                    <input type="radio" name="delivery_type" value="home" checked={deliveryType === 'home'} onChange={() => setDeliveryType('home')} style={{ display: 'none' }} />
                    <span style={{ fontWeight: deliveryType === 'home' ? 700 : 500 }}>🏠 À domicile</span>
                  </label>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 10px', border: `2px solid ${deliveryType === 'office' ? '#10b981' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', background: deliveryType === 'office' ? '#ecfdf5' : 'transparent', color: deliveryType === 'office' ? '#065f46' : 'inherit', fontSize: '0.95rem', transition: 'all 0.2s', textAlign: 'center' }}>
                    <input type="radio" name="delivery_type" value="office" checked={deliveryType === 'office'} onChange={() => setDeliveryType('office')} style={{ display: 'none' }} />
                    <span style={{ fontWeight: deliveryType === 'office' ? 700 : 500 }}>🏢 Bureau NOEST</span>
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
                  {isSubmitting ? '⏳ Chargement en cours...' : 'COMMANDER'}
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
