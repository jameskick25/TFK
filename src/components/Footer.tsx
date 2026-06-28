'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/utils/translations';
import Link from 'next/link';

export default function Footer() {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const isAr = language === 'ar';

  return (
    <footer style={{ flexShrink: 0, backgroundColor: 'var(--bg-dark)', color: '#f3f4f6', paddingTop: '60px', paddingBottom: '20px', direction: isAr ? 'rtl' : 'ltr' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '40px' }}>
        
        {/* Brand Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <img src="/logo.jpg" alt="TFK Store" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ fontWeight: 800, fontSize: '1.6rem', color: '#fff', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>TFK Store</span>
          </div>
          <p style={{ color: '#9ca3af', lineHeight: 1.8, marginBottom: '20px', fontSize: '0.95rem' }}>
            {isAr ? 'ملابس عصرية وإكسسوارات هواتف مميزة تناسب أسلوب حياتكم.' : 'Vêtements modernes et accessoires de téléphone premium adaptés à votre style de vie.'}
          </p>
        </div>

        {/* Links Column */}
        <div>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600 }}>
            {isAr ? 'روابط سريعة' : 'Liens Utiles'}
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><Link href="/" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}>{t('home')}</Link></li>
            <li><Link href="/livraison-retours" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}>{t('delivery_returns')}</Link></li>
            <li><Link href="/faq" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}>{t('faq')}</Link></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600 }}>
            {isAr ? 'اتصل بنا' : 'Contactez-nous'}
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: '#9ca3af' }}>
            <li><a href="tel:+213554140339" style={{ color: '#9ca3af', textDecoration: 'none' }}>📞 +213 5 54140339</a></li>
            <li><a href="https://www.instagram.com/tfk_stor_e?igsh=eWhhOXF2b3FsbGdo" target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>📸 Instagram</a></li>
            <li><a href="https://www.facebook.com/tfk_store" target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>📘 Facebook</a></li>
            <li><Link href="/contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>✉️ {t('contact')}</Link></li>
          </ul>
        </div>

      </div>
      
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
        <p style={{ margin: 0, marginBottom: '8px' }}>
          {isAr ? 'التوصيل لجميع الولايات — الدفع عند الاستلام' : 'Livraison dans toutes les wilayas — Paiement à la livraison'}
        </p>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} TFK Store. {t('rights')}</p>
      </div>
    </footer>
  );
}
