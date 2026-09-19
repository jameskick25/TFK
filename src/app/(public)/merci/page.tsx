'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function MerciPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <section className="section" style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh', direction: isAr ? 'rtl' : 'ltr' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#ecfdf5', border: '2px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <h1 className="section-title">
          {isAr ? 'شكراً لطلبك!' : 'Merci pour votre commande !'}
        </h1>
        <p className="section-subtitle" style={{ margin: '0 auto 20px', fontWeight: 600 }}>
          {isAr 
            ? 'لقد تم تسجيل طلبك بنجاح. سيتصل بك فريقنا قريباً لتأكيد التوصيل.' 
            : 'Votre commande a bien été enregistrée. Notre équipe vous contactera très prochainement pour confirmer la livraison.'}
        </p>
        <p style={{ color: '#4b5563', marginBottom: '40px', fontSize: '1.1rem', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', display: 'inline-block' }}>
          {isAr 
            ? 'سيتم تغليف طلبك وشحنه، وستستلمه خلال 24-48 ساعة حسب ولايتك.' 
            : 'Votre commande va être emballée et expédiée, et vous la recevrez dans 24-48 h selon votre wilaya.'}
        </p>
        <div>
          <Link href="/catalog" className="btn btn-primary btn-lg">
            {isAr ? 'العودة إلى المنتجات' : 'Retour au catalogue'}
          </Link>
        </div>
      </div>
    </section>
  );
}
