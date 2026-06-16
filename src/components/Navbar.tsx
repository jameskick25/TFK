'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/utils/translations';

export default function Navbar() {
  const { itemCount, openDrawer } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const t = useTranslation(language);

  const isProductPage = pathname?.startsWith('/product/');
  const headerStyle = isProductPage ? { position: 'relative' as const } : {};

  return (
    <header className="nav-shell" style={headerStyle}>
      {/* Top Banner */}
      <div className="nav-top">
        <span className="dot"></span>
        <span>{t('delivery_everywhere')}</span>
        <span className="dot"></span>
      </div>

      {/* Main Navbar */}
      <nav className="navbar" style={{ padding: '8px 0' }}>
        <div className="container navbar-container">
          
          <Link href="/" className="navbar-logo" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.PNG" alt="AM MODE" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em' }}>AM MODE</span>
          </Link>

          <div className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
            <Link href="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t('home')}</Link>
            <Link href="/catalog" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t('products')}</Link>
            <Link href="/about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t('about')}</Link>
            <Link href="/livraison-retours" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t('delivery_returns')}</Link>
            <Link href="/guide-des-tailles" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t('size_guide')}</Link>
            <Link href="/faq" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t('faq')}</Link>
            <Link href="/contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t('contact')}</Link>
          </div>

          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Language Switcher */}
            <div style={{ display: 'flex', background: 'var(--surface-muted)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <button 
                onClick={() => setLanguage('fr')}
                style={{ 
                  padding: '6px 10px', 
                  border: 'none', 
                  background: language === 'fr' ? '#1a1f36' : 'transparent',
                  color: language === 'fr' ? '#fff' : '#4b5563',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                FR
              </button>
              <button 
                onClick={() => setLanguage('ar')}
                style={{ 
                  padding: '6px 10px', 
                  border: 'none', 
                  background: language === 'ar' ? '#1a1f36' : 'transparent',
                  color: language === 'ar' ? '#fff' : '#4b5563',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                AR
              </button>
            </div>

            <button
              onClick={openDrawer}
              style={{ background: 'var(--accent)', color: 'var(--accent-text)', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>🛒</span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{itemCount}</span>
            </button>
            <button
              className="menu-toggle"
              aria-label="Menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
