'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/utils/translations';

export default function CartDrawer() {
  const { items, removeItem, updateQty, subtotal, itemCount, isDrawerOpen, closeDrawer } = useCart();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const currency = language === 'ar' ? t('currency_ar') : t('currency');

  return (
    <>
      {/* Overlay */}
      {isDrawerOpen && (
        <div
          className="cart-drawer-overlay"
          onClick={closeDrawer}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 9998,
            opacity: isDrawerOpen ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* Drawer */}
      <div
        className="cart-drawer"
        style={{
          position: 'fixed',
          top: 0,
          right: isDrawerOpen ? 0 : '-420px',
          width: '400px',
          maxWidth: '90vw',
          height: '100vh',
          backgroundColor: 'var(--surface, #fff)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isDrawerOpen ? '-4px 0 30px rgba(0,0,0,0.15)' : 'none',
          transition: 'right 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          borderLeft: '1px solid var(--border, #e5e7eb)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border, #e5e7eb)',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
            {t('cart')} ({itemCount})
          </h3>
          <button
            onClick={closeDrawer}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-muted, #6b7280)',
              padding: '4px',
              lineHeight: 1,
            }}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted, #6b7280)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p>{t('empty_cart')}</p>
              <Link
                href="/catalog"
                className="btn btn-primary btn-sm"
                style={{ marginTop: '20px', display: 'inline-block' }}
                onClick={closeDrawer}
              >
                {t('explore_catalog')}
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.variantId}
                style={{
                  display: 'flex',
                  gap: '14px',
                  padding: '14px 0',
                  borderBottom: '1px solid var(--border, #e5e7eb)',
                  alignItems: 'flex-start',
                }}
              >
                {/* Thumbnail */}
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: '72px',
                    height: '72px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: '1px solid var(--border, #e5e7eb)',
                    flexShrink: 0,
                  }}
                />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #6b7280)', marginBottom: '8px' }}>
                    {[item.color, item.size].filter(Boolean).join(' / ')}
                  </div>

                  {/* Qty + Price row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                      <button
                        onClick={() => updateQty(item.variantId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        style={{
                          width: '28px',
                          height: '28px',
                          border: '1px solid var(--border, #d1d5db)',
                          background: 'var(--surface-muted, #f9fafb)',
                          cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                          borderRadius: '4px 0 0 4px',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: item.quantity <= 1 ? 0.4 : 1,
                        }}
                      >
                        −
                      </button>
                      <span
                        style={{
                          width: '32px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--border, #d1d5db)',
                          borderLeft: 'none',
                          borderRight: 'none',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.variantId, item.quantity + 1)}
                        style={{
                          width: '28px',
                          height: '28px',
                          border: '1px solid var(--border, #d1d5db)',
                          background: 'var(--surface-muted, #f9fafb)',
                          cursor: 'pointer',
                          borderRadius: '0 4px 4px 0',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        +
                      </button>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {item.price * item.quantity} {currency}
                    </span>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.variantId)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: '4px',
                    flexShrink: 0,
                  }}
                  aria-label={`Supprimer ${item.name}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--border, #e5e7eb)',
              backgroundColor: 'var(--surface-muted, #f9fafb)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                fontSize: '1.05rem',
              }}
            >
              <span style={{ fontWeight: 500 }}>{t('subtotal')}</span>
              <span style={{ fontWeight: 700 }}>{subtotal} {currency}</span>
            </div>
            <Link
              href="/cart"
              className="btn btn-primary"
              style={{ width: '100%', display: 'block', textAlign: 'center' }}
              onClick={closeDrawer}
            >
              {t('view_cart_checkout')}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
