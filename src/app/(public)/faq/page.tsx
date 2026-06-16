'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const faqItemsFr = [
  {
    question: "Comment puis-je passer commande ?",
    answer: "Vous pouvez passer commande directement sur notre site. Choisissez votre article, sélectionnez le modèle (pour les T-shirts), la couleur ainsi que votre taille, puis remplissez notre formulaire d'achat rapide. Vous recevrez ensuite un appel de validation de notre service client sous 24h.",
  },
  {
    question: "Quels sont les modes et tarifs de livraison ?",
    answer: "Nous livrons dans les 58 wilayas d'Algérie en partenariat avec Noest Express. Deux options s'offrent à vous : la livraison à domicile ou le retrait dans l'un des bureaux de Noest Express. Les frais sont calculés automatiquement dans votre panier en fonction de votre wilaya de destination.",
  },
  {
    question: "Quels sont les délais de livraison ?",
    answer: "Les délais de livraison varient de 24h à 72h selon votre wilaya de résidence. Une fois votre commande validée par téléphone avec notre service client, votre colis est expédié le jour même ou le lendemain.",
  },
  {
    question: "Comment s'effectue le paiement ?",
    answer: "Le paiement s'effectue exclusivement en espèces à la livraison (Paiement COD - Cash on Delivery). Vous réglez directement le livreur lorsque vous recevez et vérifiez votre colis.",
  },
  {
    question: "Puis-je essayer et échanger l'article si la taille ne me convient pas ?",
    answer: "Oui, absolument. Nous offrons une garantie d'échange de taille gratuite sous 3 jours. Si le vêtement ne convient pas, contactez notre service client par téléphone ou sur nos réseaux sociaux.",
  },
];

const faqItemsAr = [
  {
    question: "كيف يمكنني تقديم طلب؟",
    answer: "يمكنك تقديم طلب مباشرة على موقعنا. اختر المنتج، حدد اللون والمقاس، ثم املأ نموذج الشراء السريع. ستتلقى بعد ذلك مكالمة لتأكيد الطلب من خدمة العملاء خلال 24 ساعة.",
  },
  {
    question: "ما هي طرق وأسعار التوصيل؟",
    answer: "نوصل إلى 58 ولاية في الجزائر بالشراكة مع Noest Express. لديك خياران: التوصيل إلى المنزل أو الاستلام من أحد مكاتب Noest Express. يتم حساب الرسوم تلقائيًا بناءً على ولايتك.",
  },
  {
    question: "ما هي مدة التوصيل؟",
    answer: "تتراوح مدة التوصيل بين 24 و 72 ساعة حسب ولايتك. بمجرد تأكيد طلبك هاتفيًا، يتم شحن طردك في نفس اليوم أو في اليوم التالي.",
  },
  {
    question: "كيف يتم الدفع؟",
    answer: "الدفع يتم حصرًا نقدًا عند الاستلام. تدفع مباشرة لعامل التوصيل عند استلام طردك والتحقق منه.",
  },
  {
    question: "هل يمكنني استبدال المنتج إذا لم يكن المقاس مناسبًا؟",
    answer: "نعم، بالتأكيد. نوفر إمكانية تغيير المقاس خلال 3 أيام. إذا لم يكن المقاس مناسبًا، تواصل مع خدمة العملاء وسنقوم بترتيب عملية التبديل.",
  },
];

export default function FAQPage() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const { language } = useLanguage();
  const isAr = language === 'ar';
  
  const items = isAr ? faqItemsAr : faqItemsFr;

  return (
    <>
      <section
        style={{
          background: 'linear-gradient(180deg, var(--surface-muted) 0%, var(--bg) 100%)',
          padding: '80px 20px',
          textAlign: 'center',
          borderBottom: '1px solid var(--border)',
          direction: isAr ? 'rtl' : 'ltr',
        }}
      >
        <div className="container">
          <span className="hero-kicker">{isAr ? 'الأسئلة الشائعة' : 'FAQ'}</span>
          <h1 className="section-title">{isAr ? 'الأسئلة المتكررة' : 'Questions Fréquentes'}</h1>
          <p className="section-subtitle">
            {isAr ? 'ابحث عن إجابات سريعة لجميع أسئلتك بخصوص مشترياتك.' : 'Trouvez des réponses rapides à toutes vos questions concernant vos achats.'}
          </p>
        </div>
      </section>

      <section className="section" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="accordion">
            {items.map((item, idx) => (
              <div
                key={idx}
                className={`accordion-item ${activeIdx === idx ? 'active' : ''}`}
                style={{
                  border: '1px solid var(--border, #e5e7eb)',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
              >
                <button
                  onClick={() => setActiveIdx(activeIdx === idx ? null : idx)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    background: activeIdx === idx ? 'var(--surface-muted, #f9fafb)' : 'var(--surface, #fff)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '1rem',
                    textAlign: isAr ? 'right' : 'left',
                    color: 'inherit',
                    fontFamily: 'inherit',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <span>{item.question}</span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      transform: activeIdx === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      flexShrink: 0,
                      marginLeft: isAr ? '0' : '16px',
                      marginRight: isAr ? '16px' : '0',
                    }}
                  >
                    ▼
                  </span>
                </button>
                <div
                  style={{
                    maxHeight: activeIdx === idx ? '300px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.35s ease, padding 0.35s ease',
                    padding: activeIdx === idx ? '0 24px 20px 24px' : '0 24px',
                  }}
                >
                  <p style={{ color: 'var(--text-muted, #6b7280)', lineHeight: 1.7, margin: 0, textAlign: isAr ? 'right' : 'left' }}>
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
