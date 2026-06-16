'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function MerciPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <section className="section" style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh', direction: isAr ? 'rtl' : 'ltr' }}>
      <div className="container">
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
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
